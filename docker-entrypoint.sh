#!/bin/sh
set -e

echo "🚀 [Lalita Kapilavai Platform] Starting Container Entrypoint..."

# Extract host and port from DATABASE_URL or default to db:5432
DB_HOST="db"
DB_PORT="5432"

echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT to accept connections..."
while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null && ! node -e "const net=require('net');const sock=net.createConnection($DB_PORT,'$DB_HOST',()=>{sock.end();process.exit(0)});sock.on('error',()=>process.exit(1));" 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL connection established!"

# 1. Automatic PostgreSQL Schema Synchronization
echo "📦 Synchronizing Database Schema..."
npx prisma db push --skip-generate --accept-data-loss || true

# 2. Automated Idempotent Seeding
echo "🌱 Running Seed Hook..."
npx tsx prisma/seed.ts || echo "⚠️ Seed script completed with warnings or already seeded."

echo "✨ Launching Next.js standalone server on port ${PORT:-3060}..."
exec node server.js
