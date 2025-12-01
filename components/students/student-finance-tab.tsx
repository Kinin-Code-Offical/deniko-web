"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"

interface StudentFinanceTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactions: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
}

export function StudentFinanceTab({ transactions, dictionary, lang }: StudentFinanceTabProps) {
    const dateLocale = lang === "tr" ? tr : enUS

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{dictionary.dashboard.student_detail.finance.title}</CardTitle>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {dictionary.dashboard.student_detail.finance.receive_payment}
                </Button>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {dictionary.dashboard.student_detail.finance.no_transactions}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
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
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex w-fit items-center gap-1">
                                                <ArrowUpRight className="h-3 w-3" />
                                                {dictionary.dashboard.student_detail.finance.lesson_fee}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex w-fit items-center gap-1">
                                                <ArrowDownLeft className="h-3 w-3" />
                                                {dictionary.dashboard.student_detail.finance.payment_received}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell className={`text-right font-medium ${tx.type === "LESSON_FEE" ? "text-destructive" : "text-green-600"}`}>
                                        {tx.type === "LESSON_FEE" ? "-" : "+"}
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.abs(Number(tx.amount)))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
