# SFA02 デプロイ手順

## 1. GitHub Pages（フロントエンド）

### 自動デプロイ（推奨）
1. GitHubリポジトリの **Settings > Pages** を開く
2. **Source** を `GitHub Actions` に変更
3. `main` ブランチにマージすると自動デプロイされる

### 手動デプロイ
- Settings > Pages > Source で `Deploy from a branch` を選択
- Branch: `main`, Folder: `/ (root)` を指定して Save

公開URL: `https://<username>.github.io/SFA02/`

---

## 2. Google Apps Script（バックエンド）

### 初回セットアップ

1. **Google Spreadsheet を作成**
   - 新しい Google Spreadsheet を作成
   - スプレッドシートIDをメモ（URLの `/d/<ID>/edit` の部分）

2. **GAS プロジェクトを作成**
   - スプレッドシートの **拡張機能 > Apps Script** を開く
   - または https://script.google.com で新規プロジェクト作成

3. **コードをコピー**
   以下の4ファイルをGASエディタにコピー:
   - `gas/Code.gs` → Code.gs
   - `gas/SheetDB.gs` → SheetDB.gs
   - `gas/API.gs` → API.gs
   - `gas/Init.gs` → Init.gs

4. **スプレッドシートIDを設定**
   - GASエディタで **プロジェクトの設定**（歯車アイコン）を開く
   - **スクリプトプロパティ** に以下を追加:
     - プロパティ名: `SPREADSHEET_ID`
     - 値: 手順1でメモしたスプレッドシートID

5. **初期化を実行**
   - GASエディタで `initializeSpreadsheet` 関数を選択して実行
   - 初回は認証ダイアログが出るので許可する
   - 16個のシート＋ヘッダー行が自動作成される

6. **サンプルデータ投入（任意）**
   - `insertSampleData` 関数を実行するとテスト用データが挿入される

7. **Web App としてデプロイ**
   - **デプロイ > 新しいデプロイ** をクリック
   - 種類: **ウェブアプリ**
   - 実行ユーザー: **自分**
   - アクセス: **全員**（または組織内のみ）
   - デプロイをクリック
   - 表示される **Web App URL** をコピー

### フロントエンドとの接続

以下のいずれかの方法で GAS URL を設定:

**方法A: URLパラメータ**
```
https://<username>.github.io/SFA02/?gas=<GAS Web App URL>
```
一度アクセスすると localStorage に保存され、次回以降は自動接続。

**方法B: サイドバーから設定**
1. SFA02を開く
2. サイドバー下部の「モックモード」をクリック
3. GAS Web App URL を入力して「接続」

**方法C: ブラウザコンソール**
```javascript
API.setGasUrl('https://script.google.com/macros/s/xxxxx/exec');
```

### 接続解除
- サイドバーの「切断」リンクをクリック
- または `API.setGasUrl('')` をコンソールで実行

---

## 3. GAS 更新時の再デプロイ

コードを変更した場合:
1. GASエディタでコードを更新
2. **デプロイ > デプロイを管理** をクリック
3. 鉛筆アイコンをクリック → バージョン: **新しいバージョン**
4. デプロイを更新

> **注意**: URLは変わりません。バージョンを「新しいバージョン」にしないと変更が反映されません。
