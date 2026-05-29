const platformInfo = {
  meta: {
    name: "Facebook 广告",
    brief: "重点关注禁售品类、个人属性暗示、误导性承诺、落地页一致性与敏感行业资质。",
    sources: ["meta-ad", "meta-community"],
  },
  instagram: {
    name: "Instagram 媒体",
    brief: "重点关注社区安全、裸露成人内容、仇恨骚扰、商业合作披露和导流方式。",
    sources: ["instagram-guidelines", "instagram-branded"],
  },
  wechat: {
    name: "微信视频号",
    brief: "重点关注违法违规、低俗擦边、虚假营销、私域导流、医疗金融等高风险内容。",
    sources: ["wechat-rules", "tencent-ads"],
  },
  rednote: {
    name: "小红书",
    brief: "重点关注种草真实性、夸大功效、医疗美容、导流交易、未披露商业合作。",
    sources: ["rednote-community", "rednote-marketing"],
  },
  youtube: {
    name: "YouTube",
    brief: "重点关注社区准则、广告友好度、误导性缩略图/标题、危险行为、受监管商品和站外欺诈导流。",
    sources: ["youtube-community", "youtube-ads", "google-video-ads"],
  },
};

const sourceLibrary = {
  "meta-ad": {
    title: "Meta Advertising Standards",
    url: "https://transparency.meta.com/policies/ad-standards/",
  },
  "meta-community": {
    title: "Meta Community Standards",
    url: "https://transparency.meta.com/policies/community-standards/",
  },
  "instagram-guidelines": {
    title: "Instagram Community Guidelines",
    url: "https://help.instagram.com/477434105621119",
  },
  "instagram-branded": {
    title: "Instagram Branded Content Policies",
    url: "https://help.instagram.com/1695974997209192",
  },
  "wechat-rules": {
    title: "微信视频号平台规则中心",
    url: "https://channels.weixin.qq.com/platform_rules",
  },
  "tencent-ads": {
    title: "腾讯广告审核与行业规范",
    url: "https://e.qq.com/ads/helpcenter/",
  },
  "rednote-community": {
    title: "小红书社区规范/社区公约",
    url: "https://agree.xiaohongshu.com/h5/terms/ZXXY20221213003/-1",
  },
  "rednote-marketing": {
    title: "小红书蒲公英/商业合作规范",
    url: "https://pgy.xiaohongshu.com/",
  },
  "youtube-community": {
    title: "YouTube Community Guidelines",
    url: "https://support.google.com/youtube/answer/9288567",
  },
  "youtube-ads": {
    title: "YouTube Advertiser-friendly Content Guidelines",
    url: "https://support.google.com/youtube/answer/6162278",
  },
  "google-video-ads": {
    title: "Google Ads Video Ad Requirements",
    url: "https://support.google.com/adspolicy/answer/2679940",
  },
};

