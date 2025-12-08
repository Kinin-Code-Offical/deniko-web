# --------------------------------------------------------
# 1. AŞAMA: Bağımlılıkları Yükle (Dependencies)
# --------------------------------------------------------
# Alpine 3.20 kullanarak temel güvenliği sağlıyoruz ama update komutunu siliyoruz.
FROM node:lts-alpine AS deps
# Sadece Prisma için gerekli kütüphaneyi kuruyoruz (Çok hızlıdır)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Paket dosyalarını kopyala
COPY package.json pnpm-lock.yaml* ./
# Prisma şemasını ve patch'leri kopyala (postinstall için gerekli)
COPY prisma ./prisma
COPY patches ./patches

# Build sırasında geçici dummy çevresel değişkenler
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV AUTH_SECRET="dummy_secret_for_build"
ENV AUTH_GOOGLE_ID="dummy_google_id"
ENV AUTH_GOOGLE_SECRET="dummy_google_secret"
ENV EMAIL_USER="dummy@example.com"
ENV EMAIL_PASS="dummy_password"
ENV GCS_BUCKET_NAME="dummy-bucket"
ENV GCS_PROJECT_ID="dummy-project"
ENV GCS_CLIENT_EMAIL="dummy@example.com"
ENV GCS_PRIVATE_KEY="dummy_private_key"

# Bağımlılıkları kur
RUN pnpm install --frozen-lockfile

# --------------------------------------------------------
# 2. AŞAMA: Projeyi Derle (Builder)
# --------------------------------------------------------
FROM node:lts-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma istemcisini oluştur
RUN pnpm exec prisma generate

# Build sırasında geçici dummy çevresel değişkenler
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV AUTH_SECRET="dummy_secret_for_build"
ENV AUTH_GOOGLE_ID="dummy_google_id"
ENV AUTH_GOOGLE_SECRET="dummy_google_secret"
ENV EMAIL_USER="dummy@example.com"
ENV EMAIL_PASS="dummy_password"
ENV GCS_BUCKET_NAME="dummy-bucket"
ENV GCS_PROJECT_ID="dummy-project"
ENV GCS_CLIENT_EMAIL="dummy@example.com"
ENV GCS_PRIVATE_KEY="dummy_private_key"

# Next.js projesini build et
RUN pnpm run build

# --------------------------------------------------------
# 3. AŞAMA: Çalıştır (Runner - Production)
# --------------------------------------------------------
FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Güvenlik için root olmayan kullanıcı
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Dosyaları kopyala
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]