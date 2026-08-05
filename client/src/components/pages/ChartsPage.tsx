"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { IconTrendingUp, IconArrowUpRight } from "@tabler/icons-react";

const portfolioData = [
  { date: "Jan", value: 120000, profit: 8000 },
  { date: "Feb", value: 135000, profit: 15000 },
  { date: "Mar", value: 128000, profit: -7000 },
  { date: "Apr", value: 145000, profit: 17000 },
  { date: "May", value: 162000, profit: 17000 },
  { date: "Jun", value: 155000, profit: -7000 },
  { date: "Jul", value: 170000, profit: 15000 },
  { date: "Aug", value: 185000, profit: 15000 },
  { date: "Sep", value: 178000, profit: -7000 },
  { date: "Oct", value: 195000, profit: 17000 },
  { date: "Nov", value: 210000, profit: 15000 },
  { date: "Dec", value: 225000, profit: 15000 },
];

const pairsPerformance = [
  { pair: "EUR/USD", profit: 4520, trades: 24, winRate: 72 },
  { pair: "GBP/USD", profit: 3210, trades: 18, winRate: 65 },
  { pair: "BTC/USD", profit: 8900, trades: 12, winRate: 75 },
  { pair: "ETH/USD", profit: 5600, trades: 15, winRate: 70 },
  { pair: "USD/JPY", profit: -1200, trades: 20, winRate: 45 },
  { pair: "XAU/USD", profit: 6700, trades: 10, winRate: 80 },
];

const timeframes = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export default function ChartsPage() {
  const [timeframe, setTimeframe] = useState("1Y");

  const totalProfit = pairsPerformance.reduce((a, b) => a + b.profit, 0);
  const totalTrades = pairsPerformance.reduce((a, b) => a + b.trades, 0);
  const avgWinRate = Math.round(pairsPerformance.reduce((a, b) => a + b.winRate, 0) / pairsPerformance.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your trading performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Profit</p>
          <p className="text-2xl font-bold text-foreground">${totalProfit.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-500">
            <IconArrowUpRight className="h-3 w-3" />+18.2% this month
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-foreground">{totalTrades}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
            <IconTrendingUp className="h-3 w-3" />Active this month
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Avg Win Rate</p>
          <p className="text-2xl font-bold text-foreground">{avgWinRate}%</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-500">
            <IconArrowUpRight className="h-3 w-3" />+2.4% vs last month
          </div>
        </div>
      </div>

      {/* Portfolio Chart */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Portfolio Growth</h2>
            <p className="text-sm text-muted-foreground">Your equity curve over time</p>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeframe === tf ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} formatter={(value) => [`$${Number(value).toLocaleString()}`, "Portfolio"]} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--brand))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pairs Performance */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance by Pair</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pairsPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="pair" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} formatter={(value) => [`$${Number(value).toLocaleString()}`, "Profit"]} />
              <Bar dataKey="profit" fill="hsl(var(--brand))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pairs Table */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-xs font-medium text-muted-foreground">Pair</th>
                <th className="text-right py-3 text-xs font-medium text-muted-foreground">Profit/Loss</th>
                <th className="text-right py-3 text-xs font-medium text-muted-foreground">Trades</th>
                <th className="text-right py-3 text-xs font-medium text-muted-foreground">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {pairsPerformance.map((p) => (
                <tr key={p.pair} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-medium text-foreground">{p.pair}</td>
                  <td className={`py-3 text-right font-semibold ${p.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {p.profit >= 0 ? "+" : ""}${p.profit.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">{p.trades}</td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${p.winRate >= 60 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                      {p.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
