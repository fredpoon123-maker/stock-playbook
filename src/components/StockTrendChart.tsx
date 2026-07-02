"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

const RANGES: { key: string; label: string }[] = [
  { key: "intraday", label: "即日" },
  { key: "5d", label: "5日" },
  { key: "1D", label: "日K" },
  { key: "1W", label: "週K" },
  { key: "1M", label: "月K" },
  { key: "1Y", label: "年K" },
];

type ChartResponse =
  | { type: "line"; points: { time: string; value: number }[] }
  | { type: "candle"; candles: { time: string; open: number; high: number; low: number; close: number }[] };

export function StockTrendChart({ ticker }: { ticker: string }) {
  const [range, setRange] = useState("1D");
  const [status, setStatus] = useState<"loading" | "empty" | "ready" | "error">("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 320,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#5a6b80",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#e2e8f0" },
        horzLines: { color: "#e2e8f0" },
      },
      rightPriceScale: { borderColor: "#e2e8f0" },
      timeScale: { borderColor: "#e2e8f0" },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;

    const resize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch(`/api/stock/${ticker}/chart?range=${range}`)
      .then((res) => res.json())
      .then((data: ChartResponse) => {
        if (cancelled || !chartRef.current) return;

        if (seriesRef.current) {
          chartRef.current.removeSeries(seriesRef.current);
          seriesRef.current = null;
        }

        if (data.type === "line") {
          if (data.points.length === 0) {
            setStatus("empty");
            return;
          }
          const series = chartRef.current.addSeries(LineSeries, {
            color: "#2a78d6",
            lineWidth: 2,
          });
          series.setData(
            data.points.map((p) => ({ time: (Date.parse(p.time) / 1000) as never, value: p.value })),
          );
          seriesRef.current = series;
        } else {
          if (data.candles.length === 0) {
            setStatus("empty");
            return;
          }
          const series = chartRef.current.addSeries(CandlestickSeries, {
            upColor: "#0ca30c",
            downColor: "#d03b3b",
            borderUpColor: "#0ca30c",
            borderDownColor: "#d03b3b",
            wickUpColor: "#0ca30c",
            wickDownColor: "#d03b3b",
          });
          series.setData(data.candles.map((c) => ({ ...c, time: c.time as never })));
          seriesRef.current = series;
        }

        chartRef.current.timeScale().fitContent();
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, range]);

  return (
    <section className="pb-panel">
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <h2 className="pb-section" style={{ margin: 0 }}>
          股價走勢
        </h2>
        <div className="pb-filters" style={{ margin: 0 }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`pb-fbtn ${range === r.key ? "active" : ""}`}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {status === "empty" && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          呢個時間維度未有數據。
        </p>
      )}
      {status === "error" && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          價位數據讀取失敗。
        </p>
      )}
      <div ref={containerRef} style={{ display: status === "empty" || status === "error" ? "none" : "block" }} />
    </section>
  );
}
