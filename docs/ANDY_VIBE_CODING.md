# Andy Lin：Stellar Archive 的 Vibe Coding 案例

## 一句話定義

我把 Vibe Coding 當成「以自然語言驅動探索與實作，但每個結果都必須能被 Git diff、測試或實際 API 行為驗證」的開發方式。

## 任務背景

團隊把最初的前端 prototype 拆成正式的 frontend / backend repos，資料模型也從：

- `categories` 改為 `galaxies`
- `skills` 改為 `planets`
- 整數 user id 改為 UUID
- 靜態前端資料改為 PostgreSQL API

我的任務是完成公開 catalog API，並讓 Explore 與 PlanetDetail 使用真實後端資料。登入註冊、收藏、管理後台與 3D 銀河不在我的負責範圍。

## 我的 AI 協作流程

### 1. 先建立正確上下文

我先請 AI 協助閱讀並交叉比對：

- `dev.md` 的 branch / PR 規範
- `db/seed_data.sql` 與 `db/seed_data.js`
- TypeORM entities
- 原本前端 `data.js` 的欄位
- Explore 與 PlanetDetail 需要的資料形狀

這一步先解決「團隊資料庫已改版，但我的舊畫面仍使用舊欄位」的風險，而不是立刻產生程式碼。

### 2. 把工作拆成兩個小交付

第一個 PR 只處理 backend public catalog：

- `GET /api/galaxies`
- `GET /api/planets`
- `GET /api/planets/search`
- `GET /api/planets/:id`

第二個 PR 再處理 frontend integration：

- API client
- Explore 動態資料
- PlanetDetail 單筆讀取與相關項目
- loading / error / abort

小範圍讓 AI 較不容易改到其他組員的登入、收藏和 admin 功能，也讓 review 與 rollback 更單純。

### 3. 人負責關鍵判斷

AI 可以提出 controller、hook 或 error handling 寫法，但下列決定由我確認：

- SQL 條件必須使用 placeholder，不能把 query string 直接插入 SQL。
- 不合法的 `type` 回 `400`，不存在的 galaxy / planet 回 `404`。
- API 欄位要配合前端既有星圖資料契約，減少 UI 端轉換。
- React request 要能取消，並清楚顯示 loading / failure。
- 只修改自己的 feature scope，透過 PR 合併，不直接推 main。

### 4. 用驗證取代「AI 說完成了」

我的驗證包含：

- 比對 migration / seed / entity 欄位
- 實際執行 seed 並確認預期資料量
- 執行 Node.js 語法與測試
- 執行 frontend build / lint
- 閱讀 Git diff，確認沒有誤改登入、收藏與 admin
- 從 frontend 發 request，確認畫面資料與 API response 一致

## 可以在面試時怎麼說

> 我會用 AI 加快陌生 codebase 的理解、產生第一版實作和找 edge cases，但我不把「AI 產生程式」當作完成。我先定義 scope 與驗收條件，再檢查 schema、SQL 安全、錯誤碼和前端狀態，最後用 build、test、實際 request 和 Git diff 驗證。Stellar Archive 裡，我用這套方式完成公開 catalog API，以及 Explore / PlanetDetail 從 mock data 改接 PostgreSQL API；兩邊都有獨立 commit 和 PR 可以追溯。

## 可驗證的成果

- [Backend public catalog API commit](https://github.com/2026NodeClass/backend/commit/f6b6036b486d8358124a9e93deb57af6996b2325)
- [Backend PR #1](https://github.com/2026NodeClass/backend/pull/1)
- [Frontend catalog integration commit](https://github.com/2026NodeClass/frontend/commit/83372df2934e2554d1a825cd31b3d196c3eb1e5d)
- [Frontend PR #2](https://github.com/2026NodeClass/frontend/pull/2)

## 我不會宣稱的部分

- 我沒有負責登入註冊、收藏 API、ADMIN CRUD 或 3D Galaxy。
- 這是團隊專案，不會把整套產品寫成個人獨立完成。
- 現有測試覆蓋率不足，因此不會宣稱 production-ready。

這些邊界能讓面試官更信任我的說明，也能把焦點放在我真正能深入解釋的 API、資料契約、SQL 與前後端整合。
