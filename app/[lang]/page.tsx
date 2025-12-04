import { getDictionary } from "@/lib/get-dictionary"
import type { Locale } from "@/i18n-config"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { StatsCard } from "@/components/ui/stats-card"
import { DenikoLogo } from "@/components/ui/deniko-logo"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation"
import { ArrowRight, Calendar, Users, LineChart, UserPlus, Settings, BookOpen, GraduationCap, School, LayoutDashboard, Wallet, Bell, Search, MoreHorizontal, MessageSquare } from "lucide-react"

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = (await getDictionary(lang)) 

  return (
    <div className="min-h-screen bg-white flex flex-col animate-in fade-in duration-1000">
      <Navbar lang={lang} dictionary={dictionary} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] py-16 md:py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight drop-shadow-[0_20px_80px_rgba(15,23,42,0.9)]">
                  {dictionary.home.hero_title}
                </h1>
                <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {dictionary.home.hero_subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button size="lg" className="bg-white text-[#1d4ed8] hover:bg-blue-50 h-11 px-7 text-sm md:text-base w-full sm:w-auto shadow-lg shadow-blue-900/30" asChild>
                    <Link href={`/${lang}/register`}>
                      {dictionary.home.get_started}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 px-7 text-sm md:text-base w-full sm:w-auto bg-white/5 border-white/20 text-white hover:bg-white/10" asChild>
                    <Link href={`/${lang}/login`}>
                      {dictionary.home.login}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="flex-1 w-full max-w-xl lg:max-w-none">
                <div className="relative perspective-1200">
                  <div className="bg-slate-900/90 rounded-3xl shadow-[0_40px_120px_rgba(15,23,42,0.9)] border border-blue-500/30 p-3 aspect-[4/3] overflow-hidden tilt-soft transition-transform duration-500">
                    <div className="w-full h-full bg-slate-900 rounded-2xl flex flex-col overflow-hidden">
                      {/* Mock UI Header */}
                      <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 gap-4 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                          </div>
                          <div className="h-8 w-px bg-slate-800 mx-2"></div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-xs font-medium">{dictionary.home.mock_dashboard.dashboard_title}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-48 bg-slate-800/50 rounded-full flex items-center px-3 gap-2 border border-slate-700/50">
                            <Search className="h-3.5 w-3.5 text-slate-500" />
                            <div className="h-1.5 w-20 bg-slate-700/50 rounded-full"></div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                            <Bell className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Mock UI Body */}
                      <div className="flex-1 p-5 grid grid-cols-12 gap-6 bg-slate-950/50">
                        {/* Sidebar */}
                        <div className="col-span-3 hidden sm:flex flex-col gap-1">
                          <div className="h-9 w-full bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center px-3 gap-3 text-blue-400">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-xs font-medium">{dictionary.home.mock_dashboard.overview}</span>
                          </div>
                          <div className="h-9 w-full hover:bg-slate-800/50 rounded-lg flex items-center px-3 gap-3 text-slate-500 transition-colors">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">{dictionary.home.mock_dashboard.students}</span>
                          </div>
                          <div className="h-9 w-full hover:bg-slate-800/50 rounded-lg flex items-center px-3 gap-3 text-slate-500 transition-colors">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">{dictionary.home.mock_dashboard.schedule}</span>
                          </div>
                          <div className="h-9 w-full hover:bg-slate-800/50 rounded-lg flex items-center px-3 gap-3 text-slate-500 transition-colors">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-medium">{dictionary.home.mock_dashboard.finance}</span>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="h-24 w-full bg-gradient-to-br from-blue-900/20 to-slate-900 rounded-xl border border-blue-500/10 p-3 flex flex-col justify-between">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="h-1.5 w-12 bg-slate-700 rounded-full mb-1.5"></div>
                                    <div className="h-1 w-8 bg-slate-800 rounded-full"></div>
                                </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-12 sm:col-span-9 flex flex-col gap-4">
                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-3">
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{dictionary.home.mock_dashboard.attendance}</span>
                                    <span className="text-[10px] text-emerald-400 font-medium">+4.5%</span>
                                </div>
                                <div className="text-lg font-bold text-white mb-1">94%</div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[94%] bg-emerald-500 rounded-full"></div>
                                </div>
                             </div>
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{dictionary.home.mock_dashboard.active_students}</span>
                                    <span className="text-[10px] text-blue-400 font-medium">{dictionary.home.mock_dashboard.active}</span>
                                </div>
                                <div className="text-lg font-bold text-white mb-1">48</div>
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="h-5 w-5 rounded-full bg-slate-700 border border-slate-900"></div>
                                    ))}
                                </div>
                             </div>
                             <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{dictionary.home.mock_dashboard.classes_today}</span>
                                    <span className="text-[10px] text-orange-400 font-medium">{dictionary.home.mock_dashboard.pending}</span>
                                </div>
                                <div className="text-lg font-bold text-white mb-1">12</div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[60%] bg-orange-500 rounded-full"></div>
                                </div>
                             </div>
                          </div>

                          {/* Chart Area */}
                          <div className="h-32 w-full bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">{dictionary.home.mock_dashboard.exam_results}</div>
                                    <div className="text-sm font-bold text-white">{dictionary.home.mock_dashboard.class_average}: 84%</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-slate-800 rounded-md flex items-center justify-center text-[10px] text-slate-400">{dictionary.home.mock_dashboard.weekly}</div>
                                    <div className="h-6 w-6 bg-blue-600/20 rounded-md flex items-center justify-center">
                                        <MoreHorizontal className="h-3 w-3 text-blue-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end justify-between h-12 gap-2 px-2">
                                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                                    <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group-hover:bg-blue-500/30 transition-colors" style={{ height: `${h}%` }}>
                                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm transition-all duration-1000" style={{ height: `${h/2}%` }}></div>
                                    </div>
                                ))}
                            </div>
                          </div>

                          {/* Schedule Area */}
                          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-hidden flex flex-col">
                             <div className="text-[10px] font-medium text-slate-500 mb-2 uppercase tracking-wider">{dictionary.home.mock_dashboard.schedule}</div>
                             <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                                {[
                                    { time: "09:00", subject: dictionary.home.mock_dashboard.math, color: "bg-blue-500" },
                                    { time: "11:00", subject: dictionary.home.mock_dashboard.physics, color: "bg-purple-500" },
                                    { time: "14:30", subject: dictionary.home.mock_dashboard.chemistry, color: "bg-emerald-500" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-800/50 hover:bg-slate-800 transition-colors">
                                        <div className="text-xs font-bold text-slate-400 w-9">{item.time}</div>
                                        <div className={`h-8 w-1 rounded-full ${item.color}`}></div>
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-slate-200">{item.subject}</div>
                                            <div className="text-[10px] text-slate-500">12-A • {dictionary.home.mock_dashboard.room} 301</div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative Blobs */}
                  <div className="absolute -top-10 -right-6 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features + Stats Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-start gap-12 mb-16">
              <FadeIn className="flex-1">
                <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#2062A3]/80 mb-4">
                  {dictionary.home.features.badge}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {dictionary.home.features.title}
                </h2>
                <p className="text-gray-600 max-w-xl leading-relaxed">
                  {dictionary.home.features.subtitle}
                </p>
                <div className="mt-8 relative h-[400px] w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 overflow-hidden p-8 flex items-center justify-center group">
                  {/* Abstract Background */}
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                  
                  {/* Floating Elements Composition */}
                  <div className="relative w-full h-full flex items-center justify-center">
                      {/* Calendar Card (Left) */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 w-48 transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500 z-10">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="text-xs font-bold text-slate-700">{dictionary.home.mock_dashboard.graphic_schedule}</div>
                          </div>
                          <div className="space-y-2">
                              {[1, 2, 3].map(i => (
                                  <div key={i} className="flex gap-2 items-center">
                                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                                      <div className="h-1.5 w-20 bg-slate-100 rounded-full"></div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Student Card (Center/Top) */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-slate-100 w-64 z-20 transform group-hover:scale-105 transition-transform duration-500">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-700">{dictionary.home.mock_dashboard.graphic_profile}</div>
                                  <div className="text-[10px] text-slate-500">{dictionary.home.mock_dashboard.graphic_performance}</div>
                              </div>
                          </div>
                          <div className="flex justify-between items-end h-20 gap-1.5">
                              {[40, 70, 50, 90, 60, 80, 65, 85].map((h, i) => (
                                  <div key={i} className="w-full bg-blue-50 rounded-t-sm relative overflow-hidden">
                                      <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Chart Card (Right) */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 w-48 transform rotate-6 group-hover:rotate-12 transition-transform duration-500 z-10">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                  <LineChart className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="text-xs font-bold text-slate-700">{dictionary.home.mock_dashboard.graphic_analysis}</div>
                          </div>
                          <div className="flex items-center justify-center h-16">
                              <div className="relative h-14 w-14 rounded-full border-[3px] border-emerald-100 flex items-center justify-center">
                                  <div className="absolute inset-0 border-[3px] border-emerald-500 rounded-full border-t-transparent rotate-45"></div>
                                  <span className="text-sm font-bold text-emerald-600">A+</span>
                              </div>
                          </div>
                      </div>
                  </div>
                </div>
              </FadeIn>

              <div className="flex-1 relative">
                {/* Connecting Line */}
                <div className="absolute left-[2.75rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>

                <StaggerContainer className="flex flex-col gap-5 relative z-10">
                  {[
                    {
                      icon: Calendar,
                      title: dictionary.home.features.scheduling_title,
                      desc: dictionary.home.features.scheduling_desc,
                      color: "text-blue-600",
                      bg: "bg-blue-50"
                    },
                    {
                      icon: Users,
                      title: dictionary.home.features.students_title,
                      desc: dictionary.home.features.students_desc,
                      color: "text-indigo-600",
                      bg: "bg-indigo-50"
                    },
                    {
                      icon: LineChart,
                      title: dictionary.home.features.progress_title,
                      desc: dictionary.home.features.progress_desc,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50"
                    },
                    {
                      icon: MessageSquare,
                      title: dictionary.home.features.communication_title,
                      desc: dictionary.home.features.communication_desc,
                      color: "text-purple-600",
                      bg: "bg-purple-50"
                    },
                  ].map((feature, index) => (
                    <StaggerItem
                      key={index}
                      className="group relative flex items-start gap-5 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                    >
                      <div className={`shrink-0 w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10 ring-4 ring-white`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{dictionary.home.how_it_works.title}</h2>
            </div>
            <StaggerContainer className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

              {/* Step 1 */}
              <StaggerItem className="text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <UserPlus className="h-10 w-10 text-[#2062A3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{dictionary.home.how_it_works.step1_title}</h3>
                <p className="text-gray-600">{dictionary.home.how_it_works.step1_desc}</p>
              </StaggerItem>

              {/* Step 2 */}
              <StaggerItem className="text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <Settings className="h-10 w-10 text-[#2062A3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{dictionary.home.how_it_works.step2_title}</h3>
                <p className="text-gray-600">{dictionary.home.how_it_works.step2_desc}</p>
              </StaggerItem>

              {/* Step 3 */}
              <StaggerItem className="text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <BookOpen className="h-10 w-10 text-[#2062A3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{dictionary.home.how_it_works.step3_title}</h3>
                <p className="text-gray-600">{dictionary.home.how_it_works.step3_desc}</p>
              </StaggerItem>
            </StaggerContainer>
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