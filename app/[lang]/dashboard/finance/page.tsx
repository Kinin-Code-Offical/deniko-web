import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const baseUrl = "https://deniko.net";
  const pathname = "/dashboard/finance";

  return {
    title: dictionary.metadata.finance.title,
    description: dictionary.metadata.finance.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${lang}${pathname}`,
      languages: {
        "tr-TR": `/tr${pathname}`,
        "en-US": `/en${pathname}`,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function FinancePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  // Mock data
  const transactions = [
    {
      id: 1,
      student: "Alice Smith",
      amount: "$50.00",
      date: "2023-10-25",
      status: "Paid",
    },
    {
      id: 2,
      student: "Bob Johnson",
      amount: "$45.00",
      date: "2023-10-24",
      status: "Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.nav.finance}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.finance.total_revenue}
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dictionary.dashboard.finance.mock_revenue}
            </div>
            <p className="text-muted-foreground text-xs">
              {dictionary.dashboard.finance.revenue_growth}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.finance.outstanding}
            </CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dictionary.dashboard.finance.mock_outstanding}
            </div>
            <p className="text-muted-foreground text-xs">
              {dictionary.dashboard.finance.pending_payments_count}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.finance.active_subscriptions}
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dictionary.dashboard.finance.mock_subscriptions}
            </div>
            <p className="text-muted-foreground text-xs">
              {dictionary.dashboard.finance.subscriptions_growth}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {dictionary.dashboard.finance.recent_transactions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{tx.student}</p>
                  <p className="text-muted-foreground text-sm">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{tx.amount}</p>
                  <span
                    className={`text-xs ${tx.status === "Paid" ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