const ruleLibrary = [
  {
    id: "prohibited-goods",
    title: "疑似禁投或强监管品类",
    category: "禁止/限制内容",
    severity: "high",
    platforms: ["meta", "instagram", "wechat", "rednote", "youtube"],
    sources: ["meta-ad", "meta-community", "wechat-rules", "rednote-community", "youtube-community"],
    patterns: [
      /赌博|博彩|แทงบอล|彩票代购|老虎机|真人荷官|赌球/g,
      /枪支|弹药|管制刀具|迷药|毒品|大麻|电子烟|烟草/g,
      /色情|裸聊|约炮|成人视频|成人服务|性暗示/g,
      /假证|代开发票|刷单|黑产|外挂|破解|洗钱/g,
    ],
    explanation:
      "素材或文案出现平台普遍禁止或严格限制的交易、服务、违禁品、成人服务、黑灰产线索，通常会触发拒审或账号风控。",
    fix:
      "删除相关交易信息、联系方式、诱导购买和画面露出；如果是合规科普，明确非交易、非引流，并补充资质与适用地区。",
  },
  {
    id: "medical-claims",
    title: "医疗健康功效承诺过强",
    category: "医疗健康",
    severity: "high",
    platforms: ["meta", "wechat", "rednote", "instagram", "youtube"],
    sources: ["meta-ad", "wechat-rules", "rednote-community", "youtube-community", "youtube-ads"],
    patterns: [
      /根治|治愈|包治|药到病除|永久消除|立刻见效|无副作用/g,
      /治疗(癌症|糖尿病|抑郁|焦虑|失眠|脱发|痤疮|湿疹|鼻炎|高血压)/g,
      /处方药|特效药|偏方|秘方|神药|祖传/g,
      /医疗美容|医美|注射|玻尿酸|肉毒|抽脂|植发/g,
    ],
    explanation:
      "医疗、保健、医美内容涉及高风险行业，夸大疗效、暗示替代诊疗或使用绝对功效承诺，会显著增加拒审概率。",
    fix:
      "改为客观介绍成分、适用人群、使用条件和风险提示；删除治疗承诺，补充合法资质、医生/机构授权和必要免责声明。",
  },
  {
    id: "personal-attributes",
    title: "直接点名用户个人属性",
    category: "个人属性",
    severity: "high",
    platforms: ["meta", "instagram"],
    sources: ["meta-ad"],
    patterns: [
      /你(是否|是不是|正在|已经).{0,10}(肥胖|脱发|负债|失业|离婚|怀孕|抑郁|焦虑|患有|有病|信用差)/g,
      /如果你.{0,12}(胖|穷|丑|单身|负债|有痘|脱发|失眠)/g,
      /专为.{0,8}(肥胖人群|抑郁患者|糖尿病患者|负债人士|单身女性)/g,
    ],
    explanation:
      "Meta 对广告中直接或间接断言用户的敏感个人属性非常敏感，尤其是健康、财务、外貌、情感、身份状态等。",
    fix:
      "避免“你有某问题”的第二人称判断，改为中性场景表达，例如“适合关注头皮护理的人群了解”。",
  },
  {
    id: "absolute-claims",
    title: "绝对化、第一性或保证性表述",
    category: "真实性/夸大宣传",
    severity: "medium",
    platforms: ["meta", "instagram", "wechat", "rednote", "youtube"],
    sources: ["meta-ad", "wechat-rules", "rednote-community", "youtube-ads"],
    patterns: [
      /100%|百分百|零风险|稳赚|保本|稳赚不赔|全网最低|全国第一|行业第一/g,
      /唯一|最强|最有效|最安全|最先进|顶级|永久|一次解决/g,
      /无效退款|不成功不收费|7天见效|当天见效|立省\d+/g,
    ],
    explanation:
      "绝对化和保证性表述容易被判定为误导性宣传；在中国大陆自媒体与广告语境中也常触及广告合规红线。",
    fix:
      "用可证据化、可限定的表达替代，例如“部分用户反馈”“在指定条件下”“以页面实际价格为准”。",
  },
  {
    id: "before-after",
    title: "前后对比或制造外貌焦虑",
    category: "身体形象",
    severity: "medium",
    platforms: ["meta", "instagram", "wechat", "rednote", "youtube"],
    sources: ["meta-ad", "instagram-guidelines", "rednote-community", "youtube-ads"],
    patterns: [
      /前后对比|before\s*after|使用前|使用后|变瘦|暴瘦|瘦\d+斤/g,
      /丑|胖成|毁容|黄脸婆|没人爱|自卑|逆袭变美/g,
      /痘痘消失|斑点消失|皱纹消失|黑眼圈消失/g,
    ],
    explanation:
      "减重、医美、护肤等前后对比素材容易被认定为不切实际结果、个人属性暗示或制造焦虑。",
    fix:
      "减少身体部位特写和羞辱性表达；改为过程展示、客观体验、非保证结果，并避免暗示人人可复制。",
  },
  {
    id: "finance-risk",
    title: "金融收益或贷款承诺",
    category: "金融服务",
    severity: "high",
    platforms: ["meta", "wechat", "rednote", "instagram", "youtube"],
    sources: ["meta-ad", "wechat-rules", "rednote-community", "google-video-ads"],
    patterns: [
      /投资|炒股|基金|期货|外汇|虚拟币|币圈|NFT|贷款|借钱|信用卡|征信/g,
      /保本|高收益|稳赚|内幕消息|老师带单|快速下款|秒批|黑户可贷/g,
    ],
    explanation:
      "金融、投资、贷款内容在各平台通常需要资质与风险披露；收益承诺、荐股带单、贷款秒批等表述风险很高。",
    fix:
      "删除收益保证和诱导开户/借贷话术；补充主体资质、风险提示、适用条件和不得构成投资建议的声明。",
  },
  {
    id: "misleading-price",
    title: "价格、福利或稀缺性可能误导",
    category: "促销真实性",
    severity: "medium",
    platforms: ["meta", "wechat", "rednote", "instagram", "youtube"],
    sources: ["meta-ad", "tencent-ads", "rednote-community", "youtube-ads"],
    patterns: [
      /仅限今天|最后\d+个名额|马上涨价|错过再等一年/g,
      /免费领取|0元购|一分钱不花|无需任何条件/g,
      /官方补贴|政府补贴|内部价|原价\d+现价\d+/g,
    ],
    explanation:
      "限时、补贴、免费、原价对比等促销信息需要真实、可验证并与落地页一致，否则容易被认定为诱导或虚假营销。",
    fix:
      "补充活动时间、数量、资格、费用、退款和发货条件；确保页面、直播间、评论区与广告文案一致。",
  },
  {
    id: "off-platform-contact",
    title: "站外导流或私下交易引导",
    category: "导流/交易",
    severity: "medium",
    platforms: ["instagram", "wechat", "rednote", "youtube"],
    sources: ["instagram-guidelines", "wechat-rules", "rednote-community", "youtube-community"],
    patterns: [
      /加微|加v|VX|微信号|私信领|主页联系方式|二维码|扫码/g,
      /私下交易|绕平台|走链接|复制口令|外链下单/g,
      /WhatsApp|Telegram|Line|QQ群|QQ群号/g,
    ],
    explanation:
      "自媒体平台通常限制过度导流、私下交易、绕开平台交易链路或在敏感行业中引导私聊。",
    fix:
      "使用平台允许的组件、店铺、企业号、表单或官方链接；删除明示联系方式、二维码和规避审核的谐音写法。",
  },
  {
    id: "rights-disclosure",
    title: "授权、商单或素材来源披露不足",
    category: "透明度/版权",
    severity: "medium",
    platforms: ["instagram", "wechat", "rednote", "meta", "youtube"],
    sources: ["instagram-branded", "meta-ad", "wechat-rules", "rednote-community", "youtube-community"],
    patterns: [
      /明星同款|官方授权|独家授权|合作款|品牌授权|正品保证/g,
      /搬运|混剪|二创|影视剪辑|音乐剪辑|未经授权/g,
      /达人合作|种草|软广|体验官|测评/g,
    ],
    explanation:
      "涉及达人合作、品牌授权、音乐影视素材或测评种草时，需要明确商业关系和授权链路，避免侵权或隐性营销。",
    fix:
      "补充商业合作标识、授权证明、素材版权来源和品牌许可；不确定授权的片段建议替换为自有素材。",
  },
  {
    id: "minor-sensitive",
    title: "未成年人或敏感受众保护不足",
    category: "受众安全",
    severity: "medium",
    platforms: ["meta", "instagram", "wechat", "rednote", "youtube"],
    sources: ["meta-ad", "instagram-guidelines", "wechat-rules", "rednote-community", "youtube-community"],
    patterns: [
      /未成年|儿童|学生党|小学生|初中生|高中生/g,
      /酒|白酒|啤酒|鸡尾酒|成人用品|贷款|医美|减肥药/g,
    ],
    explanation:
      "当内容面向或触达未成年人时，酒类、成人、金融、医美、药品、抽奖等内容需要更严格的年龄限制和表达控制。",
    fix:
      "设置年龄定向与内容分级；避免以未成年人身份、校园场景或学生优惠包装敏感商品。",
  },
  {
    id: "youtube-dangerous",
    title: "YouTube 危险行为或可模仿伤害风险",
    category: "YouTube 社区安全",
    severity: "high",
    platforms: ["youtube"],
    sources: ["youtube-community"],
    patterns: [
      /危险挑战|极限挑战|不要模仿|自制炸药|爆炸物|电击|窒息挑战|飙车|枪械教程/g,
      /如何制作.{0,8}(武器|爆炸|毒品|违禁品)/g,
      /教你.{0,10}(破解|盗号|诈骗|绕过风控|洗钱)/g,
    ],
    explanation:
      "YouTube 对鼓励危险或非法行为、可被观众模仿并造成严重伤害的内容非常敏感，可能导致下架、年龄限制或频道处罚。",
    fix:
      "删除操作步骤、鼓励性话术和可复制细节；如果是新闻、教育或纪录片语境，要明确风险、背景和非鼓励立场。",
  },
  {
    id: "youtube-metadata-deceptive",
    title: "YouTube 标题/缩略图/描述可能误导",
    category: "YouTube 误导性呈现",
    severity: "medium",
    platforms: ["youtube"],
    sources: ["youtube-community", "google-video-ads"],
    patterns: [
      /震惊|不看后悔|官方曝光|独家内幕|100%真实|必看|全网首发/g,
      /标题党|封面党|诱导点击|点击领取|看完送|免费获得/g,
      /名人同款|明星亲测|官方认证|平台背书/g,
    ],
    explanation:
      "YouTube 对误导性标题、缩略图、描述、外链和诈骗导流有明确限制；素材承诺与实际内容不一致会增加违规或限流风险。",
    fix:
      "让标题、封面、描述与视频实际内容一致；移除无法证明的背书、夸张点击诱导和不透明福利承诺。",
  },
  {
    id: "file-only-risk",
    title: "素材缺少可审查文本",
    category: "审查完整性",
    severity: "low",
    platforms: ["meta", "instagram", "wechat", "rednote", "youtube"],
    sources: ["meta-ad", "wechat-rules", "rednote-community", "youtube-community"],
    patterns: [],
    explanation:
      "仅上传媒体文件但没有字幕、口播稿或画面说明时，当前本地规则只能检查文件类型、大小、时长和文件名，无法判断画面与音频语义。",
    fix:
      "补充字幕、口播稿、画面描述；上线版建议接入 OCR、ASR 和视觉理解模型后再给出最终结论。",
    synthetic: true,
  },
];

