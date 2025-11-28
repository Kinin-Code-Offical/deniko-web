import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <span className="text-xl font-bold text-white">D</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Deniko'ya Hoş Geldiniz</CardTitle>
          <CardDescription>
            Öğretmenler ve Öğrenciler için Yeni Nesil Asistan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-500">
            Sistem başarıyla kuruldu ve yayına hazır.
          </p>
          <div className="grid gap-2">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/register">Yeni Hesap Oluştur</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}