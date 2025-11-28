# --------------------------------------------------------
# 1. AŞAMA: Bağımlılıkları Yükle (Dependencies)
# --------------------------------------------------------
FROM node:20-alpine3.20 AS deps
# ÖNCE GÜNCELLEME: Mevcut paketlerdeki açıkları kapat (apk upgrade)
# SONRA YÜKLEME: Prisma için gerekli libc6-compat'i yükle
RUN apk update && apk upgrade && apk add --no-cache libc6-compat

WORKDIR /app

# Paket dosyalarını kopyala
COPY package.json package-lock.json* ./
# Bağımlılıkları kur
RUN npm ci

# --------------------------------------------------------
# 2. AŞAMA: Projeyi Derle (Builder)
# --------------------------------------------------------
FROM node:20-alpine3.20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build sırasında Prisma generate için geçici dummy URL
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Prisma istemcisini oluştur
RUN npx prisma generate

# Next.js projesini build et
RUN npm run build

# --------------------------------------------------------
# 3. AŞAMA: Çalıştır (Runner - Production)
# --------------------------------------------------------
FROM node:20-alpine3.20 AS runner
# Burada da işletim sistemini güncellemek güvenlik için iyidir
RUN apk update && apk upgrade

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Güvenlik için root olmayan kullanıcı
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]