const state = {
  files: [],
  lastReport: null,
};

const elements = {
  fileInput: document.querySelector("#fileInput"),
  dropZone: document.querySelector("#dropZone"),
  fileList: document.querySelector("#fileList"),
  fileCount: document.querySelector("#fileCount"),
  adCopy: document.querySelector("#adCopy"),
  transcript: document.querySelector("#transcript"),
  visualNotes: document.querySelector("#visualNotes"),
  industry: document.querySelector("#industry"),
  audience: document.querySelector("#audience"),
  contentType: document.querySelector("#contentType"),
  region: document.querySelector("#region"),
  runAuditButton: document.querySelector("#runAuditButton"),
  resetButton: document.querySelector("#resetButton"),
  loadSampleButton: document.querySelector("#loadSampleButton"),
  reportTitle: document.querySelector("#reportTitle"),
  overallScore: document.querySelector("#overallScore"),
  summaryHeadline: document.querySelector("#summaryHeadline"),
  summaryText: document.querySelector("#summaryText"),
  platformCards: document.querySelector("#platformCards"),
  issueList: document.querySelector("#issueList"),
  issueCount: document.querySelector("#issueCount"),
  fixChecklist: document.querySelector("#fixChecklist"),
  sourceList: document.querySelector("#sourceList"),
  lastRun: document.querySelector("#lastRun"),
  auditStatus: document.querySelector("#auditStatus"),
  shareBox: document.querySelector("#shareBox"),
  shareLink: document.querySelector("#shareLink"),
  markdownReport: document.querySelector("#markdownReport"),
  copyReportButton: document.querySelector("#copyReportButton"),
  copyMarkdownButton: document.querySelector("#copyMarkdownButton"),
  printButton: document.querySelector("#printButton"),
};

function init() {
  renderSources();
  renderPlatformCards(emptyPlatformResults());

  elements.fileInput.addEventListener("change", (event) => {
    addFiles(Array.from(event.target.files || []));
    elements.fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.remove("drag-over");
    });
  });

  elements.dropZone.addEventListener("drop", (event) => {
    addFiles(Array.from(event.dataTransfer.files || []));
  });

  elements.fileList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-file]");
    if (!button) return;
    removeFile(button.dataset.removeFile);
  });

  elements.runAuditButton.addEventListener("click", runAudit);
  elements.resetButton.addEventListener("click", resetAll);
  elements.loadSampleButton.addEventListener("click", loadSample);
  elements.printButton.addEventListener("click", () => window.print());
  elements.copyReportButton.addEventListener("click", copyReport);
  elements.copyMarkdownButton.addEventListener("click", copyMarkdown);
}

