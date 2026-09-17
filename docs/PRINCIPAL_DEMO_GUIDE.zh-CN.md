# Bayside Hub 校长演示指南

> 建议演示时长：15–20 分钟；另预留 5–10 分钟问答。  
> 演示目标：说明 Bayside Hub 如何把公告、日历、社团、活动、机会、审批和学校运营集中在一个安全、可追踪的平台中。

## 1. 一句话介绍

**Bayside Hub 是 Bayside High School 面向学生、社团负责人、Advisor、Staff 与 Admin 的一站式校园参与平台。** 学生可以发现并加入社团、查看公告和日历、报名活动与提交支持请求；社团团队可以管理成员、内容、签到和运营流程；学校管理人员可以审批、审计并分析平台使用情况。

## 2. 演示前准备

建议至少提前 30 分钟完成以下检查：

1. 准备三个测试账号：普通学生、社团负责人或 Advisor、Admin/Staff。
2. 确认 Supabase 数据库迁移已全部执行，并准备一个资料完整的演示 Club。
3. 给演示 Club 准备：封面图、简介、Advisor、会议时间、两条公告、至少一条社交链接、一个待审批成员和一个签到活动。
4. 准备一条学校公告、一个未来活动、一个机会和一个 Support request。
5. 准备 Admin 队列中的一个审批项目，以便现场批准或拒绝。
6. 使用无痕窗口或另一个浏览器分别登录不同角色，避免现场频繁退出。
7. 将浏览器缩放设为 100%，关闭无关标签和通知，并确认网络稳定。
8. 先走一遍完整流程，避免演示数据为空或权限设置不正确。
9. 保留项目主页和 GitHub/Vercel 部署页作为备用，但不要在正式演示中展示密钥、数据库连接信息或学生隐私数据。

## 3. 推荐演示顺序

### 第一部分：主页与统一入口（约 2 分钟）

打开主页，介绍顶部搜索栏、深浅模式、通知、Profile，以及电脑端侧边导航和手机端底部导航。

建议讲解：

> “学生不需要在多个群聊、表单和网页之间寻找信息。Bayside Hub 把学校公告、社团、活动、机会和个人事项集中到一个入口，并针对手机和电脑进行了响应式设计。”

现场操作：

1. 切换一次深色/浅色模式，说明整个网站会统一跟随主题。
2. 在全局搜索中输入一个社团名称或活动关键词。
3. 展示搜索结果按照 Announcements、Clubs 和 Events 分类。
4. 打开通知按钮，说明审批结果、截止提醒和候补状态可以集中查看。

### 第二部分：Updates、Calendar 与 Bell Schedule（约 3 分钟）

进入 **Announcements** 页面，顶部可以在 `Updates / Calendar / Bell Schedule` 之间切换。

现场操作：

1. 在 **Updates** 中展示公告搜索、类别筛选、分页、已读/收藏与公告详情。
2. 点击 **Calendar**，展示学校活动集中日历。
3. 点击 **Bell Schedule**，说明系统按照 `America/New_York` 时间自动识别并突出当前 Period，每 30 秒更新；课间、放学后和周末不会错误高亮。
4. 点击 **Add calendar to phone**，说明日历可以通过 Calendar export 添加到手机。

建议讲解：

> “这里把每天最常用的三类信息放在同一页面。学生既能快速浏览，也能搜索历史公告，不需要一直向下滚动寻找旧内容。”

### 第三部分：发现、加入与参与 Club/Team（约 4 分钟）

进入 **Activities & Clubs**。强调 Club、运动队和学校团队统一在同一个目录中，但可以通过类别与 Recruiting status 区分。

现场操作：

1. 切换“已加入的 Club”和“学校全部 Club”。
2. 使用兴趣、会议日或关键词筛选。
3. 打开一个 Club 详情页，展示封面、简介、会议、Advisor、公告、图片和 Club links。
4. 展示 Club 可以添加多个 Google Classroom、Instagram、Discord、YouTube、Website 或其他链接，并可分别删除。
5. 展示 `Recruiting / Paused / Closed` 状态。
6. 以学生身份提交加入申请。
7. 如果时间允许，展示 Club chat 的分页/加载更多和快速消息更新。

建议讲解：

