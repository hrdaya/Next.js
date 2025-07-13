# ECSデプロイ用スクリプト

このディレクトリには、Next.jsアプリケーションをAmazon ECSにデプロイするためのスクリプトと設定ファイルが含まれています。
CI/CDパイプライン (AWS CodePipeline, CodeBuild, CodeDeploy) を使用した自動デプロイを想定しています。

## ファイル一覧

- `buildspec.yml`: AWS CodeBuildがDockerイメージのビルドとECRへのプッシュを行うためのビルド仕様です。また、デプロイ時に使用する`appspec.yml`も動的に生成します。
- `task-definition.json`: ECSタスクを定義します。使用するDockerコンテナ、CPU/メモリの割り当て、環境変数などが含まれます。
- `appspec.yml`: AWS CodeDeployがBlue/Greenデプロイメントを管理するために使用します。（注意: このファイルは`buildspec.yml`によって動的に生成されるため、ビルド時に上書きされます）

## CI/CDによるデプロイ手順 (AWS CodePipeline)

1. **パイプラインの作成:**
   - **ソースステージ:** GitHubやAWS CodeCommitにリポジトリを接続します。
   - **ビルドステージ:** AWS CodeBuildプロジェクトを設定します。
     - **ビルド仕様:** `deploy/buildspec.yml` ファイルを使用するように設定します。
     - **環境変数:** 必要な環境変数（`AWS_ACCOUNT_ID`, `IMAGE_REPO_NAME`, `CONTAINER_NAME`など）を設定します。
     - **アーティファクト:** ビルドステージの出力アーティファクトとして `imagedefinitions.json` と動的生成された `appspec.yml` を設定します。
   - **デプロイステージ:** AWS CodeDeployを設定します。
     - **アクションプロバイダ:** "Amazon ECS (Blue/Green)" を選択します。
     - **入力アーティファクト:** ビルドステージで生成されたアーティファクトを指定します。
     - **タスク定義:** `deploy/task-definition.json` を参照します。
     - **AppSpec:** ビルドステージで動的生成された `appspec.yml` を参照します。

2. **デプロイの実行:**
   - ソースリポジトリにコードをプッシュすると、CodePipelineが自動的にトリガーされます。
   - パイプラインが各ステージ（ソース -> ビルド -> デプロイ）を順に実行し、アプリケーションがECSにデプロイされます。

## CodeBuild 詳細

### `Dockerfile` と `.dockerignore` の関係

- `buildspec.yml` 内の `docker build` コマンドは `-f deploy/Dockerfile .` のように実行されます。
- `-f deploy/Dockerfile` オプションにより、`deploy` ディレクトリ内の `Dockerfile` が使用されます。
- ビルドコンテキスト `.` はプロジェクトのルートディレクトリを指します。
- Dockerはビルドコンテキストのルートにある `.dockerignore` ファイルを自動的に読み込むため、`.dockerignore` はプロジェクトのルートディレクトリに配置する必要があります。

### `CMD ["node", "server.js"]` を使用する理由

- `next.config.js` で `output: 'standalone'` を設定しています。
- これにより、`pnpm build` を実行すると、`.next/standalone` ディレクトリに、デプロイに必要な最小限のファイル（依存関係を含む）が出力されます。
- このスタンドアロンサーバーは、`node server.js` コマンドで起動します。
- `next start` ではなくこの方法を使用することで、Dockerイメージのサイズを大幅に削減し、セキュリティを向上させることができます。

### 読み取り専用ファイルシステム (`readonlyRootFilesystem`)

- セキュリティを向上させるため、ECSタスク定義でコンテナのファイルシステムを読み取り専用に設定しています (`"readonlyRootFilesystem": true`)。
- これにより、コンテナ内で予期しないファイルの作成や変更を防ぎ、潜在的な攻撃対象領域を減らします。
- Next.jsの `output: 'standalone'` モードは、実行時にファイルシステムへの書き込みを行わないため、この設定と互換性があります。
- もしアプリケーションがキャッシュなどでファイル書き込みを必要とする場合は、この設定を見直すか、書き込み可能な外部ボリューム（EFSなど）をマウントする必要があります。

### 動的ファイル生成 (`appspec.yml`)

- `buildspec.yml`では、ビルド時に`appspec.yml`を動的に生成します。
- これにより、`CONTAINER_NAME`環境変数を使用して、コンテナ名を環境ごとに柔軟に設定できます。
- リポジトリ内の`deploy/appspec.yml`ファイルは参考用のテンプレートとして機能し、実際のデプロイでは`buildspec.yml`で生成されたファイルが使用されます。
- この方法により、`task-definition.json`、`buildspec.yml`、`appspec.yml`の全てで一貫したコンテナ名を使用できます。

### CodeBuild 環境変数

CodeBuildプロジェクトには、以下の環境変数を設定する必要があります。

- `AWS_ACCOUNT_ID`: あなたのAWSアカウントID。
- `AWS_DEFAULT_REGION`: ECRリポジトリが存在するリージョン (例: `ap-northeast-1`)。
- `IMAGE_REPO_NAME`: ECRリポジトリの名前。
- `IMAGE_TAG`: Dockerイメージに付けるタグ (例: `latest` やコミットハッシュ)。
- `CONTAINER_NAME`: ECSタスク定義と`buildspec.yml`で使用するコンテナ名 (例: `nextjs-ssr-container`)。
