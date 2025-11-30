import { Locale } from "@/i18n-config"
import { kvkkContent } from "@/lib/legal-content"

export default async function KvkkPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const content = kvkkContent[lang as keyof typeof kvkkContent] || kvkkContent.en

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">{content.title}</h1>

            <div className="prose prose-slate max-w-none text-slate-600">
                <p className="mb-6 font-medium">
                    {content.intro}
                </p>

                {content.sections.map((section, index) => (
                    <div key={index} className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-3">{section.title}</h2>
                        <p className="leading-relaxed">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
