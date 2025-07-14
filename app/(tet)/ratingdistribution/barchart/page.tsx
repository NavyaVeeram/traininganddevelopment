"use client"

import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Rating Counts Bar Chart";

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Average",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const chartConfig = {
  count: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface RatingCount {
  rating: string;
  count: number;
}

export default function ChartBarDefault() {
  const [chartData, setChartData] = useState<RatingCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRatingCounts() {
      try {
        const response = await fetch("/api/get_rating_counts");
        if (!response.ok) {
          throw new Error("Failed to fetch rating counts");
        }
        const data = await response.json();

        // Map numeric ratings to labels and format data for chart
  const formattedData = (data as { Rating: number; RatingCount: number }[]).map((item) => ({
    rating: ratingLabels[item.Rating] || `Rating ${item.Rating}`,
    count: item.RatingCount,
  }));

  setChartData(formattedData);
  setLoading(false);
} catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(String(err));
  }
  setLoading(false);
}
    }

    fetchRatingCounts();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 50 }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="mt-18">
      <Card style={{ width: 550, height: 480 }}>
        <CardHeader>
          <CardTitle>Safety in Grinding Operations</CardTitle>
          <CardDescription>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              {Object.entries(ratingLabels).map(([key, label]) => {
                const count = chartData.find(item => item.rating === label)?.count || 0;
                return (
                  <div key={key} style={{ textAlign: "center", minWidth: 60 }}>
                    <div>{label}</div>
                    <div>{count}</div>
                  </div>
                );
              })}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              width={400}
              height={300}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="rating" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
  <Bar
    dataKey="count"
    fill="var(--chart-1)"
    radius={8}
    label={({ x, y, width, value }: { x: number; y: number; width: number; value: number }) => {
      const total = chartData.reduce((sum, item) => sum + item.count, 0);
      const percent = ((value / total) * 100).toFixed(0) + "%";
      return (
        <text
          x={x + width / 2}
          y={y - 5}
          fill="#000"
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
        >
          {percent}
        </text>
      );
    }}
  />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing rating counts from the latest data
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
