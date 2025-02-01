# 開発環境セットアップガイド

## 1. 事前にインストールしておかなければならないツール

以下のツールを事前にインストールしてください。

1. **Node.js**  
2. **GitHubのアカウント登録**  
3. **Visual Studio CodeおよびGitの連携**  

## 2. claspコマンドの基本知識

### ■ claspとは
- npmモジュールとして提供されている、`clasp`コマンドを使うツールです。

### ■ claspを使うことでできること
1. ローカルのコードをGASに反映できる
2. GASのコードをローカルに取り込める
3. ソースコードをGitで管理できる
4. GASのコードをコマンドラインからデプロイできる

### ■ 公式ドキュメント
- [clasp GitHub](https://github.com/google/clasp)

---

## 3. GitHubとの連携方法

### ■ 手順１: claspの導入

1. **claspのインストール**  
   任意のディレクトリで以下のコマンドを実行してください。
   ```bash
   npm install -g @google/clasp
   ```
   ※`@google/clasp`はGoogleが提供するclaspパッケージです。

2. **Google Apps Script APIの有効化**  
   以下のURLから有効にしてください。  
   [Google Apps Script API](https://script.google.com/home/usersettings)

### ■ 手順２: ローカルにGASを導入

1. **clasp login の実行**  
   任意のディレクトリで実行可能です。  
   - 実行するとブラウザが起動し、ドライブへのアクセス許可を求められます。  
   - 「Logged in! You may close this page.」と表示されたら完了です。  
   ※クローン先ディレクトリに「.clasp.json」がある場合は削除してから実行してください。

2. **既存のGASプロジェクトをローカルに導入する場合**  
   ※新規作成の場合は次の手順をご覧ください。  
   詳細は [参考URL](https://github.com/google/clasp?tab=readme-ov-file#clone) を参照してください。  
   ローカルディレクトリで以下を実行します。
   ```bash
   clasp clone "GASプロジェクトのID(またはURL)"
   ```
   ※プロジェクトIDはURL内の「/projects/」以降の文字列です。  
   ※Windows環境で「clasp: このシステムではスクリプトの実行が無効になっているため …」というエラーが出る場合は、[Qiitaの解決方法](https://qiita.com/Targityen/items/3d2e0b5b0b7b04963750) をご参照ください。

3. **新規作成する場合**  
   詳細は [参考URL](https://github.com/google/clasp?tab=readme-ov-file#create) を確認してください。  
   ローカルで以下のコマンドを実行します。
   ```bash
   clasp create --type standalone
   ```

### ■ 手順３: 連携確認

1. **clasp login の実行**  
   ※既に実行済みの場合は次の操作へ進みます。

2. 以下の動作が可能か確認してください。

   - **ローカル環境からGASの内容を変更する場合**
     ```bash
     clasp push
     ```
     ※実行後、GAS側でリロードが必要です。

   - **GASの内容をローカルに反映させる場合**
     ```bash
     clasp pull
     ```

### ■ 手順４: GitHubとの連携

**【注意】**  
- GitHubに上げる前に、ソースコードに機密情報が含まれていないか確認してください。  
- 機密情報はGASのプロパティサービスに格納してください（GitHubにはアップロードされません）。

1. **GitHubでリポジトリを作成**  
   詳細は [GitHub](https://github.com) を参照してください。

2. **ローカル環境で以下の手順を実行**

   1. リポジトリの初期化
      ```bash
      git init
      ```
   2. リモートリポジトリの追加
      ```bash
      git remote add origin <リポジトリのURL>
      ```
   3. 変更内容のステージング
      ```bash
      git add .
      ```
   4. コミット
      ```bash
      git commit -m "コミットメッセージ"
      ```
   5. プッシュ（ブランチ名は通常 `main` または `master`）
      ```bash
      git push origin <現在のブランチ名>
      ```

3. **連携が成功したか確認**

---

## 4. ローカル環境からGASを実行する方法

### ■ 手順１: Google Cloud Platformでの設定

1. **新規プロジェクトの作成**  
   GCPにて新規プロジェクトを作成してください（既存のプロジェクトを使用する場合はこの手順をスキップ）。  
   詳細は [公式HP](https://console.cloud.google.com/?hl=ja) を参照。  
   作成方法の例: [作成中の内容](https://drive.google.com/file/d/1rkTp23lsWOMrAiJUiJ95A0DXz5A5TUco/view?usp=sharing)

2. **Apps Script APIの有効化**  
   - GCPの「APIとサービス」 > 「ライブラリ」で「Apps Script API」を検索し、有効にしてください。  
     参考画像: [画面の状態](https://drive.google.com/file/d/1AIO2RmbHPlkcDZf3FbjRRdnLiOUTxBoo/view?usp=sharing)  
     対象ライブラリの有効化: [リンク](https://drive.google.com/file/d/1--BRkyh-3lbrgBw8LAw4ppUEGwfKH0G2/view?usp=sharing)

3. **OAuth 同意画面の設定**  
   「APIとサービス」 > 「OAuth 同意画面」で必要な設定を行ってください。

4. **OAuthクライアントIDの発行**  
   - 「APIとサービス」 > 「認証情報」で「認証情報を作成」 > 「OAuth クライアント ID」をクリックします。  
     詳細は [OAuthクライアントID作成ボタン](https://drive.google.com/file/d/1-Ig4N1BDTkteP0ExhL4UJD4i_eIdyPfa/view?usp=sharing) を参照。  
   - 「アプリケーションの種類」は「デスクトップアプリ」を選択してください。  
     詳細は [Application type: Desktop App](https://github.com/google/clasp/blob/master/docs/run.md#setup-instructions) を確認してください。  
   - 名前は任意で設定し、作成後にポップアップが表示されれば完了です。  
     [作成後のポップアップ](https://drive.google.com/file/d/1-JOdc9Zg2mNDr3jflrUf9nLdQG8x89By/view?usp=sharing)

### ■ 手順２: ローカル環境でGASを実行できるようにする

1. **JSONファイルのダウンロード**  
   - GCPのOAuthクライアント作成画面で「JSONをダウンロード」をクリックし、JSONファイルをローカルに保存してください。  
     詳細は [リンク](https://drive.google.com/file/d/1-JOdc9Zg2mNDr3jflrUf9nLdQG8x89By/view?usp=sharing) を参照。

2. **JSONファイルの配置**  
   - ダウンロードしたJSONファイルを対象プロジェクトのルートディレクトリに配置し、ファイル名を `creds.json` に変更してください。  
     詳細は [JSONファイル導入後](https://drive.google.com/file/d/1I0UGstNWAcHMQ9MCAbqdGHXHLFMH0aHB/view?usp=sharing) を参照。

3. **GASプロジェクトの設定**  
   - GASの「プロジェクトの設定」 > 「Google Cloud Platform（GCP）プロジェクト」で、GCPプロジェクトのプロジェクト番号を入力してください。  
     プロジェクト番号は、GCPの「Cloudの概要」 > 「ダッシュボード」 > 「プロジェクト情報」で確認できます。

4. **appsscript.jsonファイルの修正**  
   - `appsscript.json` の内容を、指定された値（※コピペ用の `appsscript` ファイル内の `copyPast` 変数の値）に変更してください。

5. **デプロイ設定**  
   - GASから「実行可能API」としてデプロイ設定を行ってください。

6. **認証**  
   - 以下のコマンドを実行して認証します。
     ```bash
     clasp login --creds .\creds.json
     ```
   - 認証が成功すると、`.clasprc.json` が生成されます。

7. **ローカル環境での実行確認**  
   - 以下のコマンドで関数を実行し、動作確認してください。
     ```bash
     clasp run <関数名>
     ```
   - ※事前に `clasp login --creds .\creds.json` により認証が必要です。

---

## 5. その他（デプロイ管理）

### ■ スクリプトのデプロイのリストアップ
- 以下のコマンドを実行してください。
  ```bash
  clasp deployments
  ```
  詳細は [参考URL](https://github.com/google/clasp/tree/master?tab=readme-ov-file#examples-8) をご参照ください。

### ■ 新規デプロイの作成
- 以下のコマンドで新規デプロイを作成します。
  ```bash
  clasp deploy -d "説明文"
  ```
  ※説明文は任意で追加できます。  
- GASプロジェクト上で新規デプロイが作成されていることを確認してください。

### ■ デプロイメントIDを使って新バージョンにする
- 以下のコマンドを実行してください。
  ```bash
  clasp deploy --deploymentId <デプロイID> -d "説明文"
  ```

---

## 6. 補足

### ■ `clasp login` と `clasp login --creds <file>` の違い

1. **clasp login**
   - ユーザーのGoogleアカウントに紐づいてGASにアクセスします。  
   - スクリプトのデプロイ、プロジェクトの作成・更新、コードのpull/pushが可能です。

2. **clasp login --creds <file>**
   - ユーザーのGoogleアカウントではなく、GCPプロジェクトのサービスアカウントに紐づけてアクセスします。  
   - `clasp run` を使って関数を実行できます。

### ■ `clasp run`
- GASの関数をローカルから実行するためのコマンドです。  
- 通常のOAuth認証（`clasp login`）ではなく、サービスアカウント認証（`clasp login --creds <file>`）を使用する必要があります。  
  詳細は [公式ドキュメント](https://github.com/google/clasp/blob/master/docs/run.md#run) をご確認ください。

---

# appsscript.gs

以下は `appsscript.gs` の内容です。

```javascript
const copyCode = {
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "executionApi": {
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.webapp.deploy",
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```
