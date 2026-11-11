import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import styled from "styled-components";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { formatMoney } from "../../../utils/helpers";
import { pointLabel, type TrendPoint } from "./statistics";

// Динаміка: стовпчик на день (або на місяць для довгих періодів). Дотик показує суму.

const Box = styled.div`
  height: 150px;
  margin: 0 -4px;
`;

const Edges = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: var(--m-label-2);
`;

const Bubble = styled.div`
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--m-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  font-size: 13px;

  p {
    margin: 0;
  }
  .date {
    color: var(--m-label-2);
  }
  .value {
    font-weight: 600;
  }
`;

interface Props {
  points: TrendPoint[];
  monthly: boolean;
  color: string;
  currency: string;
  language: string;
}

interface TipProps {
  active?: boolean;
  payload?: { payload?: { date: number; total: number } }[];
  monthly: boolean;
  currency: string;
  language: string;
}

function PointTip({ active, payload, monthly, currency, language }: TipProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return (
    <Bubble>
      <p className="date">{pointLabel(item.date, monthly)}</p>
      <p className="value">{formatMoney(Math.round(item.total * 100), currency, language, false)}</p>
    </Bubble>
  );
}

export function TrendChart({ points, monthly, color, currency, language }: Props) {
  const data = points.map((p) => ({ date: p.date, total: p.total / 100 }));
  const edge = (ms: number) => format(new Date(ms), monthly ? "LLL yyyy" : "d MMM", { locale: uk });

  return (
    <div role="img" aria-label="Динаміка за період">
      <Box>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <BarChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }} barCategoryGap={data.length > 45 ? 0 : "18%"}>
            <XAxis dataKey="date" hide />
            <Tooltip content={<PointTip monthly={monthly} currency={currency} language={language} />} cursor={{ fill: "var(--m-fill)" }} isAnimationActive={false} />
            <Bar dataKey="total" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {points.length > 1 && (
        <Edges>
          <span>{edge(points[0].date)}</span>
          <span>{edge(points[points.length - 1].date)}</span>
        </Edges>
      )}
    </div>
  );
}
