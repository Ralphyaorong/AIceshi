# Facebook视频广告合规检测报告

**检测时间**：2026-03-24  
**检测类型**：视频检测  
**目标平台**：Facebook (Meta Ads)  
**视频时长**：23秒  
**关键帧数量**：12张

---

## 一、检测结果概览

| 检测项 | 结果 |
|--------|------|
| 检测内容类型 | 金融贷款产品广告视频 |
| 违规点数量 | **5处** |
| 风险等级 | **🟡 中风险** |
| 建议操作 | 修改后发布 |

---

## 二、违规详情

### 2.1 画面违规点

#### 违规点 #1 - 个人属性引用（暗示财务状况）

- **时间点**：约 00:04 秒（frame_0003）
- **画面内容**：`IT FEELS HEAVY` 文字叠加在白色背景上
- **违规类型**：个人属性引用
- **具体分析**：
  - 此文案暗示观看广告的用户存在财务压力/债务问题
  - Facebook政策明确禁止广告直接或间接宣称/暗示用户的**财务状况**（financial status）
  - 根据Meta官方政策：*"广告不得包含宣称或暗示用户具有某类个人特征的内容。这包括直接或间接宣称或暗示某人的...经济弱势状况..."*

- **风险等级**：🟡 中风险
- **法规依据**：[Meta广告发布政策 - 侵犯隐私和个人特征](https://transparency.meta.com/zh-cn/policies/ad-standards/)
- **改写建议**：
  - 方案一（通用版）：`BETTER CASH FLOW` → 改为描述产品优势而非暗示用户困境
  - 方案二（Facebook版）：`IMPROVE YOUR FINANCES` → 聚焦于产品功能，而非用户痛点
  - 方案三（口语版）：`SMART MONEY SOLUTIONS` → 使用中性的产品导向表达

---

#### 违规点 #2 - 品牌侵权（第三方商标）

- **时间点**：约 00:12 秒（frame_0007）
- **画面内容**：展示澳元、NAB银行卡片、澳航(Qantas)会员卡
- **违规类型**：侵犯第三方知识产权
- **具体分析**：
  - 视频中出现 **NAB (National Australia Bank)** 银行标志
  - 视频中出现 **Qantas (澳航)** 品牌标志
  - 根据Meta政策：*"广告不得包含侵犯任何第三方知识产权（包括版权、商标权或其他合法权利）的内容。侵权行为包括但不限于推广或销售仿冒产品，例如盗用其他公司产品的商标（名称或徽标）..."*

- **风险等级**：🟡 中风险
- **法规依据**：[Meta广告发布政策 - 侵犯知识产权](https://transparency.meta.com/zh-cn/policies/ad-standards/)
- **修改建议**：
  - 移除所有第三方品牌标志（银行、航空公司等）
  - 如需展示支付场景，使用不带品牌标识的通用银行卡/纸币
  - 或使用纯文字/图示化的支付符号代替真实品牌

---

### 2.2 文案违规点

#### 违规点 #3 - 误导性时间承诺

- **位置**：视频多处（frame_0002, frame_0004, frame_0009, frame_0012）
- **原文**：`RIGHT NOW` / `NOW`
- **违规类型**：误导性宣称
- **具体分析**：
  - 反复强调 "RIGHT NOW"、"NOW" 可能暗示**快速审批承诺**
  - Facebook政策对金融产品广告有严格要求，不得暗示保证的审批时间
  - 这类紧迫感营销可能被视为**欺骗性或误导性做法**

- **风险等级**：🟡 中风险
- **法规依据**：[Meta广告发布政策 - 欺骗性或误导性做法](https://transparency.meta.com/zh-cn/policies/ad-standards/)
- **改写建议**：
  - 方案一：`QUICK APPLICATION` → 描述申请便捷性
  - 方案二：`EASY APPROVAL PROCESS` → 强调流程而非承诺结果
  - 方案三：`SIMPLE STEPS` → 使用中性表达

---

#### 违规点 #4 - 金额承诺可能需要说明

- **位置**：约 00:02 秒（frame_0001）
- **原文**：`$600`
- **违规类型**：信息不完整
- **具体分析**：
  - 仅展示 `$600` 可能被视为贷款金额承诺
  - 金融广告需要清晰说明条款（利率、期限、费用等）
  - Facebook金融广告要求：*"广告必须清楚并充分地披露所有相关条款和条件"*

- **风险等级**：🟢 低风险（需补充说明）
- **法规依据**：[Meta金融产品广告政策](https://transparency.meta.com/zh-cn/policies/ad-standards/)
- **改写建议**：
  - 如展示金额，添加免责声明：*"Terms and conditions apply. Subject to eligibility."*
  - 或改为更通用的表达：`FLEXIBLE AMOUNTS` / `UP TO $600`

---

#### 违规点 #5 - 操控性紧迫感营销

- **位置**：视频多处（frame_0002, frame_0008, frame_0009, frame_0012）
- **原文**：`RIGHT NOW` / `AGAIN` / `NOW`
- **违规类型**：不良内容 - 操控性营销
- **具体分析**：
  - 反复使用紧迫感词汇（AGAIN、RIGHT NOW、NOW）制造时间压力
  - Facebook政策要求：*"广告应提供正向体验，不应制造负面自我认知或强迫性行为"*
  - 此类营销策略可能被视为操控用户决策

- **风险等级**：🟢 低风险（优化建议）
- **改写建议**：
  - 减少紧迫感词汇的使用频率
  - 改为价值导向表达：`BENEFITS` / `SOLUTIONS` / `OPTIONS`

---

## 三、Facebook平台专项检测

### 目标平台：Facebook (Meta Ads)

| 检测项 | 结果 | 说明 |
|--------|------|------|
| 个人属性引用 | ⚠️ 不通过 | `IT FEELS HEAVY` 暗示用户财务状况 |
| 误导性宣称 | ⚠️ 不通过 | `RIGHT NOW` / `NOW` 可能暗示时间承诺 |
| 品牌侵权 | ⚠️ 不通过 | 出现 NAB 银行、Qantas 标志 |
| 紧迫感营销 | ⚠️ 需优化 | 过度使用 NOW、AGAIN 等词 |
| 金融产品合规 | ⚠️ 需补充 | 金额展示需附带条款说明 |
| 成人内容 | ✅ 通过 | 无低俗/色情内容 |
| 暴力内容 | ✅ 通过 | 无暴力元素 |
| 歧视性内容 | ✅ 通过 | 无歧视性内容 |

---

## 四、Facebook广告政策重点参考

根据 Meta 官方广告发布守则（[来源](https://transparency.meta.com/zh-cn/policies/ad-standards/)）：

### 4.1 禁止的个人属性引用
广告不得暗示用户具有以下个人特征：
- **种族、民族、肤色、原国籍**
- **宗教信仰**
- **年龄、性别、性取向**
- **残疾（包括身体健康和心理健康）**
- **经济弱势状况**
- **投票状况**

### 4.2 欺骗性或误导性做法
广告不得包含欺骗性或误导性内容：
- 夸大产品效果
- 承诺不切实际的结果
- 暗示保证的审批时间或金额

### 4.3 知识产权保护
广告不得侵犯第三方知识产权，包括：
- 商标（品牌名称、Logo）
- 版权（图片、音乐、视频）
- 其他合法权利

---

## 五、改写方案汇总

### 画面文案改写

| 原文案 | 改写版本（通用） | Facebook版 | 口语版 |
|--------|-----------------|------------|--------|
| IT FEELS HEAVY | BETTER CASH FLOW | IMPROVE YOUR FINANCES | SMART MONEY SOLUTIONS |
| RIGHT NOW | QUICK APPLICATION | EASY APPROVAL PROCESS | SIMPLE STEPS |
| NOW | TODAY'S OPTIONS | AVAILABLE NOW | FLEXIBLE CHOICES |
| AGAIN | REPEAT | REIMBURSE | PAY BACK |

### 品牌使用建议
- 移除所有 NAB 银行标志
- 移除所有 Qantas 标志
- 使用通用银行卡/纸币图片或纯图示化支付符号

### 金融广告合规建议
- 在广告或落地页清楚披露：利率、期限、费用、资格要求
- 添加免责声明：*"Terms and conditions apply. Subject to eligibility and credit assessment."*

---

## 六、修改后版本建议

### 核心文案替换
```
原版：$600 | RIGHT NOW | IT FEELS HEAVY | MONTHLY REPAY | A BETTER LOAN
改版：FLEXIBLE AMOUNTS | SIMPLE APPLICATION | BETTER CASH FLOW | FLEXIBLE REPAYMENT | A SMART LOAN
```

### 画面调整
- 移除第三方品牌标志（NAB、Qantas）
- 减少紧迫感词汇使用频率
- 添加必要的金融产品条款说明

---

## 七、风险提示

### 🟡 中风险提示

本广告检测到**中风险违规内容**，建议修改后再发布。此类内容可能导致：
- 广告审核不通过
- 广告账户受到限制
- 需要反复修改耽误投放时间

**建议操作**：按照上述改写方案调整文案和画面内容后重新提交审核。

---

## 八、检测范围说明

📋 **检测范围**：已检测视频配音、字幕、画面文字、画面元素。检测基于 Meta (Facebook) 广告发布政策及相关法规。

---

## 九、法律依据

| 违规类型 | 法律依据 | 官方链接 |
|----------|---------|---------|
| 个人属性引用 | Meta广告政策 - 侵犯隐私和个人特征 | [查看原文](https://transparency.meta.com/zh-cn/policies/ad-standards/) |
| 误导性宣称 | Meta广告政策 - 欺骗性或误导性做法 | [查看原文](https://transparency.meta.com/zh-cn/policies/ad-standards/) |
| 品牌侵权 | Meta广告政策 - 侵犯知识产权 | [查看原文](https://transparency.meta.com/zh-cn/policies/ad-standards/) |
| 金融广告合规 | Meta金融产品广告政策 | [查看原文](https://transparency.meta.com/zh-cn/policies/ad-standards/) |

---

## 十、免责声明

⚠️ **免责声明**：本结果为AI辅助检测参考，不承担任何法律责任，最终合规性由内容发布者自行负责。中风险内容建议修改后发布，高风险内容强烈建议人工复核或咨询专业法律人士。所有平台规则与法律依据均来自 Meta 官方公开信息，如有更新请以平台最新公告为准。

---

**报告生成时间**：2026-03-24  
**检测工具**：全媒体合规检测助手 (content-compliance-checker)  
**报告版本**：v1.0
