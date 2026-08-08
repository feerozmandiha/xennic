#!/bin/bash
set -e
cd ~/xennic/xennic
echo "[*] Cleaning secrets dir"
rm -rf infrastructure/docker/secrets
mkdir -p infrastructure/docker/secrets

echo "[*] Generating RSA keys"
openssl genrsa -out infrastructure/docker/secrets/jwtRS256.key 2048
openssl rsa -in infrastructure/docker/secrets/jwtRS256.key -pubout -out infrastructure/docker/secrets/jwtRS256.key.pub

echo "[*] Fixing .env - recreating"
cat > .env <<'ENVEOF'
HOST=0.0.0.0
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://xennic:xennic@localhost:5432/xennic
POSTGRES_DB=xennic
POSTGRES_USER=xennic
POSTGRES_PASSWORD=xennic
REDIS_URL=redis://:xennic@localhost:6380
REDIS_PASSWORD=xennic
REDIS_PORT=6380
JWT_PRIVATE_KEY_PATH=infrastructure/docker/secrets/jwtRS256.key
JWT_PUBLIC_KEY_PATH=infrastructure/docker/secrets/jwtRS256.key.pub
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=2592000
JWT_ISSUER=xennic-platform
JWT_AUDIENCE=xennic-client
AI_MASTER_KEY=change_me_to_a_secure_32_char_key_12345
AI_MASTER_KEY_SALT=change_me_salt
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=xennic
QDRANT_HOST=http://localhost:6333
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
ADMIN_EMAIL=admin@xennic.ir
ADMIN_PASSWORD=admin123
ENVEOF

echo "[*] Verifying"
ls -lh infrastructure/docker/secrets/
grep JWT .env | grep PATH
echo "[*] Done - now run: pnpm --filter @xennic/api dev"
