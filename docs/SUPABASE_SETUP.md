# Supabase 手动配置与验收

目标项目：`kabrxgbqwkfowguzdfxb`。正式域名：`https://bayside-hub-demo.vercel.app`。
本轮只准备代码和 SQL，**没有执行远端迁移或添加生产 DEMO 数据**。

## 1. 先检查，再执行

先备份数据库，并确认 README 原有 migrations 已执行。不要为了更新而直接重跑旧的 starter-data 脚本。
下面的新增迁移依赖 `profiles`、`clubs`、`club_advisors`、`club_officers`、`announcements`、`club_messages` 以及已有的权限函数。
在 SQL Editor 先运行这个只读检查：

```sql
select to_regclass('public.profiles'), to_regclass('public.clubs'),
       to_regclass('public.club_advisors'), to_regclass('public.club_officers'),
       to_regclass('public.announcements'), to_regclass('public.club_messages');
select to_regprocedure('public.is_admin()'),
       to_regprocedure('public.can_manage_club(uuid)'),
       to_regprocedure('public.can_access_club_chat(uuid)');
select role, count(*) from public.profiles group by role;
```

若有 NULL 或未知身份，先停止，把结果发回来；不要删除表来解决。

## 2. 依次执行新增文件

每次复制一个完整 SQL 文件到 SQL Editor，运行成功后再执行下一个：

1. `supabase/account_roles_and_review.sql`：Teacher、Advisor 社团绑定、身份日志、学校公告审核。
2. `supabase/custom_permissions.sql`：自定义权限、社团权限查询、网站文字与管理日志。
3. `supabase/chat_recent_messages.sql`：聊天显示最新 100 条，而不是最早 100 条。
4. 可选 `supabase/demo_clubs.sql`：创建两个标记 `[DEMO]` 的草稿社团；重复执行不会覆盖内容。

旧账号不会按域名自动改身份。Advisor 改为其他基础身份时，会移除该账号全部 Advisor 社团绑定；独立董事会任命和自定义权限不随之撤销。
自定义权限不是任意数据库权限：支持社团内容、社团治理、网站介绍文字，不能授予管理员审核/账号管理能力。
角色定义删除会同时撤销其分配；请先检查影响范围。

## 3. Authentication 配置

- 启用 Email 注册与密码登录，保持 **Confirm email 开启**；不要为了测试关闭邮箱验证。
- Site URL 使用正式域名。Redirect URLs 允许该域名的 `/auth/callback` 路径；已有 Google OAuth 配置保留。
- 配置学校认可的邮件发送服务，验证确认邮件能够送到实际学校邮箱；密钥不要放进前端环境变量或 GitHub。
- 测试登录页 Forgot password：在同一浏览器打开重置邮件，经 `/auth/callback` 到 `/reset-password` 设置新密码；旧密码应失效。实际邮件投递尚未验证。
- 网站注册入口接受 `@nycstudents.net` 和 `@schools.nyc.gov`。前者为 Student，后者为 Teacher；Teacher 不自动获得 Advisor 或 Staff 权限。
- 数据库触发器负责身份默认值，不信任用户自行提交的 role metadata。网站注册域名限制不是 Supabase Auth 级别的注册封禁；若需要禁止所有其他域名创建 Auth 账号，还需配置并测试 Auth 注册限制。

## 4. DEMO 实测步骤

使用本人控制、获准测试的真实邮箱完成验证，不创建假学校邮箱。准备学生、董事会成员、Advisor、Staff、Admin 五个独立账号，使用独立浏览器会话。

1. Admin 在 `/clubs/manage` 找到两个 DEMO 草稿；打开管理页的 Publication status，需要测试公开浏览与加入时明确发布它们。`/admin/clubs` 是社团申请审核页，不是已建社团目录。
2. 在 `/admin/users` 将测试老师设为 Advisor，必须选择 Lab A。不要绑定 Lab B。
3. 在 `/clubs/manage` 的 Lab A 管理页，先批准测试学生入会，再任命为董事会成员；保留另一个普通成员账号。
4. Student 可阅读已发布信息；A 的成员可发聊天，但不能修改社团、审核学校公告或管理账号。
5. A 的董事会/Advisor 修改 A 内容、发布社团公告、上传无个人信息测试图片（最大 4 MB）；公开页核实显示，并检查 Club 修改记录。尝试修改 B 必须被拒绝。网页在上传前检查大小；Next.js 接收上限为 4.25 MiB，以容纳表单开销并低于 [Vercel 的请求体限制](https://vercel.com/docs/functions/limitations)。Storage 的原有 5 MiB 上限无需修改。
6. `/announcements/submit` 提交学校公告。审核前公开公告列表不能出现；Admin 在 `/admin/review` 拒绝一次、批准一次，确认拒绝原因与发布结果。重复审核不得重复发布。
7. `/admin/roles` 创建仅限 A 的内容编辑角色，分配并撤销；确认 B 不受影响，撤销后刷新旧管理页不能继续保存。
8. 分配 site-wide `site.manage`，在 `/manage/site` 改介绍文字，核实首页/关于/支持/页脚；撤销后应不能保存。
9. 两个成员会话测试消息发送、接收、删除；非成员不能读聊天。确认最新消息可见，超过 100 条时仍能看到最新消息。
10. 在 `/admin/audit` 验证身份变更记录和管理记录（也可使用下方查询）。
11. 管理页打开 “Edit or remove existing meetings & club posts”，修改一次会议、隐藏一次帖子并确认普通成员不可见；只删除 DEMO 记录，确认修改记录保留删除前内容。用 A 的董事会尝试操作 B 的内容应被拒绝。审计页按操作者邮箱和 UTC 日期筛选，翻页后筛选应保留。
12. 最后撤销测试权限、删除测试图片、归档两个 DEMO 社团；不要删除真实社团或账号。

不要把在 SQL Editor 以管理员身份运行成功当成 RLS 验收通过；拒绝测试必须用实际用户会话进行。

## 5. 只读核验

```sql
select tablename, rowsecurity from pg_tables where schemaname='public'
and tablename in ('school_announcement_submissions','custom_roles',
'custom_role_assignments','site_content','account_role_audit','management_audit','club_messages');
select tablename, policyname, cmd from pg_policies where schemaname='public'
and tablename in ('school_announcement_submissions','custom_roles',
'custom_role_assignments','site_content','account_role_audit','management_audit','club_messages');
select * from public.account_role_audit order by created_at desc limit 20;
select * from public.management_audit order by created_at desc limit 20;
```

全部相关表应开启 RLS。把错误文本发回来即可，不要发送密码、JWT、service_role key 或完整用户数据。

## 尚未达到正式上线验收

SQL 在目标项目的执行结果、五角色真实会话、邮件投递、照片上传与实时聊天均需要上面的实测。
Privacy/Terms 是 beta 告知文案，不代表学校或法律审核通过；正式开放前需确认负责人联系方式、保留期限、照片许可与学生数据处理要求。
管理面板尚不是所有数据库字段的通用编辑器：当前网站文字仅支持四个字段；审计页已有筛选与分页，全文搜索、导出和部分内容配置仍需完善。密码恢复入口已实现但邮件流程仍待实测。新增会议/帖子编辑删除沿用已有表，不需要本轮追加 SQL。
