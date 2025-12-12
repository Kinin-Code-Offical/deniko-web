import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
});

const ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10 m"),
    prefix: "rl:login:ip",
});

const ipUserLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    prefix: "rl:login:ip-user",
});

export async function assertLoginRateLimit({
    ip,
    email,
}: {
    ip: string | null;
    email?: string | null;
}) {
    const safeIp = ip ?? "unknown";
    const safeEmail = email?.toLowerCase() ?? null;

    // 1) IP limit
    const ipRes = await ipLimiter.limit(safeIp);
    if (!ipRes.success) {
        logger.warn({
            event: "login_rate_limited_ip",
            ip: safeIp,
            email: safeEmail,
            limit: "20/10m",
        });

        const error = new Error("TOO_MANY_LOGIN_ATTEMPTS_IP");
        // @ts-expect-error custom code
        error.code = "TOO_MANY_LOGIN_ATTEMPTS_IP";
        throw error;
    }

    // 2) IP + email limit (if email exists)
    if (safeEmail) {
        const key = `${safeIp}:${safeEmail}`;
        const comboRes = await ipUserLimiter.limit(key);
        if (!comboRes.success) {
            logger.warn({
                event: "login_rate_limited_ip_user",
                ip: safeIp,
                email: safeEmail,
                limit: "10/10m",
            });

            const error = new Error("TOO_MANY_LOGIN_ATTEMPTS_USER");
            // @ts-expect-error custom code
            error.code = "TOO_MANY_LOGIN_ATTEMPTS_USER";
            throw error;
        }
    }
}