> “Club 页面不仅是一个目录条目，而是长期维护的数字主页。学生看到的是准确的招募状态、会议安排和官方链接；负责人则在同一个后台持续更新。”

### 第四部分：学生个人中心（约 2 分钟）

打开 **Profile**。

重点展示：

- 已加入的 Club 与活动；
- 即将开始的事项和日历入口；
- Support requests 及其状态；
- Trip consent 等需要本人处理的事项；
- 账号资料与角色信息。

说明 Club applications 被弱化处理，因为学生更关心已经参加的组织、下一步行动和需要回复的请求。

### 第五部分：Club 管理工作区（约 4 分钟）

切换到社团负责人或 Advisor 账号，打开 **Manage Clubs**。普通学生如果没有管理权限，只会看到自己参与的 Club 与活动快捷入口。

现场操作：

1. 展示 Stream、Content、People、Media、Attendance、Finance、Operations、Settings 导航。
2. 发布一条 Club update，并选择是否使用媒体库图片。
3. 查看待处理 Membership request；拒绝时填写原因，学生可以看到原因并继续沟通。
4. 创建临时或永久签到码，展示 QR code 和签到记录。
5. 在 Settings 更新公开资料、招募状态和多个社交/资源链接。
6. 说明 Admin 可以维护任何 Club/Team 的信息并添加或删除 Advisor，但 Admin 不会被错误显示为该 Club 的 Advisor。

权限说明：

- Officer：维护被授权 Club 的日常内容；
- Advisor：监督成员、治理与 Club 运营；
- Staff/Admin：拥有学校级管理权限，但不会自动成为 Club Advisor；
- 数据库 RLS 继续作为服务器端权限边界，不能只依赖页面按钮隐藏。

### 第六部分：财务与学校运营流程（约 3 分钟）

在 Club workspace 打开 **Finance** 与 **Operations**。

可按时间选择展示：

- Fundraising：30-day warning → Treasurer review → final statement；
- Club budget：学年预算、金额和使用记录；
- Reimbursement：报销、收据编号或 PDF/图片上传；
- Trip plan：行程计划、Consent deadline、家长签名/文件和状态追踪；
- Constitution：修订版本、amendments、elections 和历史；
- Building/Event permit：Room → Security → Library → A/V 的顺序审批；
- BHS Event approval 与 Event Registration approval；
- 容量上限、waitlist 与候补递补。

建议讲解：

> “这些功能的重点不是把学校政策改成软件规则，而是把申请材料、负责人、当前状态与审计记录放在一个清晰流程中。学校现行政策仍然是最终依据。”

### 第七部分：Admin Operations（约 3 分钟）

切换到 Admin/Staff 账号，打开 Admin Dashboard。

建议展示：

1. **Approval Workflows**：集中处理 Trip、Event、Registration、Permit 和 Reimbursement。
2. **Club Data Tools**：CSV 导入先预览和逐行检查，再 Apply；必要时可 Rollback。
3. **Bulk actions**：批量 archive、category、school year 与 advisor 设置。
4. **Operations Dashboard**：stale content、queues、errors、usage。
5. **Zero-result analytics**：查看学生搜索了什么但没有结果，用于发现缺失信息。
6. **Analytics**：DAU、Search → Club、Join funnel、LCP、INP、CLS、日期范围、设备细分和 CSV export。
7. **Audit**：角色与全平台变更记录、全文搜索、筛选、分页与 CSV 导出。

建议讲解：

> “管理端不只负责发布内容，也帮助学校发现资料过期、学生找不到的内容、未完成审批以及性能问题。重要管理行为都有审计记录。”

### 第八部分：Support 双向沟通（约 2 分钟）

进入 **Support** 页面。

现场操作：

1. 搜索常见问题或选择 Club、Counseling、IT 支持。
2. 学生创建 Support request。
3. 在 **My requests** 打开请求，查看状态和完整对话。
4. 展示学生与 Support team 可以持续回复，而不是提交后失去联系。
5. 如有时间，切换到 Staff/Admin 展示 Support queue 和回复流程。

## 4. 15 分钟精简版时间表

