import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Paperclip } from "lucide-react";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  // Mock data
  const conversations = [
    {
      id: 1,
      name: dictionary.dashboard.messages.mock_user_name,
      lastMessage: dictionary.dashboard.messages.mock_msg_3,
      time: dictionary.dashboard.messages.mock_time_3,
      unread: 2,
    },
    {
      id: 2,
      name: dictionary.dashboard.messages.mock_user_name_2,
      lastMessage: dictionary.dashboard.messages.mock_msg_4,
      time: dictionary.dashboard.messages.mock_time_4,
      unread: 0,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 md:flex-row">
      {/* Conversation List */}
      <Card className="flex w-full flex-col md:w-1/3">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-lg font-medium">
            {dictionary.dashboard.messages.title}
          </CardTitle>
          <div className="relative mt-2">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={dictionary.dashboard.messages.search_placeholder}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="dnk-scrollbar h-full overflow-y-auto">
            <div className="flex flex-col">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="hover:bg-muted/50 flex w-full items-center gap-3 border-b p-4 text-left transition-colors last:border-0"
                >
                  <Avatar>
                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">{conv.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate text-sm">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col">
        <CardHeader className="flex flex-row items-center gap-3 border-b p-4">
          <Avatar>
            <AvatarFallback>
              {dictionary.dashboard.messages.mock_user_initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {dictionary.dashboard.messages.mock_user_name}
            </h3>
            <p className="text-muted-foreground text-xs">
              {dictionary.dashboard.messages.online}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="dnk-scrollbar flex-1 overflow-y-auto pr-4">
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-muted max-w-[80%] rounded-lg p-3">
                  <p className="text-sm">
                    {dictionary.dashboard.messages.mock_msg_1}
                  </p>
                  <span className="text-muted-foreground mt-1 block text-[10px]">
                    {dictionary.dashboard.messages.mock_time_1}
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg p-3">
                  <p className="text-sm">
                    {dictionary.dashboard.messages.mock_msg_2}
                  </p>
                  <span className="text-primary-foreground/70 mt-1 block text-[10px]">
                    {dictionary.dashboard.messages.mock_time_2}
                  </span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted max-w-[80%] rounded-lg p-3">
                  <p className="text-sm">
                    {dictionary.dashboard.messages.mock_msg_3}
                  </p>
                  <span className="text-muted-foreground mt-1 block text-[10px]">
                    {dictionary.dashboard.messages.mock_time_3}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder={dictionary.dashboard.messages.type_message}
              className="flex-1"
            />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
