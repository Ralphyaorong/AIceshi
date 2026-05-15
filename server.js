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

请按下面结构输出，报告要具体到“违规点、证据、风险等级、对应平台、参考来源、修改方案”：

# 全媒体内容合规检测报告
## 一、检测结果概览
## 二、违规详情
### 2.1 画面/素材违规点
### 2.2 文案/口播违规点
## 三、平台专项检测
## 四、平台政策重点参考
## 五、改写方案汇总
## 六、修改后版本建议
## 七、风险提示
## 八、检测范围说明
## 九、法律依据
## 十、免责声明

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
- 风险等级使用 高/中/低，修改方案要能直接改文案或改画面。`;
}

function buildFallbackMarkdown(payload, selectedPlatforms, localFindings, note) {
  const platformText = selectedPlatforms.map((id) => platforms[id] || id).join("、");
  const level = localFindings.some((item) => item.level === "高") ? "高" : localFindings.length ? "中" : "低";
  const details = localFindings.length
    ? localFindings
        .map(
          (item, index) => `#### 违规点 #${index + 1} - ${item.title}

- **位置/证据**：${item.evidence.join("、")}
- **违规类型**：本地规则初筛
- **具体分析**：该表达可能触发平台关于误导、敏感品类、导流或社区安全的审核。
- **风险等级**：${item.level}
- **法规依据**：见第九部分官方规则链接
- **修改建议**：${item.fix}`,
        )
        .join("\n\n")
    : "未发现明显违规点。仍建议人工核对画面、口播、字幕、授权与落地页一致性。";

  const sourceRows = sourceLinks.map(([name, url]) => `| ${name} | [查看原文](${url}) |`).join("\n");

  return `# 全媒体内容合规检测报告

**检测时间**：${new Date().toLocaleString("zh-CN")}  
**目标平台**：${platformText}  
**AI 状态**：${note}  

## 一、检测结果概览

| 检测项 | 结果 |
|---|---|
| 综合风险 | ${level} |
| 违规点数量 | ${localFindings.length} |
| 建议操作 | ${level === "高" ? "修改后人工复核" : level === "中" ? "修改后再发布" : "发布前复核"} |

## 二、违规详情

${details}

## 三、平台专项检测

| 平台 | 初筛结论 |
|---|---|
${selectedPlatforms.map((id) => `| ${platforms[id] || id} | ${level}风险，需结合该平台最新规则复核 |`).join("\n")}

## 四、平台政策重点参考

- Facebook/Instagram：重点关注禁售品类、个人属性暗示、误导性承诺、落地页一致性。
- 微信视频号：重点关注违法违规、低俗擦边、虚假营销、私域导流和资质。
- 小红书：重点关注种草真实性、医美保健功效、商业合作披露和站外交易。
- YouTube：重点关注社区安全、误导性标题/缩略图、广告友好度和危险行为。

## 五、改写方案汇总

${localFindings.length ? localFindings.map((item) => `- ${item.fix}`).join("\n") : "- 保持克制表达，补充资质、授权、活动规则和素材来源。"}

## 六、修改后版本建议

将绝对化承诺改为限定表达；将私信、二维码、加微等导流动作改为平台允许的官方组件；医疗、金融、功效类内容补充资质与风险提示。

## 七、风险提示

本次检测结果为 ${level} 风险。平台规则会更新，最终审核结果以平台为准。

## 八、检测范围说明

已检测用户输入文本、字幕/口播稿、画面说明、文件名和媒体元数据。图片与视频关键帧理解需要配置可用多模态模型；音频语义需要字幕/口播稿或 ASR 转写。

## 九、法律依据

| 依据 | 官方链接 |
|---|---|
${sourceRows}

## 十、免责声明

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
