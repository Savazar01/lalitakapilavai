#!/bin/sh
set -e

echo "🚀 [Lalita Kapilavai Platform] Starting Container Entrypoint..."

DB_HOST="db"
DB_PORT="5432"

echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT to accept TCP connections..."
while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null && ! node -e "const net=require('net');const sock=net.createConnection($DB_PORT,'$DB_HOST',()=>{sock.end();process.exit(0)});sock.on('error',()=>process.exit(1));" 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL connection established!"

# 0. Ensure media storage directories exist and are writable
mkdir -p /app/public/media/public /app/public/media/vault 2>/dev/null || true
chmod -R 775 /app/public/media 2>/dev/null || true

# 1. Force push schema to guarantee all tables exist
echo "📦 Applying Prisma schema to PostgreSQL..."
./node_modules/.bin/prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss

# 2. Execute idempotent seeder
echo "🌱 Running database seeder..."
./node_modules/.bin/tsx prisma/seed.ts

echo "✨ Database initialized and seeded successfully. Launching server on port ${PORT:-3060}..."
exec node server.js
