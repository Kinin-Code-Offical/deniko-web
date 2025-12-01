import pino from 'pino'

const isEdge = process.env.NEXT_RUNTIME === 'edge'

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: !isEdge && process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    } : undefined,
    redact: {
        paths: ["password", "token", "secret", "authorization", "cookie"],
        remove: true,
    },
    base: {
        env: process.env.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
})

export default logger
