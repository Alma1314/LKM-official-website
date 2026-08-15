#!/bin/sh
# LKM nginx 入口:缺证书时生成自签占位证书,并后台定时 reload 拾取续期后的新证书
set -e

CERT_DIR="/etc/letsencrypt/live/lkm.s12mc.xyz"
CERT_FILE="$CERT_DIR/fullchain.pem"
KEY_FILE="$CERT_DIR/privkey.pem"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    # nginx:alpine 默认不含 openssl CLI,按需安装
    apk add --no-cache openssl >/dev/null 2>&1 || true
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/CN=lkm.s12mc.xyz" >/dev/null 2>&1
fi

# 后台每 6h reload,拾取 certbot 续期后的新证书(证书文件原地更新)
( while :; do sleep 21600; nginx -s reload; done ) &

exec "$@"
