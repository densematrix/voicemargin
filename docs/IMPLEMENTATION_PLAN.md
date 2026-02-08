# VoiceMargin Implementation Plan

## 里程碑

### Milestone 1: 项目脚手架 (1h)
- [x] 创建 repo 目录结构
- [ ] 复制 ai-excuse-generator 为模板
- [ ] 修改项目名称和配置
- [ ] 初始化 Git repo

### Milestone 2: Backend 核心 (2h)
- [ ] 文章提取 API (/api/extract)
- [ ] Whisper 转录 API (/api/transcribe)
- [ ] Token 系统适配
- [ ] 单元测试

### Milestone 3: Frontend Reader (3h)
- [ ] URL 输入组件
- [ ] 阅读器 UI (干净排版)
- [ ] 文字选中高亮
- [ ] 语音录制组件

### Milestone 4: 语音边注交互 (2h)
- [ ] 选中文字 → 语音按钮出现
- [ ] 录音 → 转录 → 显示边注
- [ ] 边注列表侧边栏
- [ ] 本地存储 (localStorage)

### Milestone 5: Notion 同步 (1h)
- [ ] Notion OAuth 或 API Key 配置
- [ ] 同步边注到 Notion Page
- [ ] 返回 Notion URL

### Milestone 6: 部署 (1h)
- [ ] Docker 镜像构建
- [ ] 部署到 langsheng
- [ ] DNS 配置 (voicemargin.densematrix.ai)
- [ ] 监控接入

### Milestone 7: 验收 (0.5h)
- [ ] E2E 测试
- [ ] 给 Weihao 创建无限 token
- [ ] Slack 通知

## 预计总时间: ~10h (1.5 天)

## 外部依赖

| 依赖 | 状态 | 负责人 |
|------|------|--------|
| OpenAI API Key (Whisper) | ✅ 已有 (LLM Proxy) | - |
| Notion API Key | ✅ 已有 | - |
| Creem 产品配置 | ⏳ 需要创建 | Weihao |
| 域名 DNS | ⏳ 自动配置 | Agent |

**无阻塞外部依赖，可以直接开始开发。**

## 技术风险

| 风险 | 概率 | 应对 |
|------|------|------|
| 文章提取失败 (反爬) | 中 | 备选: Playwright headless |
| Whisper 延迟过高 | 低 | 已测试通常 1-2s |
| 录音权限被拒 | 低 | 友好提示 + fallback |