function addFiles(files) {
  const supported = files.filter((file) => /^(image|video|audio)\//.test(file.type));
  supported.forEach((file) => {
    const item = {
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      metadata: {
        kind: file.type.split("/")[0],
        size: file.size,
        type: file.type || "未知类型",
      },
    };
    state.files.push(item);
    readMediaMetadata(item);
  });
  renderFiles();
}

function readMediaMetadata(item) {
  if (item.metadata.kind === "image") {
    const image = new Image();
    image.onload = () => {
      item.metadata.width = image.naturalWidth;
      item.metadata.height = image.naturalHeight;
      renderFiles();
    };
    image.src = item.url;
    return;
  }

  if (item.metadata.kind === "video" || item.metadata.kind === "audio") {
    const media = document.createElement(item.metadata.kind);
    media.preload = "metadata";
    media.onloadedmetadata = () => {
      item.metadata.duration = Number.isFinite(media.duration) ? media.duration : null;
      if (item.metadata.kind === "video") {
        item.metadata.width = media.videoWidth;
        item.metadata.height = media.videoHeight;
      }
      renderFiles();
    };
    media.src = item.url;
  }
}

function removeFile(id) {
  const target = state.files.find((item) => item.id === id);
  if (target) URL.revokeObjectURL(target.url);
  state.files = state.files.filter((item) => item.id !== id);
  renderFiles();
}

function renderFiles() {
  elements.fileCount.textContent = `${state.files.length} 个文件`;
  elements.fileList.innerHTML = state.files
    .map((item) => {
      const preview = renderPreview(item);
      return `
        <article class="file-item">
          ${preview}
          <div class="file-meta">
            <strong title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</strong>
            <small>${formatMetadata(item.metadata)}</small>
          </div>
          <button class="icon-button" type="button" title="移除文件" data-remove-file="${item.id}">×</button>
        </article>
      `;
    })
    .join("");
}

function renderPreview(item) {
  if (item.metadata.kind === "image") {
    return `<div class="file-preview"><img src="${item.url}" alt="${escapeHtml(item.file.name)}" /></div>`;
  }
  if (item.metadata.kind === "video") {
    return `<div class="file-preview"><video src="${item.url}" muted playsinline></video></div>`;
  }
  if (item.metadata.kind === "audio") {
    return `<div class="file-preview">音频</div>`;
  }
  return `<div class="file-preview">文件</div>`;
}

function formatMetadata(metadata) {
  const parts = [metadata.type, formatBytes(metadata.size)];
  if (metadata.width && metadata.height) parts.push(`${metadata.width}×${metadata.height}`);
  if (metadata.duration) parts.push(formatDuration(metadata.duration));
  return parts.join(" · ");
}

function collectInput() {
  const selectedPlatforms = Array.from(
    document.querySelectorAll(".platform-picker input:checked"),
  ).map((input) => input.value);

  return {
    adCopy: elements.adCopy.value.trim(),
    transcript: elements.transcript.value.trim(),
    visualNotes: elements.visualNotes.value.trim(),
    industry: elements.industry.value,
    audience: elements.audience.value,
    contentType: elements.contentType.value,
    region: elements.region.value.trim(),
    selectedPlatforms: selectedPlatforms.length ? selectedPlatforms : Object.keys(platformInfo),
    fileNames: state.files.map((item) => item.file.name).join(" "),
    files: state.files,
  };
}

async function runAudit() {
  const input = collectInput();
  setAuditStatus("running", "正在抽取视频关键帧并提交 AI 审查；如果服务器未配置 API Key，会自动退回本地规则预审。");
  elements.runAuditButton.disabled = true;

  try {
    const aiReport = await requestAiAudit(input);
    state.lastReport = aiReport;
    renderReport(aiReport);
    setAuditStatus("success", aiReport.aiEnabled ? "AI 多媒体审查完成，已生成可分享报告。" : "服务器未启用 AI，已生成本地规则预审报告。");
  } catch (error) {
    console.warn(error);
    const report = analyze(input);
    report.markdown = buildMarkdownReport(report);
    report.aiEnabled = false;
    state.lastReport = report;
    renderReport(report);
    setAuditStatus("error", `AI 审查不可用，已退回本地预审：${error.message || "未知错误"}`);
  } finally {
    elements.runAuditButton.disabled = false;
  }
}

async function requestAiAudit(input) {
  const frames = await extractAllVideoFrames(input.files);
  const formData = new FormData();
  formData.append(
    "payload",
    JSON.stringify({
      ...input,
      files: input.files.map((item) => ({
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
        metadata: item.metadata,
      })),
      frameMeta: frames.map((frame) => ({
        name: frame.name,
        sourceFile: frame.sourceFile,
        timecode: frame.timecode,
      })),
    }),
  );

  input.files.forEach((item) => {
    if (item.metadata.kind === "image") {
      formData.append("image", item.file, item.file.name);
      return;
    }

    if ((item.metadata.kind === "audio" || item.metadata.kind === "video") && item.file.size <= 24 * 1024 * 1024) {
      formData.append("transcribable", item.file, item.file.name);
    }
  });

  frames.forEach((frame) => {
    formData.append("frame", frame.blob, frame.name);
  });

  const response = await fetch("/api/audit", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `服务器返回 ${response.status}`);
  }
  return hydrateServerReport(data.report);
}

function hydrateServerReport(report) {
  return {
    ...report,
    generatedAt: report.generatedAt ? new Date(report.generatedAt) : new Date(),
    input: report.input || collectInput(),
    issues: report.issues || [],
    platformResults: report.platformResults || emptyPlatformResults(),
    riskLevel: report.riskLevel || scoreToLevel(report.overallScore || 0),
    overallScore: report.overallScore || 0,
  };
}

async function extractAllVideoFrames(files) {
  const videoFiles = files.filter((item) => item.metadata.kind === "video");
  const allFrames = [];

  for (const item of videoFiles) {
    const frames = await extractVideoFrames(item.file, item.url, item.metadata.duration || 0);
    allFrames.push(...frames);
  }

  return allFrames;
}

async function extractVideoFrames(file, url, duration) {
  if (!duration || !Number.isFinite(duration)) return [];

  const count = Math.min(12, Math.max(4, Math.ceil(duration / 3)));
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = url;

  await waitForMedia(video, "loadedmetadata");

  const canvas = document.createElement("canvas");
  const width = Math.min(video.videoWidth || 1280, 1280);
  const height = Math.round(width * ((video.videoHeight || 720) / (video.videoWidth || 1280)));
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const frames = [];

  for (let index = 0; index < count; index += 1) {
    const time = Math.min(duration - 0.15, Math.max(0.1, (duration * index) / count));
    video.currentTime = time;
    await waitForMedia(video, "seeked");
    context.drawImage(video, 0, 0, width, height);
    const blob = await canvasToBlob(canvas);
    frames.push({
      blob,
      sourceFile: file.name,
      timecode: formatDuration(time),
      name: `${safeFileStem(file.name)}_frame_${String(index + 1).padStart(4, "0")}.jpg`,
    });
  }

  return frames;
}

