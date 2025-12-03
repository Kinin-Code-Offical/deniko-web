import { auth } from "@/auth";

export default async function ReproPage() {
    const session = await auth();
    return (
        <div>
            <h1>Repro Page</h1>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
    );
}
