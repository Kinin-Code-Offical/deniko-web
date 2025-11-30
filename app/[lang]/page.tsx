import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { ArrowRight, Calendar, Users, LineChart, UserPlus, Settings, BookOpen } from "lucide-react"

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <div className="min-h-screen bg-white flex flex-col animate-in fade-in duration-1000">
      <Navbar lang={lang} dictionary={dictionary} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white py-16 lg:py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                  {dictionary.home.hero_title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {dictionary.home.hero_subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button size="lg" className="bg-[#2062A3] hover:bg-[#1a4f83] h-12 px-8 text-lg w-full sm:w-auto shadow-lg shadow-blue-900/20" asChild>
                    <Link href={`/${lang}/register`}>
                      {dictionary.home.get_started}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto bg-white hover:bg-gray-50" asChild>
                    <Link href={`/${lang}/login`}>
                      {dictionary.home.login}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="flex-1 w-full max-w-xl lg:max-w-none">
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-gray-100 p-2 aspect-[4/3] overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full bg-gray-50/50 rounded-xl flex flex-col overflow-hidden">
                      {/* Mock UI Header */}
                      <div className="h-12 border-b bg-white flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="ml-4 h-6 w-32 bg-gray-100 rounded-md"></div>
                      </div>
                      {/* Mock UI Body */}
                      <div className="flex-1 p-6 grid grid-cols-12 gap-6">
                        <div className="col-span-3 hidden sm:flex flex-col gap-3">
                          <div className="h-8 w-full bg-blue-100/50 rounded-md"></div>
                          <div className="h-8 w-full bg-gray-100 rounded-md"></div>
                          <div className="h-8 w-full bg-gray-100 rounded-md"></div>
                          <div className="h-8 w-full bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="col-span-12 sm:col-span-9 flex flex-col gap-4">
                          <div className="h-32 w-full bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                            <div className="h-4 w-1/3 bg-gray-200 rounded mb-3"></div>
                            <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                            <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                            <div className="h-24 bg-white border border-gray-100 rounded-lg shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative Blobs */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{dictionary.home.features.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: dictionary.home.features.scheduling_title,
                  desc: dictionary.home.features.scheduling_desc,
                },
                {
                  icon: Users,
                  title: dictionary.home.features.students_title,
                  desc: dictionary.home.features.students_desc,
                },
                {
                  icon: LineChart,
                  title: dictionary.home.features.progress_title,
                  desc: dictionary.home.features.progress_desc,
                },
              ].map((feature, index) => (
                <div key={index} className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:border-blue-100 group">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#2062A3] transition-colors duration-300">
                    <feature.icon className="h-7 w-7 text-[#2062A3] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{dictionary.home.how_it_works.title}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

              {/* Step 1 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <UserPlus className="h-10 w-10 text-[#2062A3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{dictionary.home.how_it_works.step1_title}</h3>
                <p className="text-gray-600">{dictionary.home.how_it_works.step1_desc}</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <Settings className="h-10 w-10 text-[#2062A3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{dictionary.home.how_it_works.step2_title}</h3>
                <p className="text-gray-600">{dictionary.home.how_it_works.step2_desc}</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <BookOpen className="h-10 w-10 text-[#2062A3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{dictionary.home.how_it_works.step3_title}</h3>
                <p className="text-gray-600">{dictionary.home.how_it_works.step3_desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#2062A3] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{dictionary.home.cta.title}</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {dictionary.home.cta.subtitle}
            </p>
            <Button size="lg" className="bg-white text-[#2062A3] hover:bg-blue-50 h-14 px-10 text-lg" asChild>
              <Link href={`/${lang}/register`}>
                {dictionary.home.cta.button}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <DenikoLogo className="h-6 w-6 text-[#2062A3]" />
                <span className="font-bold text-xl text-gray-900">Deniko</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                {dictionary.home.hero_subtitle}
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">{lang === 'tr' ? 'Platform' : 'Platform'}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link href={`/${lang}/login`} className="hover:text-[#2062A3] transition-colors">
                    {dictionary.home.login}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/register`} className="hover:text-[#2062A3] transition-colors">
                    {dictionary.home.get_started}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">{lang === 'tr' ? 'Yasal' : 'Legal'}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link href={`/${lang}/legal/terms`} className="hover:text-[#2062A3] transition-colors">
                    {lang === 'tr' ? 'Kullanıcı Sözleşmesi' : 'Terms of Service'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/legal/privacy`} className="hover:text-[#2062A3] transition-colors">
                    {lang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/legal/cookies`} className="hover:text-[#2062A3] transition-colors">
                    {lang === 'tr' ? 'Çerez Politikası' : 'Cookie Policy'}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/legal/kvkk`} className="hover:text-[#2062A3] transition-colors">
                    {lang === 'tr' ? 'KVKK Aydınlatma Metni' : 'KVKK Clarification Text'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {lang === 'tr' ? '© 2025 Deniko. Tüm hakları saklıdır.' : '© 2025 Deniko. All rights reserved.'}
            </p>
            <div className="flex items-center gap-4">
              {/* Social Media Icons Placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}