function waitForMedia(media, eventName) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      media.removeEventListener(eventName, onEvent);
      media.removeEventListener("error", onError);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("媒体读取失败"));
    };
    media.addEventListener(eventName, onEvent, { once: true });
    media.addEventListener("error", onError, { once: true });
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("视频帧导出失败"));
    }, "image/jpeg", 0.82);
  });
}

function safeFileStem(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "_").slice(0, 64) || "video";
}

function setAuditStatus(status, text) {
  elements.auditStatus.className = `audit-status ${status || ""}`.trim();
  elements.auditStatus.textContent = text;
}

function analyze(input) {
  const textBlocks = [
    { label: "广告/笔记正文", value: input.adCopy },
    { label: "字幕/口播稿", value: input.transcript },
    { label: "画面描述/商品说明", value: input.visualNotes },
    { label: "文件名", value: input.fileNames },
  ].filter((block) => block.value);
  const combinedText = textBlocks.map((block) => block.value).join("\n");
  const issues = [];

  ruleLibrary.forEach((rule) => {
    if (!rule.platforms.some((platform) => input.selectedPlatforms.includes(platform))) return;
    if (rule.synthetic) return;

    const matches = findRuleMatches(rule, textBlocks);
    if (!matches.length) return;

    const severity = adjustSeverity(rule, input);
    issues.push({
      ...rule,
      severity,
      score: severityToScore(severity),
      matches,
      platforms: rule.platforms.filter((platform) => input.selectedPlatforms.includes(platform)),
    });
  });

  addContextualIssues(issues, input, combinedText);
  const platformResults = buildPlatformResults(input.selectedPlatforms, issues);
  const overallScore = Math.min(
    100,
    Math.round(
      platformResults.reduce((sum, item) => sum + item.score, 0) /
        Math.max(platformResults.length, 1),
    ),
  );

  return {
    input,
    issues: issues.sort((a, b) => b.score - a.score),
    platformResults,
    overallScore,
    riskLevel: scoreToLevel(overallScore),
    generatedAt: new Date(),
  };
}

function findRuleMatches(rule, textBlocks) {
  const matches = [];
  rule.patterns.forEach((pattern) => {
    textBlocks.forEach((block) => {
      pattern.lastIndex = 0;
      const found = block.value.match(pattern);
      if (!found) return;
      [...new Set(found)].slice(0, 4).forEach((snippet) => {
        matches.push({
          label: block.label,
          snippet,
        });
      });
    });
  });
  return dedupeMatches(matches).slice(0, 8);
}

