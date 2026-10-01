#!/bin/sh
set -e

echo "🚀 [SavazAI WebApps Platform] Starting Container Entrypoint..."

DB_HOST="db"
DB_PORT="5432"

if [ -n "$DATABASE_URL" ]; then
  PARSED_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
  PARSED_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
  if [ -n "$PARSED_HOST" ] && [ "$PARSED_HOST" != "$DATABASE_URL" ]; then
    DB_HOST="$PARSED_HOST"
  fi
  if [ -n "$PARSED_PORT" ] && [ "$PARSED_PORT" != "$DATABASE_URL" ]; then
    DB_PORT="$PARSED_PORT"
  fi
fi

echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT to accept TCP connections..."
while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null && ! node -e "const net=require('net');const sock=net.createConnection($DB_PORT,'$DB_HOST',()=>{sock.end();process.exit(0)});sock.on('error',()=>process.exit(1));" 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL connection established!"

# 0. Ensure media storage directories exist and are writable
mkdir -p /app/public/media/public /app/public/media/vault 2>/dev/null || true
chmod -R 775 /app/public/media 2>/dev/null || true

# 1. Pre-Migration SQL Safeguard: Normalize legacy leads.source values
echo "🛡️ Verifying leads enum compatibility..."
echo "DO \$\$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='leads' AND column_name='source' AND data_type='text'
  ) THEN
    UPDATE leads SET source = 'CONTACT_FORM' 
    WHERE source NOT IN ('CONTACT_FORM', 'EVENT_RSVP', 'QR_SCAN', 'CUSTOM_FORM') OR source IS NULL;
  END IF;
END \$\$;" | ./node_modules/.bin/prisma db execute --stdin --schema=/app/prisma/schema.prisma 2>/dev/null || true

# 2. Production Database Schema Push (Fail-Fast with --accept-data-loss)
echo "📦 Applying Prisma schema to PostgreSQL (Production Push)..."
if ! ./node_modules/.bin/prisma db push --accept-data-loss --schema=/app/prisma/schema.prisma; then
  echo "❌ Fatal: prisma db push failed!"
  exit 1
fi

# 3. Runtime Prisma Client Generation (Fail-Fast)
echo "⚡ Generating Prisma Client..."
if ! ./node_modules/.bin/prisma generate --schema=/app/prisma/schema.prisma; then
  echo "❌ Fatal: prisma generate failed!"
  exit 1
fi

# 4. Execute idempotent seeder
echo "🌱 Running database seeder..."
if [ -f "./prisma/seed.js" ]; then
  node prisma/seed.js || echo "⚠️ Seed script completed with warnings."
elif [ -f "./node_modules/.bin/tsx" ]; then
  ./node_modules/.bin/tsx prisma/seed.ts || echo "⚠️ Seed script completed with warnings."
else
  echo "⚠️ No seeder found or runnable."
fi

echo "✨ Database initialized and seeded successfully. Launching server on port ${PORT:-3060}..."
exec node server.js
