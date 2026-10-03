# Stellar Archive Backend

Stellar Archive 是一個以「星際探索」包裝 AI Skill / Prompt 知識庫的團隊專案。後端提供公開目錄搜尋、會員驗證、個人收藏及管理者 CRUD，讓前端可以從靜態示範資料轉為真正的 PostgreSQL 資料來源。

- 前端：[2026NodeClass/frontend](https://github.com/2026NodeClass/frontend)
- 線上網站：[Stellar Archive](https://2026nodeclass.github.io/frontend/)

## 技術棧

| 分類 | 技術 |
| --- | --- |
| Runtime | Node.js、Express 5、CommonJS |
| Database | PostgreSQL、pg、TypeORM EntitySchema |
| Security | JWT、bcrypt、USER / ADMIN 權限 |
| Infrastructure | Docker Compose、Zeabur |
| Testing | Node.js built-in test runner |

## 系統範圍

- 註冊與登入，後端決定新帳號角色並簽發 JWT
- 公開取得 galaxies、planets、單一 planet 與條件搜尋
- 搜尋支援 `keyword`、`galaxy`、`type`，並使用參數化 SQL
- 登入會員可新增、取得及刪除自己的收藏
- 管理員可維護 galaxy 與 planet
- seed 使用 upsert，可重複建立 1 位管理員、3 個 galaxies 與 14 個 planets

## API 摘要

| Method | Path | 權限 | 說明 |
| --- | --- | --- | --- |
| GET | `/api/health` | 公開 | 健康檢查 |
| POST | `/api/auth/register` | 公開 | 註冊會員 |
| POST | `/api/auth/login` | 公開 | 登入並取得 JWT |
| GET | `/api/galaxies` | 公開 | 取得所有星系 |
| GET | `/api/planets` | 公開 | 取得所有星球 |
| GET | `/api/planets/search` | 公開 | 以 keyword / galaxy / type 搜尋 |
| GET | `/api/planets/:id` | 公開 | 取得單一星球 |
| GET / POST / DELETE | `/api/favorites` | JWT | 管理自己的收藏 |
| CRUD | `/api/admin/galaxies` | ADMIN | 維護星系 |
| CRUD | `/api/admin/planets` | ADMIN | 維護星球 |

完整 request、response 與錯誤碼請見 [`docs/frontend-api.md`](docs/frontend-api.md)。

## Andy Lin 負責的部分

Andy 負責把公開 Skill / Prompt 目錄從資料庫送到前端，範圍跨越後端 API 與 React 串接：

### Backend — Public Catalog API

- 建立 galaxies 與 planets 的公開查詢路由
- 實作多條件搜尋與 `skill` / `prompt` 類型驗證
- 使用 `$1`、`$2` 等 placeholder 組合參數化 SQL，避免直接拼接使用者輸入
- 處理不存在的 galaxy / planet，分別回傳明確的 `404`
- 補上 CORS 與 health route，支援前後端分離開發

實作紀錄：[backend commit `f6b6036`](https://github.com/2026NodeClass/backend/commit/f6b6036b486d8358124a9e93deb57af6996b2325) · [PR #1](https://github.com/2026NodeClass/backend/pull/1)

### Frontend — Catalog Integration

- 建立集中式 catalog API client 與環境變數 base URL
- 以 `Promise.all` 平行讀取 galaxies 與 planets
- 將 Explore 星圖從靜態陣列改為後端資料
- 將 PlanetDetail 改為依 route id 載入單筆資料與同星系推薦
- 加入 `AbortController`、loading 與錯誤狀態，避免元件卸載後仍更新 state

實作紀錄：[frontend commit `83372df`](https://github.com/2026NodeClass/frontend/commit/83372df2934e2554d1a825cd31b3d196c3eb1e5d) · [PR #2](https://github.com/2026NodeClass/frontend/pull/2)

## Andy 如何使用 Vibe Coding

這個專案中的 Vibe Coding 不是「請 AI 做完整網站」，而是一段可驗證的協作流程：

1. **先提供上下文**：讓 AI 閱讀 `dev.md`、schema、seed、TypeORM entities 與現有畫面，先釐清 `categories → galaxies`、`skills → planets`、user id 改為 UUID 等團隊變更。
2. **把需求縮成可驗收任務**：先完成公開 catalog API，再處理 Explore / PlanetDetail 串接，避免同時改登入、收藏或管理後台。
3. **由人決定資料契約與風險**：確認 API 回傳欄位能直接供星圖使用；搜尋採參數化 SQL；前端要有 abort、loading 與 error state。
4. **讓 AI 協助產生與重構**：用 AI 建議 route / controller 結構、比對前後端欄位並找出重複邏輯，再由人審查實際 diff。
5. **用工具驗證，不憑感覺宣布完成**：執行 migration / seed、確認資料筆數、跑語法檢查與前端 build，再以 feature branch 和 Pull Request 交付。
6. **保留清楚的責任邊界**：登入註冊、收藏、管理後台和 3D 銀河由其他組員負責；作品介紹只主張 Git 歷史能驗證的部分。

完整案例整理在 [`docs/ANDY_VIBE_CODING.md`](docs/ANDY_VIBE_CODING.md)。

## 快速開始

需求：Node.js 20 以上與 Docker Desktop。

```bash
npm ci
cp .env.example .env
npm run dev
```

Windows PowerShell 可將第二行改成 `Copy-Item .env.example .env`。

首次啟動資料庫後，另開終端機執行：

```bash
npm run sql
```

API 預設位於 `http://localhost:3010`。

## 測試

```bash
npm test
```

目前測試先守住 JWT secret 缺失時的登入錯誤處理。下一步應補 catalog、search、收藏資料隔離與 ADMIN 權限測試，並在 PR 上自動執行。

## 團隊協作紀錄

下列是依 Git 歷史整理的代表性分工，不代表每位成員的全部貢獻：

| 成員 | 代表性範圍 |
| --- | --- |
| Andy Lin | 公開 catalog API、Explore / PlanetDetail 串接 |
| SuMaoXiong | PostgreSQL / TypeORM 結構、管理端、部署設定 |
| JeremyC8891 | 註冊登入、JWT 與未登入權限處理 |
| YinChe | 3D 銀河與 VoyageMap 前端整合 |

## 已知限制

- 自動化測試仍少，尚未覆蓋主要 catalog 與 favorites 流程。
- `/api/health` 目前只證明應用可回應；部署 smoke test 還應實際讀取 galaxies、planets 與 search。
- 作品尚缺 Skill 作者、來源、license、相容 Agent、版本與更新時間等可信度 metadata。
- 正式環境應加入 CI、部署 commit SHA、監控、rate limiting 與 secrets 管理。