function dedupeMatches(matches) {
  const seen = new Set();
  return matches.filter((match) => {
    const key = `${match.label}:${match.snippet}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function addContextualIssues(issues, input, combinedText) {
  if (input.files.length && !input.transcript && !input.visualNotes && !input.adCopy) {
    const rule = ruleLibrary.find((item) => item.id === "file-only-risk");
    issues.push({
      ...rule,
      severity: "low",
      score: severityToScore("low"),
      matches: [{ label: "素材", snippet: `${input.files.length} 个媒体文件` }],
      platforms: input.selectedPlatforms,
    });
  }

  if (input.industry === "health" && /治疗|疗效|病|药|医|瘦|减肥|修复/.test(combinedText)) {
    promoteOrAddIndustryIssue(
      issues,
      "medical-claims",
      "高风险行业上下文：当前行业选择为医疗健康/保健，相关表达应按更严格标准审查。",
    );
  }

  if (input.industry === "finance" && /收益|投资|贷款|征信|还款|利率/.test(combinedText)) {
    promoteOrAddIndustryIssue(
      issues,
      "finance-risk",
      "高风险行业上下文：当前行业选择为金融/投资/贷款，需要资质、风险提示与页面一致性。",
    );
  }

  if (input.audience === "minor" && /酒|医美|贷款|抽奖|充值|成人/.test(combinedText)) {
    promoteOrAddIndustryIssue(
      issues,
      "minor-sensitive",
      "受众包含未成年人，敏感商品或服务需要年龄限制与更保守表达。",
    );
  }

  input.files.forEach((item) => {
    const metadata = item.metadata;
    if (metadata.kind === "video" && metadata.duration && metadata.duration > 600) {
      issues.push({
        id: `duration-${item.id}`,
        title: "视频时长较长，建议拆分审核",
        category: "素材完整性",
        severity: "low",
        score: severityToScore("low"),
        platforms: input.selectedPlatforms,
        sources: ["meta-ad", "wechat-rules", "rednote-community"],
        explanation:
          "长视频通常包含更多口播、字幕、贴片和评论引导，单次人工复核容易遗漏风险点。",
        fix:
          "按主题或镜头段落拆分，分别提供字幕与画面说明；重点复核开头 5 秒、结尾转化引导和固定贴片。",
        matches: [{ label: "媒体元数据", snippet: `${item.file.name} · ${formatDuration(metadata.duration)}` }],
      });
    }
  });
}

function promoteOrAddIndustryIssue(issues, ruleId, note) {
  const existing = issues.find((issue) => issue.id === ruleId);
  if (existing) {
    existing.severity = "high";
    existing.score = severityToScore("high");
    existing.matches.push({ label: "上下文", snippet: note });
    return;
  }

  const rule = ruleLibrary.find((item) => item.id === ruleId);
  if (!rule) return;
  issues.push({
    ...rule,
    severity: "medium",
    score: severityToScore("medium"),
    matches: [{ label: "上下文", snippet: note }],
  });
}

function adjustSeverity(rule, input) {
  if (
    (input.industry === "health" && rule.id === "medical-claims") ||
    (input.industry === "finance" && rule.id === "finance-risk")
  ) {
    return "high";
  }

  if (input.contentType === "ad" && rule.severity === "medium") {
    return "medium";
  }

  return rule.severity;
}

function buildPlatformResults(selectedPlatforms, issues) {
  return selectedPlatforms.map((platform) => {
    const platformIssues = issues.filter((issue) => issue.platforms.includes(platform));
    const score = Math.min(100, platformIssues.reduce((sum, issue) => sum + issue.score, 0));
    return {
      id: platform,
      name: platformInfo[platform].name,
      brief: platformInfo[platform].brief,
      score,
      level: scoreToLevel(score),
      issueCount: platformIssues.length,
      highCount: platformIssues.filter((issue) => issue.severity === "high").length,
    };
  });
}

function renderReport(report) {
  elements.reportTitle.textContent = "内容合规审查报告";
  elements.lastRun.textContent = formatDateTime(report.generatedAt);
  elements.issueCount.textContent = `${report.issues.length} 项`;
  if (!report.markdown) report.markdown = buildMarkdownReport(report);
  elements.markdownReport.textContent = report.markdown;
  renderShareLink(report);
  renderOverallScore(report);
  renderPlatformCards(report.platformResults);
  renderIssues(report.issues);
  renderChecklist(report);
  renderSources(report);
}

function renderShareLink(report) {
  if (!report.shareUrl) {
    elements.shareBox.hidden = true;
    elements.shareLink.href = "#";
    elements.shareLink.textContent = "";
    return;
  }

  const absoluteUrl = new URL(report.shareUrl, window.location.origin).toString();
  elements.shareBox.hidden = false;
  elements.shareLink.href = absoluteUrl;
  elements.shareLink.textContent = absoluteUrl;
}

function renderOverallScore(report) {
  elements.overallScore.className = `score-card ${report.riskLevel}`;
  elements.overallScore.querySelector(".score-number").textContent = report.overallScore;
  elements.summaryHeadline.textContent = riskHeadline(report.riskLevel, report.issues.length);
  elements.summaryText.textContent = buildSummary(report);
}

function renderPlatformCards(results) {
  elements.platformCards.innerHTML = results
    .map(
      (result) => `
        <article class="platform-card">
          <h3>${result.name}</h3>
          <span class="risk-pill ${result.level}">${levelText(result.level)} · ${result.score}</span>
          <p>${result.brief}</p>
          <div class="platform-stat">
            <span>风险项</span>
            <strong>${result.issueCount}</strong>
          </div>
          <div class="platform-stat">
            <span>高风险</span>
            <strong>${result.highCount}</strong>
          </div>
        </article>
      `,
    )
    .join("");
}

function emptyPlatformResults() {
  return Object.entries(platformInfo).map(([id, platform]) => ({
    id,
    name: platform.name,
    brief: platform.brief,
    score: 0,
    level: "low",
    issueCount: 0,
    highCount: 0,
  }));
}

function renderIssues(issues) {
  if (!issues.length) {
    elements.issueList.innerHTML = `
      <div class="empty-state">
        <strong>未发现明显违规信号</strong>
        <p>这不等于平台一定通过；建议继续补充落地页、授权证明、字幕和素材说明做人工复核。</p>
      </div>
    `;
    return;
  }

  elements.issueList.innerHTML = issues
    .map((issue) => {
      const platforms = issue.platforms.map((platform) => platformInfo[platform]?.name || platform);
      const sources = issue.sources
        .map((sourceId) => sourceLibrary[sourceId])
        .filter(Boolean)
        .map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>`)
        .join("、");
      return `
        <article class="issue-card">
          <div class="issue-topline">
            <div>
              <h3>${escapeHtml(issue.title)}</h3>
              <div class="issue-meta">
                <span class="tag">${escapeHtml(issue.category)}</span>
                ${platforms.map((platform) => `<span class="tag">${escapeHtml(platform)}</span>`).join("")}
              </div>
            </div>
            <span class="issue-severity ${issue.severity}">${levelText(issue.severity)}</span>
          </div>
          <p>${escapeHtml(issue.explanation)}</p>
          <div class="evidence"><strong>命中证据：</strong>${renderMatches(issue.matches)}</div>
          <div class="fix-box"><strong>修改建议：</strong>${escapeHtml(issue.fix)}</div>
          <p><strong>参考来源：</strong>${sources}</p>
        </article>
      `;
    })
    .join("");
}

function renderMatches(matches) {
  return matches
    .map((match) => `${escapeHtml(match.label)}「${escapeHtml(match.snippet)}」`)
    .join("；");
}

function renderChecklist(report) {
  if (!report || !report.issues.length) {
    elements.fixChecklist.innerHTML = `
      <li>保留当前较克制的表达，继续核对素材版权、商业合作披露和落地页一致性。</li>
      <li>发布前补充人工复核，尤其是画面、语音、字幕和评论区引导。</li>
      <li>平台政策更新后，及时复核规则库与行业资质要求。</li>
    `;
    return;
  }

  const fixes = report.issues.slice(0, 6).map((issue) => issue.fix);
  elements.fixChecklist.innerHTML = [...new Set(fixes)]
    .map((fix) => `<li>${escapeHtml(fix)}</li>`)
    .join("");
}

function renderSources(report = null) {
  const sourceIds = report
    ? [
        ...new Set(
          report.issues.flatMap((issue) => issue.sources).concat(
            report.input.selectedPlatforms.flatMap((platform) => platformInfo[platform].sources),
          ),
        ),
      ]
    : Object.keys(sourceLibrary);

  elements.sourceList.innerHTML = sourceIds
    .map((id) => sourceLibrary[id])
    .filter(Boolean)
    .map(
      (source) => `
        <div class="source-item">
          <strong>${escapeHtml(source.title)}</strong>
          <a href="${source.url}" target="_blank" rel="noreferrer">${source.url}</a>
        </div>
      `,
    )
    .join("");
}

