このプロジェクトは、Next.js（フロントエンド）とNest.js（バックエンド）を使用して、HTTPキャッシュ機能（ETag・Last-Modified）を実装したデモアプリケーションです。

## 概要

### 実装機能

- **ETagキャッシュ**: バックエンドでETags生成、フロントエンドでキャッシュヒット時の304レスポンス処理
- **Last-Modifiedキャッシュ**: タイムスタンプベースのキャッシュ制御
- **商品一覧表示**: キャッシュ機能のデモンストレーション用のサンプルデータ

## 環境構築手順

```bash
# リポジトリをクローン
git clone <repository-url>
cd <project-directory>

# Docker Composeでアプリケーションを起動
docker-compose up --build
```

## 動作確認手順

### アプリケーションアクセス

1. **フロントエンド**: http://localhost:3000
2. **バックエンドAPI**: http://localhost:3001/api/products

### ETagキャッシュの動作確認

1. `products.controller.ts`の`@UseInterceptors(ETagInterceptor)`を有効化する
2. http://localhost:3000/e-tag にアクセス
3. ブラウザの開発者ツール（F12）でNetworkタブを開く
4. ページを再読み込み
5. 2回目以降のリクエストで304 Not Modifiedレスポンスを確認

**確認ポイント:**
- 初回リクエスト: 200 OK + ETagヘッダー
- 2回目以降: 304 Not Modified + If-None-Matchヘッダー
- コンソールに「キャッシュヒット」のログが表示される

### Last-Modifiedキャッシュの動作確認

1. `products.controller.ts`の`@UseInterceptors(LastModifiedInterceptor)`を有効化する
2. http://localhost:3000/last-modified にアクセス
3. 開発者ツールのNetworkタブを確認
4. ページを再読み込み（1分以内）
5. 304 Not Modifiedレスポンスを確認

**確認ポイント:**
- 初回リクエスト: 200 OK + Last-Modifiedヘッダー
- 1分以内の再リクエスト: 304 Not Modified + If-Modified-Sinceヘッダー
- 1分経過後: 200 OK + 新しいLast-Modifiedヘッダー

## 技術仕様

### バックエンド（Nest.js）

#### ETagインターセプター
- MD5ハッシュによるETag生成
- If-None-Matchヘッダーとの比較
- 304レスポンス時のnull返却

#### Last-Modifiedインターセプター
- タイムスタンプベースのキャッシュ制御
- 1分間のキャッシュ有効期限
- If-Modified-Sinceヘッダーとの比較

### フロントエンド（Next.js）

#### ETagキャッシュユーティリティ
- localStorage: ETag値の永続化
- sessionStorage: レスポンスデータの一時保存
- 自動的なキャッシュヒット/ミス判定

#### Last-Modifiedキャッシュ
- sessionStorage: タイムスタンプとデータの保存
- If-Modified-Sinceヘッダーの自動付与
- 304レスポンス時のキャッシュデータ使用
## 貢献

バグ報告や機能要望は、GitHubのIssuesでお知らせください。プルリクエストも歓迎します。
