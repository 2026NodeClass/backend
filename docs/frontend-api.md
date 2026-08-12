# 前端 API 串接文件

本文件依目前後端程式碼整理，供前端開發與串接使用。

## 基本資訊

| 項目 | 內容 |
| --- | --- |
| 本機 Base URL | `http://localhost:3010` |
| API 前綴 | `/api` |
| Request Content-Type | `application/json` |
| 驗證方式 | JWT Bearer Token |
| Token 有效時間 | 1 小時 |

除註冊、登入以外的 API，請在 request header 帶入：

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### 前端共用 request 範例

```js
const API_BASE_URL = 'http://localhost:3010';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'API 請求失敗');
  }

  return result;
}
```

## 權限說明

| 權限 | 可使用的 API |
| --- | --- |
| 未登入 | 註冊、登入 |
| 一般會員 `user` | 收藏清單、新增收藏、取消收藏 |
| 管理員 `admin` | 一般會員功能，以及星系、行星的查詢與 CRUD |

> **目前實作限制：** 星系與行星的「查詢」也位於 `/api/admin`，因此一般會員無法直接取得全部星系或行星。若一般會員頁面需要瀏覽這些資料，後端需另外提供公開或一般會員可用的查詢路由。

## API 一覽

| Method | Path | 權限 | 用途 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 公開 | 註冊 |
| `POST` | `/api/auth/login` | 公開 | 登入並取得 Token |
| `GET` | `/api/favorites` | 已登入 | 取得自己的收藏 |
| `POST` | `/api/favorites/:planetId` | 已登入 | 收藏行星 |
| `DELETE` | `/api/favorites/:planetId` | 已登入 | 取消收藏 |
| `GET` | `/api/admin/galaxies` | 管理員 | 取得全部星系 |
| `POST` | `/api/admin/galaxies` | 管理員 | 新增星系 |
| `PATCH` | `/api/admin/galaxies/:id` | 管理員 | 修改星系 |
| `DELETE` | `/api/admin/galaxies/:id` | 管理員 | 刪除星系 |
| `GET` | `/api/admin/planets` | 管理員 | 取得或篩選行星 |
| `POST` | `/api/admin/planets` | 管理員 | 新增行星 |
| `PATCH` | `/api/admin/planets/:id` | 管理員 | 修改行星 |
| `DELETE` | `/api/admin/planets/:id` | 管理員 | 刪除行星 |

## 資料格式

### User

```ts
interface User {
  id: string; // UUID
  name: string;
  email: string;
  role: 'user' | 'admin';
}
```

### Galaxy

```ts
interface Galaxy {
  id: string;    // 自訂識別碼，例如 "writing"
  name: string;  // 中文名稱
  en: string;    // 英文名稱
  color: string; // #RRGGBB
  desc: string;
}
```

### Planet

```ts
interface Planet {
  id: string; // 由後端產生，例如 "p1"
  galaxy: string; // Galaxy.id
  type: 'prompt' | 'skill';
  name: string;
  en: string;
  coord: string; // 唯一值
  difficulty: number; // 1～5
  uses: number; // 0 以上整數
  summary: string;
  body: string;
}
```

### Favorite

收藏清單會將收藏資訊與行星資料合併回傳：

```ts
interface Favorite extends Planet {
  favorite_id: number;
  favorited_at: string; // ISO 8601 日期時間字串
}
```

## 會員驗證

### 註冊

`POST /api/auth/register`

不需 Token。`name`、`email`、`password` 都是必填，密碼至少 8 個字元。角色固定由後端建立為 `user`，前端傳入 `role` 不會生效。

Request body：

```json
{
  "name": "王小明",
  "email": "ming@example.com",
  "password": "password123"
}
```

成功回應 `201 Created`：

```json
{
  "message": "註冊成功",
  "data": {
    "id": "e7b5f568-a3e1-4d62-b6f7-61d885e930cb",
    "name": "王小明",
    "email": "ming@example.com",
    "role": "user",
    "created_at": "2026-08-11T08:00:00.000Z"
  }
}
```

可能錯誤：

| Status | `message` |
| --- | --- |
| `400` | `請輸入名稱、帳號與密碼` |
| `400` | `密碼至少需要 8 個字元` |
| `409` | `此 Email 已註冊` |

### 登入

`POST /api/auth/login`

不需 Token。

Request body：

```json
{
  "email": "ming@example.com",
  "password": "password123"
}
```

成功回應 `200 OK`：

```json
{
  "message": "登入成功",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "id": "e7b5f568-a3e1-4d62-b6f7-61d885e930cb",
      "name": "王小明",
      "email": "ming@example.com",
      "role": "user"
    }
  }
}
```

前端登入成功後可保存 `data.token`，之後透過 `Authorization` header 傳送。收到 `401` 時應清除 Token 並導回登入頁。

可能錯誤：

| Status | `message` |
| --- | --- |
| `400` | `請輸入帳號與密碼` |
| `401` | `帳號或密碼錯誤` |