function buildSummary(report) {
  if (!report.issues.length) {
    return "本次没有命中明显违规关键词或上下文风险，但该结果仅覆盖本地规则与已输入文本；图片画面、视频语音和平台人工审核仍可能产生额外风险。";
  }

  const high = report.issues.filter((issue) => issue.severity === "high").length;
  const medium = report.issues.filter((issue) => issue.severity === "medium").length;
  const mainCategories = [...new Set(report.issues.map((issue) => issue.category))].slice(0, 4);
  return `共发现 ${report.issues.length} 个风险项，其中高风险 ${high} 个、中风险 ${medium} 个。主要集中在：${mainCategories.join("、")}。建议先处理高风险项，再复核平台差异与资质材料。`;
}

function buildMarkdownReport(report) {
  const input = report.input || {};
  const platforms = (input.selectedPlatforms || Object.keys(platformInfo)).map((id) => platformInfo[id]?.name || id);
  const files = input.files || [];
  const videoFiles = files.filter((item) => item.metadata?.kind === "video" || item.file?.type?.startsWith?.("video/"));
  const imageFiles = files.filter((item) => item.metadata?.kind === "image" || item.file?.type?.startsWith?.("image/"));
  const audioFiles = files.filter((item) => item.metadata?.kind === "audio" || item.file?.type?.startsWith?.("audio/"));
  const topRisk = levelText(report.riskLevel || "low");
  const action = report.riskLevel === "high" ? "修改后人工复核" : report.riskLevel === "medium" ? "修改后发布" : "可发布前复核";
  const visualIssues = report.issues.filter((issue) =>
    /画面|身体|品牌|版权|YouTube|素材|危险|缩略图/.test(`${issue.category}${issue.title}`),
  );
  const copyIssues = report.issues.filter((issue) => !visualIssues.includes(issue));

  const issueBlock = (issue, index) => {
    const matches = issue.matches?.length ? renderPlainMatches(issue.matches) : "未提供具体片段";
    const sources = (issue.sources || [])
      .map((sourceId) => sourceLibrary[sourceId])
      .filter(Boolean)
      .map((source) => `[${source.title}](${source.url})`)
      .join("、");
    return `#### 违规点 #${index + 1} - ${issue.title}

- **位置/证据**：${matches}
- **违规类型**：${issue.category}
- **具体分析**：${issue.explanation}
- **风险等级**：${riskIcon(issue.severity)} ${levelText(issue.severity)}
- **法规依据**：${sources || "待补充"}
- **修改建议**：${issue.fix}
`;
  };

  const platformRows = (report.platformResults || [])
    .map((item) => `| ${item.name} | ${riskIcon(item.level)} ${levelText(item.level)} | 风险项 ${item.issueCount} 个，高风险 ${item.highCount} 个 |`)
    .join("\n");

  const sourceRows = [...new Set(report.issues.flatMap((issue) => issue.sources || []))]
    .map((sourceId) => sourceLibrary[sourceId])
    .filter(Boolean)
    .map((source) => `| ${source.title} | [查看原文](${source.url}) |`)
    .join("\n");

  return `# 全媒体内容合规检测报告

**检测时间**：${formatDateTime(report.generatedAt || new Date())}  
**检测类型**：${videoFiles.length ? "视频检测" : imageFiles.length ? "图片检测" : audioFiles.length ? "音频检测" : "图文检测"}  
**目标平台**：${platforms.join("、")}  
**视频数量**：${videoFiles.length} 个  
**图片数量**：${imageFiles.length} 个  
**音频数量**：${audioFiles.length} 个  
**AI 多媒体理解**：${report.aiEnabled ? "已启用" : "未启用，本地规则预审"}  

---

## 一、检测结果概览

| 检测项 | 结果 |
|--------|------|
| 检测内容类型 | ${industryText(input.industry)} / ${contentTypeText(input.contentType)} |
| 违规点数量 | **${report.issues.length} 处** |
| 风险等级 | **${riskIcon(report.riskLevel)} ${topRisk}** |
| 建议操作 | ${action} |

---

## 二、违规详情

### 2.1 画面/素材违规点

${visualIssues.length ? visualIssues.map(issueBlock).join("\n---\n\n") : "未发现明显画面/素材违规点。"}

### 2.2 文案/口播违规点

${copyIssues.length ? copyIssues.map((issue, index) => issueBlock(issue, visualIssues.length + index)).join("\n---\n\n") : "未发现明显文案/口播违规点。"}

---

## 三、平台专项检测

| 平台 | 结果 | 说明 |
|--------|------|------|
${platformRows || "| 全平台 | 暂无结果 | 未选择平台 |"}

---

## 四、平台政策重点参考

${buildPolicyHighlights(input.selectedPlatforms || Object.keys(platformInfo))}

---

## 五、改写方案汇总

${report.issues.length ? report.issues.map((issue) => `- **${issue.title}**：${issue.fix}`).join("\n") : "- 保持当前克制表达，发布前继续核对授权、资质和落地页一致性。"}

---

## 六、修改后版本建议

${buildRewriteSuggestion(report)}

---

## 七、风险提示

本次检测结果为 **${riskIcon(report.riskLevel)} ${topRisk}**。${buildRiskNotice(report)}

---

## 八、检测范围说明

已检测用户输入的正文、字幕/口播稿、画面描述、文件名和媒体元数据。${report.aiEnabled ? "AI 版本还会检测上传图片、视频关键帧和可转写音频。" : "当前为本地规则预审，正式上线配置 API Key 后可启用图片理解、视频关键帧理解和音频转写。"}

---

## 九、法律依据

| 依据 | 官方链接 |
|----------|---------|
${sourceRows || "| 平台公开规则 | 运行审查后按命中风险展示 |"}

---

## 十、免责声明

本结果为 AI 辅助检测参考，不构成法律意见，不保证平台最终审核结果。最终合规性由内容发布者自行负责；高风险内容建议人工复核或咨询专业法律人士。平台规则可能更新，请以各平台最新公告为准。

---

**检测工具**：全媒体合规检测助手  
**报告版本**：v2.0
`;
}

function renderPlainMatches(matches) {
  return matches.map((match) => `${match.label}「${match.snippet}」`).join("；");
}

function riskIcon(level) {
  return {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
  }[level] || "🟢";
}

