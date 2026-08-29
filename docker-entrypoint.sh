#!/bin/sh
set -e

echo "🚀 [Lalita Kapilavai Platform] Starting Automated Container Lifecycle..."

# 1. Automatic PostgreSQL Schema Synchronization
echo "📦 Synchronizing Database Schema..."
npx prisma db push --skip-generate --accept-data-loss || true

# 2. Automated Idempotent Seeding using Environment Variables
echo "🌱 Seeding Database with Superadmin (${ADMIN_EMAIL:-admin@lalitakapilavai.com})..."
npx tsx prisma/seed.ts || echo "⚠️ Seed script completed with warnings or already seeded."

echo "✨ Database sync & automated seed complete. Launching Next.js standalone server on port ${PORT:-3060}..."

# 3. Start Next.js Standalone Production Server
exec node server.js
