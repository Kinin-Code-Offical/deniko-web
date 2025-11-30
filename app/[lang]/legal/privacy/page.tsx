import { Locale } from "@/i18n-config"
import { privacyContent } from "@/lib/legal-content"

export default async function PrivacyPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const content = privacyContent[lang as keyof typeof privacyContent] || privacyContent.en

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">{content.title}</h1>
            <p className="text-sm text-slate-500 mb-8">{content.lastUpdated}</p>

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
