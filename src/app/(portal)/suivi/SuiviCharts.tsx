"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export type ChartRow = {
  date: string;
  pain: number | null;
  bristol: number | null;
  stools: number | null;
};

const sage = "#4A7C5F";
const gold = "#B8922A";

export function SuiviCharts({ data }: { data: ChartRow[] }) {
  if (data.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium text-dark">Douleur — 30 derniers jours</h2>
        <p className="text-xs text-dark/60">Echelle 0 a 5</p>
        <div className="mt-4 h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 5]} allowDecimals={false} width={28} />
              <Tooltip formatter={(v: number | undefined) => [v ?? "—", "Douleur"]} />
              <Line type="monotone" dataKey="pain" stroke={sage} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium text-dark">Transit — 30 derniers jours</h2>
        <p className="text-xs text-dark/60">Barres : type Bristol ; ligne : nombre de selles</p>
        <div className="mt-4 h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 7]} allowDecimals={false} width={28} />
              <Tooltip />
              <Bar dataKey="bristol" fill={gold} name="Bristol (1–7)" radius={[4, 4, 0, 0]} />
              <Line type="stepAfter" dataKey="stools" stroke={sage} strokeWidth={2} dot={{ r: 2 }} name="Selles (1–5)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
}