## 收藏

以下端點皆需要一般會員或管理員 Token，收藏操作對象固定為 Token 所屬使用者。

### 取得自己的收藏

`GET /api/favorites`

成功回應 `200 OK`：

```json
{
  "message": "success",
  "data": [
    {
      "favorite_id": 12,
      "favorited_at": "2026-08-11T08:00:00.000Z",
      "id": "p1",
      "galaxy": "writing",
      "type": "prompt",
      "name": "文章摘要",
      "en": "Article Summary",
      "coord": "W-001",
      "difficulty": 2,
      "uses": 10,
      "summary": "將長文整理成重點摘要",
      "body": "請將以下文章整理成條列摘要……"
    }
  ]
}
```

沒有收藏時，`data` 為空陣列 `[]`。

### 新增收藏

`POST /api/favorites/:planetId`

不需要 request body。

```js
await apiRequest('/api/favorites/p1', { method: 'POST' });
```

成功回應 `201 Created`：

```json
{
  "message": "收藏成功",
  "data": {
    "id": 12,
    "user_id": "e7b5f568-a3e1-4d62-b6f7-61d885e930cb",
    "planet_id": "p1",
    "created_at": "2026-08-11T08:00:00.000Z"
  }
}
```

可能錯誤：

| Status | `message` |
| --- | --- |
| `404` | `找不到指定的行星` |
| `409` | `已收藏此行星` |

### 取消收藏

`DELETE /api/favorites/:planetId`

路徑參數使用的是行星 ID，不是 `favorite_id`。不需要 request body。

成功回應 `200 OK`：

```json
{
  "message": "取消收藏成功",
  "data": {
    "id": 12,
    "user_id": "e7b5f568-a3e1-4d62-b6f7-61d885e930cb",
    "planet_id": "p1",
    "created_at": "2026-08-11T08:00:00.000Z"
  }
}
```

可能錯誤：

| Status | `message` |
| --- | --- |
| `404` | `找不到指定的收藏` |

## 後台：星系管理

以下端點皆需要 `role: "admin"` 的 Token。

### 取得全部星系

`GET /api/admin/galaxies`

成功回應 `200 OK`：

```json
{
  "message": "success",
  "data": [
    {
      "id": "writing",
      "name": "寫作星系",
      "en": "Writing Galaxy",
      "color": "#5B8DEF",
      "desc": "寫作與內容產生相關工具"
    }
  ]
}
```

### 新增星系

`POST /api/admin/galaxies`

所有欄位皆必填。

Request body：

```json
{
  "id": "writing",
  "name": "寫作星系",
  "en": "Writing Galaxy",
  "color": "#5B8DEF",
  "desc": "寫作與內容產生相關工具"
}
```

欄位規則：

| 欄位 | 規則 |
| --- | --- |
| `id` | 字串，最多 50 字元，且不可重複 |
| `name` | 字串，最多 100 字元 |
| `en` | 字串，最多 150 字元 |
| `color` | HEX 色碼，格式必須為 `#RRGGBB` |
| `desc` | 字串 |

成功回應 `200 OK`，`data` 為新增完成的 `Galaxy`。

可能錯誤：

| Status | `message` |
| --- | --- |
| `400` | `請填寫完整的星系資料` |
| `400` | `欄位格式或數值不符合規則` |
| `409` | `星系 ID 已存在` |

### 修改星系

`PATCH /api/admin/galaxies/:id`

可只傳需要修改的欄位；`id` 不可修改，未列出的欄位會被忽略。

Request body 範例：

```json
{
  "name": "進階寫作星系",
  "color": "#3366FF"
}
```

可修改欄位：`name`、`en`、`color`、`desc`。

成功回應 `200 OK`，`data` 為修改後的 `Galaxy`。若傳入空物件，也會回傳成功與原資料。

可能錯誤：

| Status | `message` |
| --- | --- |
| `400` | `欄位格式或數值不符合規則` |
| `404` | `找不到指定的星系` |

### 刪除星系

`DELETE /api/admin/galaxies/:id`

成功回應 `200 OK`，`data` 為刪除前的 `Galaxy`。

可能錯誤：

| Status | `message` |
| --- | --- |
| `404` | `找不到指定的星系` |
| `409` | `此星系仍有行星，無法刪除` |

## 後台：行星管理

以下端點皆需要 `role: "admin"` 的 Token。

### 取得全部行星

`GET /api/admin/planets`

成功回應 `200 OK`：

```json
{
  "message": "success",
  "data": [
    {
      "id": "p1",
      "galaxy": "writing",
      "type": "prompt",
      "name": "文章摘要",
      "en": "Article Summary",
      "coord": "W-001",
      "difficulty": 2,
      "uses": 10,
      "summary": "將長文整理成重點摘要",
      "body": "請將以下文章整理成條列摘要……"
    }
  ]
}
```

### 依星系篩選行星

