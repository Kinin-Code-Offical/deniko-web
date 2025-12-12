import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, MoreVertical, Trash, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function FilesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  // Mock data
  const files = [
    { id: 1, name: "Lesson_Plan.pdf", size: "2.5 MB", date: "2023-10-01" },
    { id: 2, name: "Homework_1.docx", size: "1.2 MB", date: "2023-10-05" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.files.title}
        </h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          {dictionary.dashboard.files.upload}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="hover:bg-muted/50 cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors">
            <Upload className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              {dictionary.dashboard.files.drag_drop}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                  <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />{" "}
                      {dictionary.dashboard.files.download}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />{" "}
                      {dictionary.dashboard.files.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <p className="truncate font-medium" title={file.name}>
                  {file.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {file.size} • {file.date}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
