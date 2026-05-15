const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

loadEnv();

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const dataDir = path.join(__dirname, "data");
const reportFile = path.join(dataDir, "reports.json");
const maxBodyMb = Number(process.env.MAX_UPLOAD_MB || 60);

const bailianKey = process.env.BAILIAN_API_KEY || process.env.DASHSCOPE_API_KEY || "";
const openaiKey = process.env.OPENAI_API_KEY || "";
const aiProvider = process.env.AI_PROVIDER || (bailianKey ? "bailian" : "openai");
const aiKey = aiProvider === "bailian" ? bailianKey : openaiKey;
const aiBaseUrl =
  aiProvider === "bailian"
    ? process.env.BAILIAN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
    : process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const aiModel =
  aiProvider === "bailian"
    ? process.env.BAILIAN_MODEL || "qwen-vl-plus-latest"
    : process.env.OPENAI_MODEL || "gpt-4.1-mini";

const platforms = {
  facebook: "Facebook 广告投放",
  instagram: "Instagram 媒体/广告",
  wechat: "微信视频号自媒体/投放",
  rednote: "小红书自媒体/投放",
  youtube: "YouTube 内容/广告友好度",
};

const sourceLinks = [
  ["Meta Advertising Standards", "https://transparency.meta.com/policies/ad-standards/"],
  ["Meta Community Standards", "https://transparency.meta.com/policies/community-standards/"],
  ["Instagram Community Guidelines", "https://help.instagram.com/477434105621119"],
  ["微信视频号平台规则中心", "https://channels.weixin.qq.com/platform_rules"],
  ["腾讯广告帮助中心", "https://e.qq.com/ads/helpcenter/"],
  ["小红书社区规范/公约", "https://agree.xiaohongshu.com/h5/terms/ZXXY20221213003/-1"],
  ["小红书蒲公英/商业合作规范", "https://pgy.xiaohongshu.com/"],
  ["YouTube Community Guidelines", "https://support.google.com/youtube/answer/9288567"],
  ["YouTube Advertiser-friendly Content Guidelines", "https://support.google.com/youtube/answer/6162278"],
  ["Google Ads Video Ad Requirements", "https://support.google.com/adspolicy/answer/2679940"],
];

