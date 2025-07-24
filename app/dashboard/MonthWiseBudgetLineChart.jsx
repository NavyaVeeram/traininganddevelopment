"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  Training_Budget: {
    label: "Training Budget",
    color: "var(--chart-1, #3b82f6)",
  },
  Actual_Budget: {
    label: "Actual Budget",
    color: "var(--chart-2, #2563eb)",
  },
};

export default function MonthWiseBudgetLineChart({ data, year }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Month Wise Budget IATF</CardTitle>
        <CardDescription>{year}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={data}
            margin={{ left: 12, right: 12 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="Req_Month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="Training_Budget"
              type="monotone"
              stroke="var(--chart-1, #3b82f6)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Actual_Budget"
              type="monotone"
              stroke="var(--chart-2, #2563eb)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing budget for the selected year
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}