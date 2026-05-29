# Content Compliance Studio

全媒体内容发布前合规审查工作台。

这是一个面向发布前自查的内容风控工具。用户可以上传视频、图片，或粘贴文案、字幕、口播稿和画面说明，系统会结合目标平台与发布场景，提前识别可能导致违规、限流、审核不通过或需要修改的内容表达，并给出修改建议。

## 当前能力

- 上传视频、图片素材
- 粘贴标题 / 广告正文、字幕 / 口播稿、画面说明 / 补充信息
- 选择行业、内容用途、地区和发布 / 投放平台
- 生成结构化风险结果
- 保留 Markdown 详细报告
- 支持复制 Markdown、打印、保存审查记录
- 支持密码访问控制
- 支持分享报告链接

## 支持的平台

- Facebook
- Instagram
- 微信视频号
- 小红书
- YouTube
- TikTok / 抖音
- Google Ads
- Meta Ads

## 本地运行

1. 安装 Node.js 20 或更高版本
2. 在项目目录执行：

```bash
npm install
npm start
```

3. 打开：

```text
http://127.0.0.1:8787
```

## Render 部署

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

### 环境变量

```bash
AI_PROVIDER=bailian
DASHSCOPE_API_KEY=你的百炼Key
BAILIAN_PRIMARY_MODEL=qwen3.5-omni-plus-2026-03-15
BAILIAN_FALLBACK_MODELS=qwen3.5-omni-flash,qwen-vl-plus,qwen-vl-plus-latest
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ACCESS_CODES=lris,miya,devin,josh
MAX_UPLOAD_MB=60
MAX_AI_IMAGES=24
```

### 自动部署

Render 的 Auto-Deploy 建议保持为 `On Commit`。这样推送到 GitHub 主分支后会自动重新部署。

## 说明

- 这是发布前风险审查工具，不承诺 100% 通过平台审核。
- 输出结果用于辅助发布前自查，不替代法律意见，也不替代平台最终审核。
- 对于医疗、金融、保健、功效承诺、站外导流、版权素材等高风险内容，仍建议人工复核。