const keywordRules = [
  {
    level: "高",
    title: "禁售或强监管品类",
    pattern: /赌博|博彩|枪支|弹药|毒品|大麻|电子烟|色情|裸聊|假证|刷单|外挂|洗钱/g,
    fix: "删除交易、联系方式、诱导购买和画面露出；如为合规科普，明确非交易、非引流并补充资质。",
  },
  {
    level: "高",
    title: "医疗健康功效承诺过强",
    pattern: /根治|治愈|包治|药到病除|永久消除|无副作用|处方药|特效药|医美|注射|玻尿酸|抽脂/g,
    fix: "改为客观说明成分、适用条件、风险提示和资质，不承诺治疗结果。",
  },
  {
    level: "高",
    title: "直接断言用户个人属性",
    pattern: /你(是否|是不是|正在|已经).{0,12}(肥胖|脱发|负债|离婚|怀孕|抑郁|焦虑|患有|信用差)/g,
    fix: "避免“你有某问题”的第二人称判断，改为中性场景表达。",
  },
  {
    level: "中",
    title: "绝对化或保证性表述",
    pattern: /100%|百分百|零风险|稳赚|保本|全网最低|全国第一|唯一|最强|永久|7天见效|当天见效/g,
    fix: "用可证明、可限定的表达替代，例如“部分用户反馈”“以页面实际规则为准”。",
  },
  {
    level: "中",
    title: "前后对比或制造外貌焦虑",
    pattern: /前后对比|before\s*after|使用前|使用后|暴瘦|瘦\d+斤|丑|自卑|逆袭变美/g,
    fix: "减少身体部位特写和羞辱性表达，改为过程展示和非保证结果。",
  },
  {
    level: "中",
    title: "站外导流或私下交易引导",
    pattern: /加微|加v|VX|微信号|私信领|二维码|扫码|WhatsApp|Telegram|QQ群|外链下单/g,
    fix: "使用平台允许的店铺、表单或官方组件，删除规避审核的联系方式和二维码。",
  },
  {
    level: "中",
    title: "YouTube 标题/缩略图误导风险",
    pattern: /震惊|不看后悔|独家内幕|100%真实|标题党|封面党|点击领取|看完送|官方认证/g,
    fix: "让标题、封面、描述与视频实际内容一致，移除无法证明的背书和福利承诺。",
  },
];

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/") {
      return sendFile(response, path.join(__dirname, "index.html"), "text/html; charset=utf-8");
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, {
        ok: true,
        aiEnabled: Boolean(aiKey),
        provider: aiProvider,
        model: aiModel,
        audioUnderstanding: "需要上传字幕/口播稿；可后续接入 ASR",
      });
    }

    if (request.method === "POST" && url.pathname === "/api/audit") {
      const payload = JSON.parse((await readBody(request)).toString("utf8") || "{}");
      const report = await buildAuditReport(payload, request);
      saveReport(report);
      return sendJson(response, 200, report);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/report/")) {
      const id = decodeURIComponent(url.pathname.split("/").pop() || "");
      const report = readReports()[id];
      if (!report) return sendJson(response, 404, { error: "报告不存在" });
      return sendJson(response, 200, report);
    }

    if (request.method === "GET" && url.pathname.startsWith("/share/")) {
      const id = escapeHtml(decodeURIComponent(url.pathname.split("/").pop() || ""));
      return sendHtml(
        response,
        `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>合规检测报告</title><style>body{margin:0;background:#f5f4ef;color:#24211c;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}.wrap{max-width:980px;margin:0 auto;padding:24px}.bar{display:flex;justify-content:space-between;gap:12px;align-items:center}.panel{background:white;border:1px solid #ddd8cc;border-radius:8px;padding:18px;box-shadow:0 12px 30px rgba(45,39,27,.08)}button,a{border:1px solid #ddd8cc;border-radius:6px;background:#fff;color:#24211c;padding:10px 14px;text-decoration:none;font-weight:700}pre{white-space:pre-wrap;line-height:1.65;background:#1f2523;color:#f4f1e8;border-radius:8px;padding:16px;overflow:auto}</style></head><body><main class="wrap"><div class="bar"><h1>内容合规检测报告</h1><a href="/">发起新检测</a></div><section class="panel"><p id="status">正在加载报告...</p><pre id="report"></pre><button id="copy">复制 Markdown</button></section></main><script>const id="${id}";const out=document.querySelector("#report");fetch("/api/report/"+encodeURIComponent(id)).then(r=>r.json()).then(d=>{if(d.error)throw new Error(d.error);out.textContent=d.markdown;document.querySelector("#status").textContent="报告生成时间："+new Date(d.generatedAt).toLocaleString("zh-CN")}).catch(e=>document.querySelector("#status").textContent=e.message);document.querySelector("#copy").onclick=()=>navigator.clipboard.writeText(out.textContent||"");</script></body></html>`,
      );
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

async function buildAuditReport(payload, request) {
  const selectedPlatforms = Array.isArray(payload.platforms) && payload.platforms.length ? payload.platforms : Object.keys(platforms);
  const localFindings = scanKeywords(payload);
  let markdown = "";
  let aiEnabled = false;
  let aiError = "";

  if (aiKey) {
    try {
      markdown = await callAi(payload, selectedPlatforms, localFindings);
      aiEnabled = true;
    } catch (error) {
      aiError = error.message || "AI 调用失败";
      markdown = buildFallbackMarkdown(payload, selectedPlatforms, localFindings, aiError);
    }
  } else {
    markdown = buildFallbackMarkdown(payload, selectedPlatforms, localFindings, "未配置 AI Key，当前为本地规则预审。");
  }

  const id = `r_${crypto.randomBytes(8).toString("hex")}`;
  return {
    id,
    generatedAt: new Date().toISOString(),
    provider: aiProvider,
    model: aiModel,
    aiEnabled,
    aiError,
    shareUrl: `${originFromRequest(request)}/share/${id}`,
    markdown: cleanMarkdown(markdown),
  };
}

function scanKeywords(payload) {
  const text = [payload.text, payload.transcript, payload.notes, JSON.stringify(payload.files || [])].filter(Boolean).join("\n");
  const findings = [];
  for (const rule of keywordRules) {
    const matches = [...text.matchAll(rule.pattern)].slice(0, 5).map((item) => item[0]);
    if (matches.length) findings.push({ title: rule.title, level: rule.level, evidence: [...new Set(matches)], fix: rule.fix });
  }
  if ((payload.files || []).some((file) => file.kind === "audio") && !payload.transcript) {
    findings.push({
      title: "音频内容缺少字幕或口播稿",
      level: "中",
      evidence: ["已上传音频，但没有可分析的文字转写"],
      fix: "补充字幕、口播稿或后续接入 ASR 后再做最终判断。",
    });
  }
  return findings;
}

async function callAi(payload, selectedPlatforms, localFindings) {
  const images = [];
  for (const asset of payload.assets || []) {
    if (asset.dataUrl && images.length < Number(process.env.MAX_AI_IMAGES || 24)) {
      images.push({
        type: "image_url",
        image_url: { url: asset.dataUrl },
      });
    }
  }

  const messages = [
    {
      role: "system",
      content:
        "你是资深跨平台广告与自媒体内容合规审查员。请用中文输出专业、可执行的 Markdown 报告。不要编造不存在的官方条款编号；可引用公开规则名称和链接。",
    },
    {
      role: "user",
      content: [
        { type: "text", text: buildPrompt(payload, selectedPlatforms, localFindings) },
        ...images,
      ],
    },
  ];

  const res = await fetch(`${aiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiKey}`,
    },
    body: JSON.stringify({
      model: aiModel,
      messages,
      temperature: 0.2,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message || `AI 请求失败：${res.status}`);
  return json.choices?.[0]?.message?.content || "";
}

function buildPrompt(payload, selectedPlatforms, localFindings) {
  const fileSummary = (payload.files || [])
    .map((file) => `- ${file.name} | ${file.kind} | ${file.type || "unknown"} | ${file.size || 0} bytes | ${file.duration ? `${file.duration}s` : ""}`)
    .join("\n");

  const platformText = selectedPlatforms.map((id) => platforms[id] || id).join("、");
  const sources = sourceLinks.map(([name, url]) => `- ${name}: ${url}`).join("\n");

  return `请审查以下内容是否违反 Facebook 广告投放、Instagram、微信视频号、小红书、YouTube 的广告/社区/自媒体发布规则。

请用“重点优先 + 逐条卡片”的 Markdown 格式输出。不要把违规详情放进一张大表；每个违规点都必须单独成组，方便用户逐条修改。

强制格式如下：

# 全媒体内容合规检测报告

## 0. 重点结论
- **综合风险**：高/中/低
- **最需要先改的 3 个点**：用短句列出
- **是否建议直接发布/投放**：明确给出“可发布 / 修改后发布 / 暂停发布”

## 1. 违规点逐条清单
每个违规点必须使用下面的子结构，编号从 1.1 开始递增：

### 1.1 【风险等级】违规点标题
1. **违规点**：一句话说明问题。
2. **命中证据**：引用具体画面、图片序号、文案、字幕、口播或文件信息；没有直接证据时写“证据不足，需要人工复核”，不要编造。
3. **风险等级**：高/中/低，并说明判断原因。
4. **涉及平台**：Facebook / Instagram / 微信视频号 / 小红书 / YouTube，逐一列出。
5. **参考规则/来源**：列出对应平台公开规则名称和链接。
6. **为什么有风险**：解释平台可能如何理解该表达。
7. **修改建议**：给出能直接执行的修改动作。
8. **建议改写示例**：如果是文案问题，给出一版更合规的改写；如果是画面问题，说明如何改画面。

### 1.2 【风险等级】违规点标题
按同样 1-8 项继续。

## 2. 平台专项结论
每个平台单独列子节：
### 2.1 Facebook 广告投放
1. **平台风险等级**：
2. **关联违规点编号**：例如 1.1、1.3
3. **主要拒审/限流原因**：
4. **发布前必须修改**：

## 3. 画面/图片/视频/音频专项
1. **图片风险**：
2. **视频关键帧风险**：
3. **音频/口播风险**：
4. **素材来源与授权风险**：

## 4. 改写方案汇总
按“必须改 / 建议改 / 发布前补充材料”三类列出。

## 5. 修改后版本建议
给出可直接替换的合规文案或画面调整建议。

## 6. 参考来源
用项目符号列出官方来源链接。

## 7. 免责声明

目标平台：${platformText}
行业：${payload.industry || "未填写"}
内容类型：${payload.contentType || "未填写"}
目标地区：${payload.region || "未填写"}

正文/广告文案：
${payload.text || "未填写"}

字幕/口播稿/音频转写：
${payload.transcript || "未填写"}

画面说明/落地页/补充信息：
${payload.notes || "未填写"}

上传文件：
${fileSummary || "未上传文件"}

本地规则初筛命中：
${localFindings.length ? JSON.stringify(localFindings, null, 2) : "未命中明显关键词。"}

可参考官方来源：
${sources}

注意：
- 如果上传了图片或视频关键帧，请结合画面内容分析，不要只分析文字。
- 如果上传了音频但没有转写，请明确说明音频语义未覆盖，要求用户补充字幕/口播稿。
- 风险等级使用 高/中/低，修改方案要能直接改文案或改画面。
- 重点结论必须非常靠前，违规点必须逐条展开，避免长篇概述淹没重点。`;
}

function buildFallbackMarkdown(payload, selectedPlatforms, localFindings, note) {
  const platformText = selectedPlatforms.map((id) => platforms[id] || id).join("、");
  const level = localFindings.some((item) => item.level === "高") ? "高" : localFindings.length ? "中" : "低";
  const details = localFindings.length
    ? localFindings
        .map(
          (item, index) => `### 1.${index + 1} 【${item.level}风险】${item.title}

1. **违规点**：${item.title}
2. **命中证据**：${item.evidence.join("、")}
3. **风险等级**：${item.level}风险。该表达可能触发平台关于误导、敏感品类、导流或社区安全的审核。
4. **涉及平台**：${platformText}
5. **参考规则/来源**：见第 6 部分官方来源链接。
6. **为什么有风险**：平台可能认为该内容存在夸大承诺、信息不透明、诱导转化或敏感行业资质不足。
7. **修改建议**：${item.fix}
8. **建议改写示例**：将绝对化或诱导性表达改为限定表达，并补充来源、条件、风险提示和免责声明。`,
        )
        .join("\n\n")
    : "未发现明显违规点。仍建议人工核对画面、口播、字幕、授权与落地页一致性。";

  const sourceRows = sourceLinks.map(([name, url]) => `- [${name}](${url})`).join("\n");
  const topFixes = localFindings.slice(0, 3).map((item) => `- ${item.title}：${item.fix}`).join("\n");

  return `# 全媒体内容合规检测报告

**检测时间**：${new Date().toLocaleString("zh-CN")}  
**目标平台**：${platformText}  
**AI 状态**：${note}  

## 0. 重点结论

- **综合风险**：${level}风险
- **违规点数量**：${localFindings.length}
- **发布建议**：${level === "高" ? "暂停发布，修改后人工复核" : level === "中" ? "修改后再发布" : "可发布前复核"}
- **最需要先改的点**：
${topFixes || "- 暂无明显违规命中，发布前仍需核对素材授权、来源和免责声明。"}

## 1. 违规点逐条清单

${details}

## 2. 平台专项结论

${selectedPlatforms
  .map(
    (id, index) => `### 2.${index + 1} ${platforms[id] || id}

1. **平台风险等级**：${level}风险
2. **关联违规点编号**：${localFindings.length ? localFindings.map((_, itemIndex) => `1.${itemIndex + 1}`).join("、") : "暂无明显命中"}
3. **主要拒审/限流原因**：可能涉及夸大承诺、敏感行业信息透明度不足、站外导流或素材来源不清。
4. **发布前必须修改**：先处理第 1 部分列出的风险点，再补充来源、免责声明和资质证明。`,
  )
  .join("\n\n")}

## 3. 画面/图片/视频/音频专项

1. **图片风险**：如图片包含绝对化承诺、二维码、前后对比、未标来源的数据图，应单独复核。
2. **视频关键帧风险**：重点检查开头 5 秒、字幕贴片、结尾转化引导和封面标题。
3. **音频/口播风险**：如未提供字幕或口播稿，音频语义覆盖不足，需要补充转写。
4. **素材来源与授权风险**：发布前保留图片、音乐、人物肖像、品牌引用和数据来源证明。

## 4. 改写方案汇总

### 必须改
${localFindings.length ? localFindings.map((item) => `- ${item.title}：${item.fix}`).join("\n") : "- 暂无必须修改项。"}

### 建议改
- 补充官方来源、发布时间、适用条件和免责声明。
- 将“会、一定、立即、保证、100%”改为“可能、预计、在特定条件下、以官方发布为准”。

### 发布前补充材料
- 官方政策链接或数据来源截图。
- 素材授权、人物肖像授权、商业合作披露。
- 行业资质、风险提示和免责声明。

## 5. 修改后版本建议

将绝对化承诺改为限定表达；将私信、二维码、加微等导流动作改为平台允许的官方组件；医疗、金融、投资、功效类内容补充资质与风险提示。

## 6. 参考来源

${sourceRows}

## 7. 免责声明

本次检测结果为 ${level} 风险。平台规则会更新，最终审核结果以平台为准。
本结果为 AI 辅助检测参考，不构成法律意见，不保证平台最终审核结果。高风险内容建议人工复核或咨询专业人士。`;
}

function cleanMarkdown(markdown) {
  return String(markdown || "").replace(/^```(?:markdown)?/i, "").replace(/```$/i, "").trim();
}

function readReports() {
  try {
    return JSON.parse(fs.readFileSync(reportFile, "utf8"));
  } catch {
    return {};
  }
}

function saveReport(report) {
  fs.mkdirSync(dataDir, { recursive: true });
  const reports = readReports();
  reports[report.id] = report;
  fs.writeFileSync(reportFile, JSON.stringify(reports, null, 2));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    request.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBodyMb * 1024 * 1024) {
        reject(new Error(`上传内容超过 ${maxBodyMb}MB 限制`));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendFile(response, filePath, contentType) {
  response.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(response);
}

function sendHtml(response, html) {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function originFromRequest(request) {
  const proto = request.headers["x-forwarded-proto"] || "http";
  const hostName = request.headers["x-forwarded-host"] || request.headers.host || `localhost:${port}`;
  return `${proto}://${hostName}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

server.listen(port, host, () => {
  console.log(`Content compliance checker running on ${host}:${port}`);
  console.log(`AI: ${aiKey ? "enabled" : "disabled"} provider=${aiProvider} model=${aiModel}`);
});
