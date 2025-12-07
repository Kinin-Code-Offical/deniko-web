import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";

export default async function ReproPage() {
  const session = await auth();
  const dictionary = await getDictionary("en");
  return (
    <div>
      <h1>{dictionary.repro?.title || "Repro Page"}</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