| 时间 | 内容 | 核心信息 |
| --- | --- | --- |
| 0:00–1:30 | 主页、导航、搜索 | 一个统一入口，适配手机和电脑 |
| 1:30–4:00 | Updates、Calendar、Bell Schedule | 每日信息集中、可搜索、可导出 |
| 4:00–7:00 | Club 目录、详情与加入 | 发现、筛选、招募状态与官方主页 |
| 7:00–10:30 | Manage Clubs、成员与签到 | 学生组织可以维护内容和真实参与记录 |
| 10:30–13:00 | Finance、Trips、Permits | 把复杂流程变成有状态、有负责人、有记录的工作流 |
| 13:00–15:00 | Admin Dashboard、Audit、Analytics | 学校级监督、数据质量与持续改进 |

Support 和 Profile 可以在问答阶段补充展示。

## 5. 建议开场稿

> “今天我想展示 Bayside Hub。它的目标不是再增加一个学生需要记住的网站，而是把分散在公告、群聊、表单和不同页面中的校园参与信息集中起来。学生可以更快找到活动并采取行动；Club 和 Team 可以维护准确资料、成员和签到；学校工作人员可以通过审批、审计和数据分析确保信息可靠、流程透明。接下来我会分别从学生、社团负责人和管理人员三个视角展示。”

## 6. 建议结束稿

> “Bayside Hub 的价值可以概括为三个词：发现、参与和治理。学生更容易发现机会并参与；Club 和 Team 有可持续维护的工作空间；学校能够看到审批进度、信息质量和平台使用情况。当前我们继续以 Closed Beta 方式验证权限、数据准确性和实际工作流程，再根据学校政策与使用反馈逐步扩大范围。”

## 7. 校长可能提出的问题

### 学生隐私如何保护？

回答重点：使用学校账号和角色权限；Club 数据采用行级权限控制；财务、收据、Consent 与管理内容不会作为公开 Club 页面数据展示；演示和测试使用非真实敏感数据。

### 谁可以修改 Club 信息？

回答重点：被授权的 Club 管理者、Advisor、Staff 或 Admin；Admin 有学校级维护权限，但不会自动显示为 Club Advisor。重要修改进入审计记录。

### 如何避免错误或过期资料？

回答重点：招募状态、资料完整度、stale content 队列、Report outdated/incorrect info、Support 对话与 Admin 审核共同处理；Zero-result search 还能发现学生反复寻找却不存在的信息。

### 学生为什么不用 Google Classroom 或其他现有工具？

回答重点：Bayside Hub 不要求完全替代它们，而是提供学校统一发现入口。每个 Club 可以继续添加 Classroom、Instagram、Discord 或其他现有链接，但学生先在一个经过学校治理的页面找到正确入口。

### 是否支持手机？

回答重点：响应式页面、手机底部导航、Calendar export，以及 PWA/Add to Home Screen 基础支持。

### 是否已经可以正式全面上线？

回答重点：当前应保持 **Closed Beta**。先完成学校政策确认、数据迁移、权限测试、邮件/通知交付验证、备份与恢复演练，再决定正式发布范围。

### 学校如何衡量效果？

回答重点：DAU、搜索到 Club 的点击、加入流程完成率、零结果搜索、过期内容、审批积压和 Core Web Vitals；这些指标用于改善服务，不应用于不必要的学生画像。

## 8. 演示时应避免的事项

- 不要承诺 Closed Beta 中尚未经过学校验证的功能已经可以无条件正式上线。
- 不要展示真实学生的私密信息、Consent 文件、收据或支持对话。
- 不要现场运行数据库迁移、修改生产角色或批量删除数据。
- 不要把软件流程描述为替代 BHS 官方政策；它是执行与追踪工具。
- 不要在网络不稳定时临时上传大文件；提前准备演示数据。
- 如果某个队列为空，不要长时间解释空白页面，直接使用准备好的备用截图或切换到下一部分。

## 9. 演示成功标准

演示结束时，听众应清楚理解：

1. 学生如何在一个地方查看信息、发现 Club/Team、报名并跟踪请求；
2. Club 负责人如何管理内容、成员、签到、链接、财务和运营流程；
3. Staff/Admin 如何审批、审计、批量维护数据并发现服务缺口；
4. 权限、隐私和学校政策仍然是上线前的核心要求；
5. Closed Beta 下一步是用真实但受控的校园场景验证，而不是一次性替代所有系统。
