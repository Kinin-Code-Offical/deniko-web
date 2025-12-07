"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import type { Dictionary } from "@/types/i18n";
import { type PaymentType, Prisma } from "@prisma/client";

interface Transaction {
  id: string;
  date: Date;
  type: PaymentType | "LESSON_FEE";
  description: string;
  amount: Prisma.Decimal;
}

interface StudentFinanceTabProps {
  transactions: Transaction[];
  dictionary: Dictionary;
  lang: string;
}

export function StudentFinanceTab({
  transactions,
  dictionary,
  lang,
}: StudentFinanceTabProps) {
  const dateLocale = lang === "tr" ? tr : enUS;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{dictionary.student_detail.finance.title}</CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.student_detail.finance.receive_payment}
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            {dictionary.student_detail.finance.no_transactions}
          </div>
        ) : (
          <Table>
            <TableCaption>
              {dictionary.student_detail.finance.title}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {dictionary.student_detail.finance.table.date}
                </TableHead>
                <TableHead>
                  {dictionary.student_detail.finance.table.type}
                </TableHead>
                <TableHead>
                  {dictionary.student_detail.finance.table.description}
                </TableHead>
                <TableHead className="text-right">
                  {dictionary.student_detail.finance.table.amount}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    {format(new Date(tx.date), "PPP", { locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    {tx.type === "LESSON_FEE" ? (
                      <Badge
                        variant="outline"
                        className="flex w-fit items-center gap-1 border-orange-200 bg-orange-50 text-orange-700"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        {dictionary.student_detail.finance.lesson_fee}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex w-fit items-center gap-1 border-green-200 bg-green-50 text-green-700"
                      >
                        <ArrowDownLeft className="h-3 w-3" />
                        {dictionary.student_detail.finance.payment_received}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${tx.type === "LESSON_FEE" ? "text-destructive" : "text-green-600"}`}
                  >
                    {tx.type === "LESSON_FEE" ? "-" : "+"}
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(Math.abs(Number(tx.amount)))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