function industryText(value) {
  return {
    general: "通用内容/品牌",
    beauty: "美妆护肤",
    health: "医疗健康/保健",
    finance: "金融/投资/贷款",
    education: "教育培训",
    food: "食品饮料",
    local: "本地生活",
    games: "游戏/抽奖",
    alcohol: "酒类",
  }[value] || "通用内容/品牌";
}

function contentTypeText(value) {
  return {
    ad: "付费广告",
    organic: "自媒体内容",
    branded: "达人商业合作",
    shop: "带货/商品推广",
  }[value] || "付费广告";
}

function buildPolicyHighlights(platformIds) {
  return platformIds
    .map((id) => platformInfo[id])
    .filter(Boolean)
    .map((platform) => `- **${platform.name}**：${platform.brief}`)
    .join("\n");
}

function buildRewriteSuggestion(report) {
  if (!report.issues.length) {
    return "当前未发现明显违规点，建议保留证据材料并进行发布前人工复核。";
  }

  return report.issues
    .slice(0, 5)
    .map((issue, index) => `${index + 1}. ${issue.fix}`)
    .join("\n");
}

function buildRiskNotice(report) {
  if (report.riskLevel === "high") {
    return "建议先完成整改并进行人工复核，否则可能导致广告拒审、内容下架、账号限制或投放中断。";
  }
  if (report.riskLevel === "medium") {
    return "建议修改后再发布，重点处理误导性承诺、敏感属性暗示、资质披露和导流风险。";
  }
  return "建议发布前保留授权、资质、活动规则和素材来源证明。";
}

function riskHeadline(level, count) {
  if (!count) return "当前输入未发现明显违规信号";
  if (level === "high") return "高风险：建议修改后再提交审核";
  if (level === "medium") return "中风险：存在较明显拒审或限流隐患";
  return "低风险：仍建议做人工复核";
}

function scoreToLevel(score) {
  if (score >= 65) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function severityToScore(severity) {
  return {
    high: 34,
    medium: 18,
    low: 8,
  }[severity];
}

function levelText(level) {
  return {
    high: "高风险",
    medium: "中风险",
    low: "低风险",
  }[level];
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadSample() {
  elements.adCopy.value =
    "你是不是因为脱发和痘痘一直自卑？这款医美级修复精华 7 天见效，100% 无副作用，前后对比肉眼可见。今天私信加微领取官方补贴名额。";
  elements.transcript.value =
    "老师说这个方法可以根治痘痘，使用前满脸痘，使用后皮肤完全消失瑕疵。无效退款，最后 50 个名额。";
  elements.visualNotes.value =
    "画面包含明显面部前后对比、二维码、主播口播引导加微信，背景出现明星同款字样。";
  elements.industry.value = "health";
  elements.audience.value = "adult";
  elements.contentType.value = "ad";
  runAudit();
}

function resetAll() {
  state.files.forEach((item) => URL.revokeObjectURL(item.url));
  state.files = [];
  state.lastReport = null;
  elements.adCopy.value = "";
  elements.transcript.value = "";
  elements.visualNotes.value = "";
  elements.industry.value = "general";
  elements.audience.value = "adult";
  elements.contentType.value = "ad";
  elements.region.value = "中国大陆 / 美国";
  document
    .querySelectorAll(".platform-picker input")
    .forEach((input) => {
      input.checked = true;
    });
  renderFiles();
  elements.reportTitle.textContent = "等待素材";
  elements.lastRun.textContent = "尚未运行";
  elements.issueCount.textContent = "0 项";
  elements.markdownReport.textContent = "运行审查后会按正式报告格式生成 Markdown。";
  elements.shareBox.hidden = true;
  setAuditStatus("", "可先用本地规则预审；配置 OpenAI API Key 后将自动启用图片、视频关键帧和音频理解。");
  elements.overallScore.className = "score-card";
  elements.overallScore.querySelector(".score-number").textContent = "--";
  elements.summaryHeadline.textContent = "上传素材或输入文案后开始审查";
  elements.summaryText.textContent =
    "系统会对文字、字幕、画面描述、文件名和媒体基础信息进行规则匹配，输出分平台风险、证据片段、参考来源与修改建议。";
  renderPlatformCards(emptyPlatformResults());
  elements.issueList.innerHTML = `
    <div class="empty-state">
      <strong>还没有报告</strong>
      <p>建议同时提供素材文件、正文、字幕或口播稿，报告会更接近真实审核结果。</p>
    </div>
  `;
  renderChecklist(null);
  renderSources();
}

async function copyReport() {
  if (!state.lastReport) {
    await navigator.clipboard.writeText("尚未生成审查报告。");
    return;
  }

  const report = state.lastReport;
  const lines = [
    "内容合规审查报告",
    `生成时间：${formatDateTime(report.generatedAt)}`,
    `综合风险：${levelText(report.riskLevel)} ${report.overallScore}`,
    "",
    "平台对比：",
    ...report.platformResults.map(
      (item) => `- ${item.name}：${levelText(item.level)} ${item.score}，风险项 ${item.issueCount}`,
    ),
    "",
    "违规点与修改建议：",
    ...report.issues.map(
      (issue, index) =>
        `${index + 1}. [${levelText(issue.severity)}] ${issue.title}\n证据：${issue.matches
          .map((match) => `${match.label}「${match.snippet}」`)
          .join("；")}\n建议：${issue.fix}`,
    ),
  ];

  await navigator.clipboard.writeText(lines.join("\n"));
  elements.copyReportButton.textContent = "已复制";
  window.setTimeout(() => {
    elements.copyReportButton.textContent = "复制报告";
  }, 1600);
}

async function copyMarkdown() {
  const text = state.lastReport?.markdown || elements.markdownReport.textContent || "尚未生成审查报告。";
  await navigator.clipboard.writeText(text);
  elements.copyMarkdownButton.textContent = "已复制";
  window.setTimeout(() => {
    elements.copyMarkdownButton.textContent = "复制 Markdown";
  }, 1600);
}

init();
