#!/bin/bash
# ═══════════════════════════════════════════════════════
# 腾讯云部署脚本 — 鹅鸭杀人格测试
# ═══════════════════════════════════════════════════════
#
# 使用方式:
#   1. 确保已安装 Docker Desktop
#   2. 确保已安装腾讯云 CLI (tcli) 或已登录腾讯云容器镜像服务
#   3. 修改下方变量后运行: bash scripts/deploy-tencent.sh
#

set -e

# ══════════ 修改这些变量 ══════════
TENCENT_REGION="ap-shanghai"           # 地域: ap-shanghai / ap-beijing / ap-guangzhou
REGISTRY_NAMESPACE="goose-quiz"        # 腾讯云容器镜像服务命名空间
IMAGE_NAME="goose-quiz"                # 镜像名
IMAGE_TAG="latest"                     # 镜像标签
# 腾讯云容器镜像服务域名格式: ccr.ccs.tencentyun.com/<namespace>/<image>
REGISTRY_DOMAIN="ccr.ccs.tencentyun.com"
FULL_IMAGE="${REGISTRY_DOMAIN}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
# ══════════════════════════════════

echo "🏗️  Step 1: Building production bundle..."
npm run build

echo "🐳  Step 2: Building Docker image..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

echo "🏷️  Step 3: Tagging image for Tencent Cloud Registry..."
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${FULL_IMAGE}

echo "📤  Step 4: Pushing to Tencent Cloud Registry..."
echo "   (确保已运行: docker login ${REGISTRY_DOMAIN})"
docker push ${FULL_IMAGE}

echo ""
echo "✅ 镜像已推送: ${FULL_IMAGE}"
echo ""
echo "📋 接下来在腾讯云控制台操作:"
echo "   1. 打开 https://console.cloud.tencent.com/tke2/overview"
echo "   2. 选择 Serverless 集群 或 Web 应用托管"
echo "   3. 创建服务，选择刚推送的镜像"
echo "   4. 端口映射: 容器端口 3000 → 服务端口 80"
echo "   5. 绑定域名 + 配置 HTTPS"
