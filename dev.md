# 專案開發指南

這份文件提供給參與專案的隊員，說明開發環境設定、Git 分支操作與專案的 npm 指令。

## 開發前準備

初次開起專案時請入入下面指令

```
npm i
```

接著編輯 `.env`，本機開發環境可使用下列設定：

> 正式機的參數部分請看群組文件

```dotenv
JWT_SECRET=請改成一組僅用於本機開發的隨機字串
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=student
DB_PASSWORD=student666
DB_DATABASE=skill
```

`.env` 包含本機環境與敏感資料，已列在 `.gitignore` 中，請勿將它 commit 或傳到 GitHub。

## 建立自己的 Git 分支

請勿直接在 `main` 分支開發。每一項功能或修正都建立獨立分支，完成後再透過 Pull Request 合併。

### 1. 取得最新的 main

```bash
git checkout main
git pull origin main
```

### 2. 建立並切換到新分支

分支名稱建議使用小寫英文與連字號，格式如下：

```text
feature/<功能名稱>
fix/<問題名稱>
docs/<文件名稱>
```

例如，要開發使用者資料 API：

```bash
git checkout -b feature/user-profile
```

確認目前所在分支：

```bash
git branch
```

`*` 號所在的那一行就是目前分支。

### 3. 開發、提交並推送分支

```bash
git status
git add .
git commit -m "feat: add user profile API"
git push -u origin feature/user-profile
```

`-u` 只需要在第一次推送該分支時使用。之後可直接執行 `git push`。

建議的 commit 類型：

| 類型       | 用途                     |
| ---------- | ------------------------ |
| `feat`     | 新增功能                 |
| `fix`      | 修正錯誤                 |
| `docs`     | 修改文件                 |
| `refactor` | 重構程式，不改變原有行為 |
| `chore`    | 工具、套件或其他維護作業 |

### 4. 開啟 Pull Request

將分支推送到 GitHub 後，建立一個合併到 `main` 的 Pull Request，並在內容中說明：

- 這次做了什麼
- 如何測試
- 是否有需要隊員特別注意的變更

等待隊員檢視後再合併，不要直接推送到 `main`。

### 開發中同步 main 的更新

當其他人已將新內容合併到 `main` 時，可以這樣同步：

```bash
git checkout main
git pull origin main
git checkout feature/user-profile
git merge main
```

如果發生衝突，請先與負責相關功能的隊員確認，解決衝突並測試後再 commit。

## npm 指令說明

### 安裝依賴

```bash
npm ci
```

使用 `package-lock.json` 的鎖定版本進行乾淨安裝。如果你要新增套件，請改用：

```bash
npm install <套件名稱>
```

新增套件後，請將 `package.json` 與 `package-lock.json` 一起提交。

### 啟動專案

```bash
npm start
```

這個指令會：

1. 使用 Docker Compose 在背景啟動 PostgreSQL。
2. 啟動 Node.js API 伺服器。

API 預設網址為 `http://localhost:3010`。要停止 Node.js 伺服器，在終端按 `Ctrl + C`。

### 建立資料表與開發用資料

請先確認 PostgreSQL 已啟動，然後執行：

```bash
npm run sql
```

這個指令會建立專案需要的資料表，並寫入開發用的種子資料。種子資料可安全地重複執行。

### 停止資料庫

```bash
npm run stop
```

這個指令會停止 Docker Compose 中的 PostgreSQL 服務，但不會刪除已建立的資料。

### 測試

```bash
npm test
```

目前專案尚未建立自動化測試，因此這個指令會顯示 `Error: no test specified` 並以失敗狀態結束。這是目前的預期行為。

## 常用開發流程

```bash
# 1. 從最新 main 建立分支
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. 安裝依賴並啟動專案
npm ci
npm start

# 3. 第一次使用資料庫時，另開終端執行
npm run sql

# 4. 開發完成後提交與推送
git status
git add .
git commit -m "feat: add user profile API"
git push -u origin feature/user-profile
```
