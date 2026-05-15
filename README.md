# 全媒体内容合规检测助手

一个可部署到 Render/Railway 的线上网站，用于审查文字、图片、视频关键帧、音频字幕/口播稿是否存在 Facebook 广告、Instagram、微信视频号、小红书、YouTube 的内容合规风险。

## 功能

- 上传图片、视频、音频文件。
- 视频会在浏览器端抽取关键帧，再交给多模态模型理解。
- 音频当前建议同时粘贴字幕或口播稿，后续可接入 ASR。
- 输出 Markdown 详细报告：违规点、风险等级、命中证据、参考来源、修改建议、平台专项检测。
- 生成可分享报告链接 `/share/:id`。
- 支持阿里百炼/DashScope OpenAI-compatible 接口。

## Render 部署

Build Command 留空或使用：

```bash
npm install
```

Start Command：

```bash
npm start
```

环境变量：

```bash
AI_PROVIDER=bailian
DASHSCOPE_API_KEY=你的阿里百炼Key
BAILIAN_MODEL=qwen-vl-plus-latest
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MAX_UPLOAD_MB=60
MAX_AI_IMAGES=24
```

Render 部署成功后，把 Render 分配的 `https://xxx.onrender.com` 链接发给别人即可使用。

## 本地运行

```bash
npm start
```

打开 `http://127.0.0.1:8787`。

## 重要说明

本工具是 AI 辅助合规预审，不构成法律意见，也不保证平台最终审核一定通过。高风险行业和高风险素材建议人工复核。
