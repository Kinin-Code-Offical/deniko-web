import { db } from "../lib/db";

async function main() {
    try {
        const count = await db.user.count();
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error(e);
    }
}
main();