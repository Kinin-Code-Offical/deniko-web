# --------------------------------------------------------
# 1. AŞAMA: Bağımlılıkları Yükle (Dependencies)
# --------------------------------------------------------
FROM node:20-alpine AS deps
# Prisma'nın Alpine linux'ta çalışması için gerekli kütüphane
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Paket dosyalarını kopyala
COPY package.json package-lock.json* ./
# Bağımlılıkları kur
RUN npm ci

# --------------------------------------------------------
# 2. AŞAMA: Projeyi Derle (Builder)
# --------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma istemcisini oluştur (schema.prisma'yı okur)
RUN npx prisma generate

# Next.js projesini build et
# (TypeScript hatalarını yoksaymaması için build sırasında kontrol edilir)
RUN npm run build

# --------------------------------------------------------
# 3. AŞAMA: Çalıştır (Runner - Production)
# --------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Google Cloud Run portu genellikle 8080'dir
ENV PORT 8080 
ENV HOSTNAME "0.0.0.0"

# Güvenlik için root olmayan kullanıcı oluştur
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sadece gerekli dosyaları kopyala (Standalone modun güzelliği)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]