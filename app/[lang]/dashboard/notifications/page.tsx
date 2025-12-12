import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CreditCard, Info } from "lucide-react";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  // Mock data
  const notifications = [
    {
      id: 1,
      type: "system",
      title: dictionary.dashboard.notifications.mock_title_1,
      message: dictionary.dashboard.notifications.mock_msg_1,
      time: dictionary.dashboard.notifications.mock_time_1,
      read: false,
    },
    {
      id: 2,
      type: "lesson",
      title: dictionary.dashboard.notifications.mock_title_2,
      message: dictionary.dashboard.notifications.mock_msg_2,
      time: dictionary.dashboard.notifications.mock_time_2,
      read: true,
    },
    {
      id: 3,
      type: "finance",
      title: dictionary.dashboard.notifications.mock_title_3,
      message: dictionary.dashboard.notifications.mock_msg_3,
      time: dictionary.dashboard.notifications.mock_time_3,
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "finance":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.notifications.title}
        </h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            {dictionary.dashboard.notifications.all}
          </TabsTrigger>
          <TabsTrigger value="unread">
            {dictionary.dashboard.notifications.unread}
          </TabsTrigger>
          <TabsTrigger value="system">
            {dictionary.dashboard.notifications.system}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id} className={notif.read ? "opacity-70" : ""}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="bg-muted mt-1 rounded-full p-2">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{notif.title}</h4>
                    <span className="text-muted-foreground text-xs">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <div className="bg-primary mt-2 h-2 w-2 rounded-full" />
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="unread">
          <div className="text-muted-foreground py-10 text-center">
            {dictionary.dashboard.notifications.no_unread}
          </div>
        </TabsContent>
        <TabsContent value="system">
          <div className="text-muted-foreground py-10 text-center">
            {dictionary.dashboard.notifications.no_system}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
