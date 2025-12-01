import pino from 'pino'

const isEdge = process.env.NEXT_RUNTIME === 'edge'

const logger = pino({
    level: 'trace', // Geliştirme sırasında en detaylı logları (trace) göster
    transport: !isEdge ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    } : undefined,
    redact: {
        paths: [],
        remove: false,
    },
    base: {
        env: process.env.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
})

export default logger
