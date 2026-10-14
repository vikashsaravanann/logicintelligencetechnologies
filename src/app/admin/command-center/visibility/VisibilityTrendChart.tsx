"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  VISIBILITY_PLATFORMS,
  type TrendPoint,
} from "@/lib/visibility/metrics";

/**
 * Read-only trend of visibility score (% of active queries mentioned) over
 * time, one line per platform. Client component because recharts needs the DOM.
 */
export function VisibilityTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs font-medium text-[var(--lit-text-muted,#52677C)]">
        No probe history yet — run the Visibility Probe to populate the trend.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#52677C" }}
            tickLine={false}
            axisLine={{ stroke: "#DFE7EF" }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#52677C" }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            formatter={(
              value: number | string | readonly (number | string)[] | undefined,
              name: number | string | undefined,
            ): [string, string] => [
              value == null || Array.isArray(value) ? "—" : `${value}%`,
              PLATFORM_LABELS[name as keyof typeof PLATFORM_LABELS] ?? String(name ?? ""),
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #DFE7EF",
              fontSize: 12,
              boxShadow: "0 1px 2px rgba(11,37,69,0.06)",
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 11, color: "#52677C" }}>
                {PLATFORM_LABELS[value as keyof typeof PLATFORM_LABELS] ?? value}
              </span>
            )}
          />
          {VISIBILITY_PLATFORMS.map((platform) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              name={platform}
              stroke={PLATFORM_COLORS[platform]}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
