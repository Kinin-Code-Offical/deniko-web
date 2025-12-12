import { db } from "@/lib/db";

export async function generateUniqueUsername(
    firstName: string,
    lastName: string
): Promise<string> {
    const normalize = (value: string): string => {
        return value
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase();
    };

    const base =
        normalize(firstName) + normalize(lastName) ||
        normalize(firstName) ||
        "user";

    let candidate = base;
    let suffix = 1;

    // Loop until a free username is found
    while (true) {
        const exists = await db.user.findUnique({
            where: { username: candidate },
            select: { id: true },
        });

        if (!exists) {
            return candidate;
        }

        suffix += 1;
        candidate = `${base}${suffix}`;
    }
}
