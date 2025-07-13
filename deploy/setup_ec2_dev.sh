#!/bin/bash

# EC2開発サーバーセットアップスクリプト
# Amazon Linux 2023対応

set -e  # エラー時に停止

# カラー出力用の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ出力関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 設定変数
PROJECT_NAME="nextjs-ssr"
REPO_URL="https://github.com/hrdaya/nextjs-ssr.git"  # 実際のリポジトリURLに変更してください
PROJECT_DIR="/home/ec2-user/$PROJECT_NAME"
NODE_VERSION="24.4.0"  # package.jsonに合わせて調整してください

log_info "EC2開発サーバーのセットアップを開始します..."

# 1. システムアップデート
log_info "システムパッケージを更新中..."
sudo dnf update -y

# 2. 必要なパッケージのインストール
log_info "必要なパッケージをインストール中..."
sudo dnf install -y git curl wget

# 3. Voltaのインストール
log_info "Voltaをインストール中..."
if command -v volta &> /dev/null; then
    log_warning "Voltaは既にインストールされています"
else
    curl https://get.volta.sh | bash
    # bashプロファイルを再読み込み
    source ~/.bashrc
    export VOLTA_HOME="$HOME/.volta"
    export PATH="$VOLTA_HOME/bin:$PATH"
fi

# 4. Node.jsのインストール（Volta経由）
log_info "Node.js ${NODE_VERSION}をインストール中..."
volta install node@${NODE_VERSION}

# 5. corepackとpnpmの設定
log_info "corepackとpnpmを設定中..."
volta install corepack
corepack enable
corepack enable pnpm

# 6. pm2のグローバルインストール
log_info "PM2をインストール中..."
volta install pm2

# 7. プロジェクトのクローン
log_info "プロジェクトをクローン中..."
if [ -d "$PROJECT_DIR" ]; then
    log_warning "プロジェクトディレクトリが既に存在します。更新します..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# 8. 依存関係のインストール
log_info "依存関係をインストール中..."
pnpm install

# 9. 環境変数ファイルの作成
log_info "環境変数ファイルを設定中..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        log_success ".env.localファイルを作成しました"
        log_warning "必要に応じて.env.localファイルを編集してください"
    else
        log_warning ".env.exampleファイルが見つかりません"
    fi
else
    log_info ".env.localファイルは既に存在します"
fi

# 10. Git hooksのインストール（開発環境では省略可能）
log_info "Git hooksをインストール中..."
pnpm lefthook install || log_warning "lefthookのインストールに失敗しました（省略可能）"

# 11. ファイアウォール設定（開発ポート3000を開く）
log_info "ファイアウォール設定を確認中..."
sudo firewall-cmd --permanent --add-port=3000/tcp || log_warning "ファイアウォール設定に失敗しました"
sudo firewall-cmd --reload || log_warning "ファイアウォールの再読み込みに失敗しました"

# 12. 開発サーバーの起動（PM2使用）
log_info "開発サーバーを起動中..."
pm2 delete nextjs-dev 2>/dev/null || true  # 既存のプロセスがあれば削除
pm2 start npm --name "nextjs-dev" -- run dev
pm2 save  # PM2設定を保存
pm2 startup  # システム起動時の自動開始設定

# 13. セットアップ完了メッセージ
log_success "EC2開発サーバーのセットアップが完了しました！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}セットアップ完了情報:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "プロジェクトディレクトリ: ${BLUE}$PROJECT_DIR${NC}"
echo -e "開発サーバーURL: ${BLUE}http://$(curl -s ifconfig.me):3000${NC}"
echo -e "PM2プロセス名: ${BLUE}nextjs-dev${NC}"
echo ""
echo -e "${YELLOW}よく使うコマンド:${NC}"
echo "  pm2 list                    # プロセス一覧表示"
echo "  pm2 logs nextjs-dev         # ログ確認"
echo "  pm2 restart nextjs-dev      # サーバー再起動"
echo "  pm2 stop nextjs-dev         # サーバー停止"
echo "  pm2 start nextjs-dev        # サーバー開始"
echo ""
echo -e "${YELLOW}プロジェクト操作:${NC}"
echo "  cd $PROJECT_DIR             # プロジェクトディレクトリに移動"
echo "  git pull origin main        # 最新コードを取得"
echo "  pnpm install                # 依存関係を再インストール"
echo "  pnpm lint                   # コードリント実行"
echo "  pnpm test                   # テスト実行"
echo ""
echo -e "${RED}注意事項:${NC}"
echo "- セキュリティグループでポート3000を開放してください"
echo "- .env.localファイルの環境変数を適切に設定してください"
echo "- 本番環境では適切なセキュリティ対策を実装してください"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
