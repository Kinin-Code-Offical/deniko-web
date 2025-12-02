import pino from 'pino'

// Edge Runtime kontrolü (Next.js middleware vb. için)
const isEdge = process.env.NEXT_RUNTIME === 'edge'
// Sadece Development ortamında pino-pretty kullan
const isDev = process.env.NODE_ENV === 'development'

const logger = pino({
    // Production'da 'info', Development'ta 'trace' seviyesi
    level: isDev ? 'trace' : 'info',

    // Transport ayarı: Sadece Development ortamında ve Edge değilse pino-pretty kullan
    transport: (isDev && !isEdge) ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    } : undefined,

    redact: {
        paths: ["password", "token", "secret", "authorization", "cookie"],
        remove: true, // Hassas verileri tamamen sil
    },

    base: {
        env: process.env.NODE_ENV,
    },

    // Production'da ISO zaman damgası
    timestamp: pino.stdTimeFunctions.isoTime,
})

export default logger
