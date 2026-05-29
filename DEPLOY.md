# 上线部署说明

这个项目现在是一个 Node 单体应用：前端页面、AI 审查接口、报告分享页都由 `server.js` 提供。

## 推荐部署方式：Railway

1. 新建一个 GitHub 仓库，把本项目所有文件上传。
2. 打开 Railway，选择 `New Project` -> `Deploy from GitHub repo`。
3. 选择该仓库。
4. 在 `Variables` 添加环境变量：

```text
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe
AI_PROVIDER=bailian
BAILIAN_API_KEY=你的阿里百炼 API Key
BAILIAN_MODEL=qwen-vl-plus-latest
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MAX_UPLOAD_MB=90
MAX_AUDIO_MB=24
MAX_AI_IMAGES=24
DATA_DIR=./data
```

如果只使用阿里百炼，可以不填 `OPENAI_API_KEY`。此时图片、视频关键帧、文本报告可用；音频自动转写暂不启用，需要手动粘贴字幕/口播稿，或另接 ASR 服务。

5. Railway 会自动识别 `package.json`，启动命令为：

```bash
npm start
```

6. 部署成功后，Railway 会给你一个公网域名。把这个域名发给别人即可使用。

## Render 部署

1. 创建 `Web Service`。
2. 连接 GitHub 仓库。
3. Runtime 选择 Node。
4. Build Command 留空或填：

```bash
npm install
```

5. Start Command：

```bash
npm start
```

6. 添加同样的环境变量。

本项目已包含 `render.yaml`，Render 支持 Blueprint 时可以直接识别服务配置；`BAILIAN_API_KEY` 仍需要在 Render 控制台手动填入。

## 分享报告

每次 AI 审查成功后，会生成一个分享链接：

```text
https://你的域名/share/r_xxxxxxxxxxxxxxxx
```

别人打开这个链接即可查看报告，无需登录。

## 重要限制

- 当前版本用本地 JSON 文件保存报告。小规模演示和内部使用可以直接上线。
- 如果你要长期商用，建议把报告和上传记录迁移到 Supabase/Postgres，避免部署平台重启或无持久磁盘导致历史报告丢失。
- 上传的视频不会整段送进模型；浏览器会抽取关键帧，后端会分析关键帧、图片和可转写音频。
- 视频/音频转写文件建议控制在 `MAX_AUDIO_MB` 以内，超大视频建议先压缩或截取广告片段。
