import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { DenikoLogo } from "@/components/ui/deniko-logo";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-animation";
import {
  ArrowRight,
  Calendar,
  Users,
  LineChart,
  UserPlus,
  Settings,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Wallet,
  Bell,
  Search,
  MoreHorizontal,
  MessageSquare,
  CreditCard,
  Library,
  Smartphone,
} from "lucide-react";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import Carousel from "@/components/landing/carousel/Carousel";
import ScheduleCard from "@/components/landing/carousel/cards/ScheduleCard";
import ProfileCard from "@/components/landing/carousel/cards/ProfileCard";
import PerformanceCard from "@/components/landing/carousel/cards/PerformanceCard";
import AssignmentsCard from "@/components/landing/carousel/cards/AssignmentsCard";
import MessagesCard from "@/components/landing/carousel/cards/MessagesCard";
import type { CardItem } from "@/components/landing/carousel/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isTr = lang === "tr";

  return {
    title: isTr
      ? "Deniko | Özel Ders Yönetim Platformu"
      : "Deniko | Private Tutoring Management Platform",
    description: isTr
      ? "Öğrenci takibi, ders programı ve ödeme takibini tek bir yerden yönetin. Deniko ile işinizi dijitalleştirin."
      : "Manage student tracking, lesson scheduling, and payments in one place. Digitalize your business with Deniko.",
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  // Fetch real stats
  const teacherCount = await db.teacherProfile.count();
  const studentCount = await db.studentProfile.count();
  const lessonCount = await db.lesson.count();

  const carouselItems: CardItem[] = [
    {
      id: 1,
      title: dictionary.home.mock_dashboard.schedule,
      component: <ScheduleCard dictionary={dictionary} />,
    },
    {
      id: 2,
      title: dictionary.home.mock_dashboard.graphic_profile,
      component: <ProfileCard dictionary={dictionary} />,
    },
    {
      id: 3,
      title: dictionary.home.mock_dashboard.graphic_performance,
      component: <PerformanceCard dictionary={dictionary} />,
    },
    {
      id: 4,
      title: dictionary.home.mock_dashboard.assignments,
      component: <AssignmentsCard dictionary={dictionary} />,
    },
    {
      id: 5,
      title: dictionary.home.mock_dashboard.announcements,
      component: <MessagesCard dictionary={dictionary} />,
    },
  ];

  const featureAxisStyle: CSSProperties & { "--feature-axis": string } = {
    "--feature-axis": "clamp(2.6rem, 4vw, 3.3rem)",
  };

  return (
    <div className="animate-in fade-in flex min-h-dvh flex-col bg-white transition-colors duration-1000 dark:bg-slate-950">
      <Navbar lang={lang} dictionary={dictionary} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] py-16 md:py-24">
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight text-white drop-shadow-[0_20px_80px_rgba(15,23,42,0.9)] md:text-6xl">
                  {dictionary.home.hero_title}
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-blue-100 md:text-lg lg:mx-0">
                  {dictionary.home.hero_subtitle}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <Button
                    size="lg"
                    className="h-11 w-full bg-white px-7 text-sm text-[#1d4ed8] shadow-lg shadow-blue-900/30 hover:bg-blue-50 sm:w-auto md:text-base"
                    asChild
                  >
                    <Link href={`/${lang}/register`}>
                      {dictionary.home.get_started}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 w-full border-white/20 bg-white/5 px-7 text-sm text-white hover:bg-white/10 sm:w-auto md:text-base"
                    asChild
                  >
                    <Link href={`/${lang}/login`}>{dictionary.home.login}</Link>
                  </Button>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="w-full max-w-xl flex-1 lg:max-w-none">
                <div className="perspective-1200 relative">
                  <div className="tilt-soft aspect-[4/3] overflow-hidden rounded-3xl border border-blue-500/30 bg-white/90 p-3 shadow-[0_40px_120px_rgba(15,23,42,0.9)] transition-transform duration-500 dark:bg-slate-900/90">
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-950">
                      {/* Mock UI Header */}
                      <div className="flex h-12 items-center justify-between gap-4 border-b border-slate-200 bg-white/50 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80"></div>
                          </div>
                          <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {dictionary.home.mock_dashboard.dashboard_title}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-48 items-center gap-2 rounded-full border border-slate-200/50 bg-slate-100/50 px-3 dark:border-slate-700/50 dark:bg-slate-800/50">
                            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            <div className="h-1.5 w-20 rounded-full bg-slate-200/50 dark:bg-slate-700/50"></div>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/10 dark:bg-blue-500/10">
                            <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>

                      {/* Mock UI Body */}
                      <div className="grid flex-1 grid-cols-12 gap-6 bg-white p-5 dark:bg-slate-950">
                        {/* Sidebar */}
                        <div className="col-span-3 hidden flex-col gap-1 sm:flex">
                          <div className="flex h-9 w-full items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {dictionary.home.mock_dashboard.overview}
                            </span>
                          </div>
                          <div className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {dictionary.home.mock_dashboard.students}
                            </span>
                          </div>
                          <div className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {dictionary.home.mock_dashboard.schedule}
                            </span>
                          </div>
                          <div className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {dictionary.home.mock_dashboard.finance}
                            </span>
                          </div>

                          <div className="mt-auto">
                            <div className="flex h-24 w-full flex-col justify-between rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-3 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="mb-1.5 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <div className="h-1 w-8 rounded-full bg-slate-300 dark:bg-slate-800"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-12 flex flex-col gap-4 sm:col-span-9">
                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[9px] font-medium tracking-wider text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                  {dictionary.home.mock_dashboard.attendance}
                                </span>
                                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                  +4.5%
                                </span>
                              </div>
                              <div className="mb-1 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                                94%
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div className="h-full w-[94%] rounded-full bg-emerald-500"></div>
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[9px] font-medium tracking-wider text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                  {
                                    dictionary.home.mock_dashboard
                                      .active_students
                                  }
                                </span>
                                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                  {dictionary.home.mock_dashboard.active}
                                </span>
                              </div>
                              <div className="mb-1 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                                48
                              </div>
                              <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="h-5 w-5 rounded-full border border-white bg-slate-200 dark:border-slate-900 dark:bg-slate-700"
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[9px] font-medium tracking-wider text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
                                  {dictionary.home.mock_dashboard.classes_today}
                                </span>
                                <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">
                                  {dictionary.home.mock_dashboard.pending}
                                </span>
                              </div>
                              <div className="mb-1 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                                12
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div className="h-full w-[60%] rounded-full bg-orange-500"></div>
                              </div>
                            </div>
                          </div>

                          {/* Chart Area */}
                          <div className="group relative h-32 w-full overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-4 flex items-center justify-between">
                              <div>
                                <div className="mb-1 text-[10px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                  {dictionary.home.mock_dashboard.exam_results}
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                  {dictionary.home.mock_dashboard.class_average}
                                  : 84%
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex h-6 w-16 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  {dictionary.home.mock_dashboard.weekly}
                                </div>
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
                                  <MoreHorizontal className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                            </div>
                            <div className="flex h-12 items-end justify-between gap-2 px-2">
                              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map(
                                (h, i) => (
                                  <div
                                    key={i}
                                    className="relative w-full rounded-t-sm bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-800/50"
                                    style={{ height: `${h}%` }}
                                  >
                                    <div
                                      className="absolute right-0 bottom-0 left-0 rounded-t-sm bg-blue-500 transition-all duration-1000"
                                      style={{ height: `${h / 2}%` }}
                                    ></div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Area */}
                          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 text-[10px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                              {dictionary.home.mock_dashboard.schedule}
                            </div>
                            <div className="custom-scrollbar flex flex-col gap-2 overflow-y-auto pr-1">
                              {[
                                {
                                  time: "09:00",
                                  subject: dictionary.home.mock_dashboard.math,
                                  color: "bg-blue-500",
                                },
                                {
                                  time: "11:00",
                                  subject:
                                    dictionary.home.mock_dashboard.physics,
                                  color: "bg-purple-500",
                                },
                                {
                                  time: "14:30",
                                  subject:
                                    dictionary.home.mock_dashboard.chemistry,
                                  color: "bg-emerald-500",
                                },
                              ].map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2 transition-colors hover:bg-slate-100 dark:border-slate-800/50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                                >
                                  <div className="w-9 text-xs font-bold text-slate-400 dark:text-slate-500">
                                    {item.time}
                                  </div>
                                  <div
                                    className={`h-8 w-1 rounded-full ${item.color}`}
                                  ></div>
                                  <div className="flex-1">
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                      {item.subject}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                      12-A •{" "}
                                      {dictionary.home.mock_dashboard.room} 301
                                    </div>
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
                  <div className="animate-blob absolute -top-10 -right-6 h-40 w-40 rounded-full bg-blue-500 opacity-40 mix-blend-multiply blur-3xl filter"></div>
                  <div className="animate-blob animation-delay-2000 absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500 opacity-40 mix-blend-multiply blur-3xl filter"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features + Stats Section */}
        <section className="bg-white py-24 transition-colors dark:bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="mb-16 flex flex-col items-center gap-12 lg:flex-row">
              <FadeIn className="flex flex-1 flex-col items-center justify-center text-center lg:items-center lg:text-center">
                <p className="mb-4 text-sm font-semibold tracking-[0.25em] text-[#2062A3]/80 uppercase dark:text-blue-400">
                  {dictionary.home.features.badge}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                  {dictionary.home.features.title}
                </h2>
                <p className="max-w-xl leading-relaxed text-gray-600 dark:text-slate-400">
                  {dictionary.home.features.subtitle}
                </p>
                <div className="group relative mt-8 flex h-[600px] w-full items-center justify-center lg:mt-12 lg:h-[700px]">
                  <div className="relative h-full w-full">
                    <Carousel items={carouselItems} dictionary={dictionary} />
                  </div>
                </div>
              </FadeIn>

              <div
                className="relative flex-1 lg:pl-12"
                style={featureAxisStyle}
              >
                {/* Connecting Line */}
                <FadeIn className="pointer-events-none absolute inset-y-3 left-1/2 z-0 flex w-10 -translate-x-1/2 justify-center lg:left-[var(--feature-axis)] lg:translate-x-0">
                  <div className="feature-line relative h-full w-[6px] -translate-x-1/2">
                    <span className="feature-flash"></span>
                    <span className="feature-node feature-node--top"></span>
                    <span className="feature-node feature-node--bottom"></span>
                  </div>
                </FadeIn>

                <StaggerContainer
                  className="relative z-10 flex flex-col gap-5"
                  delay={0.2}
                >
                  {[
                    {
                      icon: Calendar,
                      title: dictionary.home.features.scheduling_title,
                      desc: dictionary.home.features.scheduling_desc,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-50 dark:bg-blue-900/20",
                    },
                    {
                      icon: Users,
                      title: dictionary.home.features.students_title,
                      desc: dictionary.home.features.students_desc,
                      color: "text-indigo-600 dark:text-indigo-400",
                      bg: "bg-indigo-50 dark:bg-indigo-900/20",
                    },
                    {
                      icon: LineChart,
                      title: dictionary.home.features.progress_title,
                      desc: dictionary.home.features.progress_desc,
                      color: "text-emerald-600 dark:text-emerald-400",
                      bg: "bg-emerald-50 dark:bg-emerald-900/20",
                    },
                    {
                      icon: MessageSquare,
                      title: dictionary.home.features.communication_title,
                      desc: dictionary.home.features.communication_desc,
                      color: "text-purple-600 dark:text-purple-400",
                      bg: "bg-purple-50 dark:bg-purple-900/20",
                    },
                    {
                      icon: CreditCard,
                      title: dictionary.home.features.payments_title,
                      desc: dictionary.home.features.payments_desc,
                      color: "text-orange-600 dark:text-orange-400",
                      bg: "bg-orange-50 dark:bg-orange-900/20",
                    },
                    {
                      icon: Library,
                      title: dictionary.home.features.resources_title,
                      desc: dictionary.home.features.resources_desc,
                      color: "text-pink-600 dark:text-pink-400",
                      bg: "bg-pink-50 dark:bg-pink-900/20",
                    },
                    {
                      icon: Smartphone,
                      title: dictionary.home.features.mobile_title,
                      desc: dictionary.home.features.mobile_desc,
                      color: "text-cyan-600 dark:text-cyan-400",
                      bg: "bg-cyan-50 dark:bg-cyan-900/20",
                    },
                  ].map((feature, index) => (
                    <StaggerItem
                      key={index}
                      className="group relative flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-6 shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-md sm:gap-5 sm:px-6 lg:flex-row dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
                    >
                      <span className="feature-dot"></span>
                      <div
                        className={`h-12 w-12 shrink-0 ${feature.bg} relative z-10 flex items-center justify-center rounded-xl ring-4 ring-white transition-transform duration-300 group-hover:scale-110 dark:ring-slate-800`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
                        <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
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
        <section className="relative overflow-hidden bg-slate-50 py-24 transition-colors dark:bg-slate-900">
          {/* Background Elements */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
            <div className="animate-blob absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-100/50 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-blue-900/20 dark:mix-blend-screen"></div>
            <div className="animate-blob animation-delay-2000 absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-indigo-100/50 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-indigo-900/20 dark:mix-blend-screen"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
                {dictionary.home.how_it_works.title}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                {lang === "tr"
                  ? "Karmaşık süreçleri basitleştirin. Sadece 3 adımda dijital dönüşümünüzü tamamlayın."
                  : "Simplify complex processes. Complete your digital transformation in just 3 steps."}
              </p>
            </div>

            <StaggerContainer className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-3 lg:gap-12">
              {/* Connecting Line (Desktop) */}
              <div className="absolute top-16 right-[16%] left-[16%] -z-10 hidden h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 md:block dark:from-blue-800 dark:via-indigo-800 dark:to-blue-800"></div>

              {/* Step 1 */}
              <StaggerItem className="group relative">
                <div className="relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 dark:hover:border-blue-700">
                  <div className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-gradient-to-r from-blue-400 to-blue-600 transition-transform duration-500 group-hover:scale-x-100"></div>
                  <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-900/30">
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-sm font-bold text-white shadow-md dark:border-slate-800">
                      1
                    </div>
                    <UserPlus className="h-9 w-9 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-3 text-center text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                    {dictionary.home.how_it_works.step1_title}
                  </h3>
                  <p className="text-center leading-relaxed text-slate-600 dark:text-slate-400">
                    {dictionary.home.how_it_works.step1_desc}
                  </p>
                </div>
              </StaggerItem>

              {/* Step 2 */}
              <StaggerItem className="group relative">
                <div className="relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 dark:hover:border-indigo-700">
                  <div className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-gradient-to-r from-indigo-400 to-indigo-600 transition-transform duration-500 group-hover:scale-x-100"></div>
                  <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 transition-transform duration-300 group-hover:scale-110 dark:bg-indigo-900/30">
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-sm font-bold text-white shadow-md dark:border-slate-800">
                      2
                    </div>
                    <Settings className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="mb-3 text-center text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-400">
                    {dictionary.home.how_it_works.step2_title}
                  </h3>
                  <p className="text-center leading-relaxed text-slate-600 dark:text-slate-400">
                    {dictionary.home.how_it_works.step2_desc}
                  </p>
                </div>
              </StaggerItem>

              {/* Step 3 */}
              <StaggerItem className="group relative">
                <div className="relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 dark:hover:border-emerald-700">
                  <div className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-gradient-to-r from-emerald-400 to-emerald-600 transition-transform duration-500 group-hover:scale-x-100"></div>
                  <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-900/30">
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-sm font-bold text-white shadow-md dark:border-slate-800">
                      3
                    </div>
                    <BookOpen className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mb-3 text-center text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                    {dictionary.home.how_it_works.step3_title}
                  </h3>
                  <p className="text-center leading-relaxed text-slate-600 dark:text-slate-400">
                    {dictionary.home.how_it_works.step3_desc}
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-slate-100 bg-white py-20 transition-colors dark:border-slate-800 dark:bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
              {/* Teachers */}
              <div className="flex items-center gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-colors hover:border-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {teacherCount.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                      {dictionary.home.stats.teachers_suffix}
                    </span>
                  </div>
                  <p className="mb-1 text-lg font-medium text-slate-700 dark:text-slate-300">
                    {dictionary.home.stats.teachers_label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.home.stats.teachers_hint}
                  </p>
                </div>
              </div>

              {/* Students */}
              <div className="flex items-center gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-colors hover:border-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                  <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {studentCount.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                      {dictionary.home.stats.students_suffix}
                    </span>
                  </div>
                  <p className="mb-1 text-lg font-medium text-slate-700 dark:text-slate-300">
                    {dictionary.home.stats.students_label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.home.stats.students_hint}
                  </p>
                </div>
              </div>

              {/* Lessons */}
              <div className="flex items-center gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-colors hover:border-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
                  <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {lessonCount.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                      {dictionary.home.stats.lessons_suffix}
                    </span>
                  </div>
                  <p className="mb-1 text-lg font-medium text-slate-700 dark:text-slate-300">
                    {dictionary.home.stats.lessons_label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.home.stats.lessons_hint}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-[#1d4f87] transition-colors duration-300 dark:bg-slate-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 dark:opacity-5"></div>
            <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-900/10"></div>
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-900/10"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl dark:text-white">
              {dictionary.home.cta.title}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-blue-100 dark:text-slate-400">
              {dictionary.home.cta.subtitle}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-14 w-full bg-white px-10 text-lg text-[#1d4f87] shadow-xl shadow-blue-900/20 hover:bg-blue-50 sm:w-auto dark:bg-blue-600 dark:text-white dark:shadow-none dark:hover:bg-blue-700"
                asChild
              >
                <Link href={`/${lang}/register`}>
                  {dictionary.home.cta.button}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full border-white/20 bg-transparent px-10 text-lg text-white hover:bg-white/10 sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                asChild
              >
                <Link href={`/${lang}/login`}>{dictionary.home.login}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-8 transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-12">
            {/* Brand */}
            <div className="space-y-6 md:col-span-5">
              <div className="flex items-center gap-2">
                <DenikoLogo className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                  Deniko
                </span>
              </div>
              <p className="max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400">
                {dictionary.home.hero_subtitle}
              </p>
              <div className="flex items-center gap-4">
                {/* Social Media Icons */}
                <a
                  href="https://github.com/Kinin-Code-Offical"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-blue-200 hover:text-[#2062A3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-blue-800 dark:hover:text-blue-400"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.patreon.com/YamacGursel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-blue-200 hover:text-[#2062A3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-blue-800 dark:hover:text-blue-400"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 .48c0-.176.144-.32.32-.32h7.214c5.225 0 9.46 4.235 9.46 9.46 0 5.225-4.235 9.46-9.46 9.46H4.741c-.176 0-.32-.144-.32-.32V.48zm-4.741 0c0-.176.144-.32.32-.32h4.101c.176 0 .32.144.32.32v23.04c0 .176-.144.32-.32.32H.32c-.176 0-.32-.144-.32-.32V.48z"
                      transform="translate(4.741)"
                    />
                    <rect
                      width="4.101"
                      height="23.04"
                      x="0"
                      y=".48"
                      rx=".32"
                      ry=".32"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div className="md:col-span-3 md:col-start-7">
              <h4 className="mb-6 font-bold text-slate-900 dark:text-white">
                {lang === "tr" ? "Platform" : "Platform"}
              </h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    href={`/${lang}/login`}
                    className="flex items-center gap-2 transition-colors hover:text-[#2062A3] dark:hover:text-blue-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200 dark:bg-blue-800"></span>
                    {dictionary.home.login}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${lang}/register`}
                    className="flex items-center gap-2 transition-colors hover:text-[#2062A3] dark:hover:text-blue-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200 dark:bg-blue-800"></span>
                    {dictionary.home.get_started}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-3">
              <h4 className="mb-6 font-bold text-slate-900 dark:text-white">
                {lang === "tr" ? "Yasal" : "Legal"}
              </h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    href={`/${lang}/legal/terms`}
                    className="flex items-center gap-2 transition-colors hover:text-[#2062A3] dark:hover:text-blue-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200 dark:bg-blue-800"></span>
                    {lang === "tr"
                      ? "Kullanıcı Sözleşmesi"
                      : "Terms of Service"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${lang}/legal/privacy`}
                    className="flex items-center gap-2 transition-colors hover:text-[#2062A3] dark:hover:text-blue-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200 dark:bg-blue-800"></span>
                    {lang === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${lang}/legal/cookies`}
                    className="flex items-center gap-2 transition-colors hover:text-[#2062A3] dark:hover:text-blue-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200 dark:bg-blue-800"></span>
                    {lang === "tr" ? "Çerez Politikası" : "Cookie Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${lang}/legal/kvkk`}
                    className="flex items-center gap-2 transition-colors hover:text-[#2062A3] dark:hover:text-blue-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200 dark:bg-blue-800"></span>
                    {lang === "tr"
                      ? "KVKK Aydınlatma Metni"
                      : "KVKK Clarification Text"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lang === "tr"
                ? "© 2025 Deniko. Tüm hakları saklıdır."
                : "© 2025 Deniko. All rights reserved."}
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {lang === "tr"
                  ? "Patent hakları Deniko'ya aittir."
                  : "Patent rights belong to Deniko."}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