`GET /api/admin/planets?galaxy=:galaxyId`

`galaxy` 應傳入星系 ID，例如：

```http
GET /api/admin/planets?galaxy=writing
```

成功回應 `200 OK`，格式與取得全部行星相同，`message` 為 `篩選成功`。

若查無資料，回應 `404 Not Found`：

```json
{
  "message": "沒有找到你所篩選的星系"
}
```

> 此 `404` 只代表該篩選值沒有任何行星，不一定代表星系本身不存在。

### 新增行星

`POST /api/admin/planets`

除了 `uses` 外，其餘欄位皆必填。行星 `id` 由後端自動產生，前端不需傳入。

Request body：

```json
{
  "galaxy": "writing",
  "type": "prompt",
  "name": "文章摘要",
  "en": "Article Summary",
  "coord": "W-001",
  "difficulty": 2,
  "uses": 0,
  "summary": "將長文整理成重點摘要",
  "body": "請將以下文章整理成條列摘要……"
}
```

欄位規則：

| 欄位 | 規則 |
| --- | --- |
| `galaxy` | 必須是已存在的 `Galaxy.id` |
| `type` | 只能是 `prompt` 或 `skill` |
| `name` | 字串，最多 150 字元 |
| `en` | 字串，最多 150 字元 |
| `coord` | 字串，最多 30 字元，且不可重複 |
| `difficulty` | 整數，範圍 1～5 |
| `uses` | 選填；0 以上整數，未傳時預設為 0 |
| `summary` | 字串 |
| `body` | 字串 |

成功回應 `200 OK`，`data` 為新增完成的 `Planet`。

可能錯誤：

| Status | `message` |
| --- | --- |
| `400` | `欄位資料不完整` |
| `400` | `欄位格式或數值不符合規則` |
| `409` | `指定的星系不存在` |
| `409` | `資料已存在，請確認 ID 或座標是否重複` |

### 修改行星

`PATCH /api/admin/planets/:id`

可只傳需要修改的欄位；`id` 不可修改，未列出的欄位會被忽略。

Request body 範例：

```json
{
  "difficulty": 3,
  "uses": 25,
  "summary": "更新後的摘要"
}
```

可修改欄位：`galaxy`、`type`、`name`、`en`、`coord`、`difficulty`、`uses`、`summary`、`body`。

成功回應 `200 OK`，`data` 為修改後的 `Planet`。若傳入空物件，也會回傳成功與原資料。

可能錯誤：

| Status | `message` |
| --- | --- |
| `400` | `欄位格式或數值不符合規則` |
| `404` | `找不到指定的行星` |
| `409` | `指定的星系不存在` |
| `409` | `資料已存在，請確認 ID 或座標是否重複` |

### 刪除行星

`DELETE /api/admin/planets/:id`

成功回應 `200 OK`，`data` 為刪除前的 `Planet`。刪除行星時，相關收藏會由資料庫一併刪除。

可能錯誤：

| Status | `message` |
| --- | --- |
| `404` | `找不到指定的行星` |

## 共用錯誤回應

### 驗證與權限錯誤

| Status | 發生情境 | Response body |
| --- | --- | --- |
| `401` | 未帶 Token 或格式不是 `Bearer <token>` | `{ "message": "請先登入" }` |
| `401` | Token 無效或超過 1 小時 | `{ "message": "Token 無效或已過期" }` |
| `403` | 一般會員存取後台 API | `{ "message": "需要管理員權限" }` |

### 其他錯誤

| Status | 發生情境 | Response body |
| --- | --- | --- |
| `400` | 資料庫欄位格式、長度或數值限制不符 | `{ "message": "欄位格式或數值不符合規則" }` |
| `404` | API 路徑不存在 | `{ "error": "Not Found" }` |
| `409` | 唯一值或資料關聯衝突 | `{ "message": "..." }` |
| `500` | 非預期伺服器錯誤 | `{ "message": "伺服器發生錯誤" }` |

前端請同時相容 `message` 與全域 404 使用的 `error` 欄位。

## 前端串接注意事項

1. 登入成功後請保存 `data.token` 和 `data.user`；Token 會在 1 小時後失效。
2. 除登入、註冊外，請為每個 request 加上 `Authorization: Bearer <token>`。
3. HTTP status 才是成功或失敗的主要判斷依據，不要只比對 `message` 字串。
4. 新增星系與新增行星成功時目前回傳 `200`，不是常見的 `201`。
5. 取消收藏使用 `planetId`，不是收藏資料的 `favorite_id`。
6. 日期時間為 UTC ISO 8601 字串；顯示時可由前端轉換成使用者所在時區。
7. 目前後端尚未啟用 CORS。若前端與 API 不同 origin（例如前端在 `localhost:5173`），瀏覽器會阻擋請求，需由後端啟用 CORS 或由前端開發伺服器設定 proxy。
8. 目前沒有 refresh token API；Token 過期後需重新登入。

