import Link from "next/link";
import type { StockView } from "@/lib/types";
import { CONVICTION_LABEL, POSITION_LABEL, STATUS_LABEL } from "@/lib/types";
import { fmtPrice, fmtMarketCap, fmtDate } from "@/lib/format";
import { driverColor } from "@/lib/driverColor";

const CONV_CLASS: Record<string, string> = {
  HIGH: "pb-conv-h",
  MED: "pb-conv-m",
  LOW: "pb-conv-l",
};

const BADGE_CLASS: Record<string, string> = {
  ACCUMULATE: "pb-b-buy",
  HOLD: "pb-b-hold",
  AVOID: "pb-b-avoid",
};

export function StockCard({ stock }: { stock: StockView }) {
  const status = STATUS_LABEL[stock.status];
  const hasPE = stock.peRatio != null;

  return (
    <Link href={`/stock/${stock.ticker}`} className="pb-card">
      <div className="pb-top">
        <div>
          <h3>
            {stock.ticker}{" "}
            <span className={`pb-pill ${BADGE_CLASS[stock.status]}`}>{status.emoji}</span>
          </h3>
          <div className="pb-tname">{stock.name}</div>
        </div>
        <div className="pb-px">
          <div className="pb-p">{fmtPrice(stock.price)}</div>
          <div className="pb-m">
            {fmtMarketCap(stock.marketCap)}
            {stock.beta != null ? ` · β${stock.beta.toFixed(2)}` : ""}
          </div>
        </div>
      </div>

      <div className="pb-strip">
        <div>
          <div className="pb-k">信念</div>
          <div className={`pb-v ${CONV_CLASS[stock.conviction]}`}>{CONVICTION_LABEL[stock.conviction]}</div>
        </div>
        <div>
          <div className="pb-k">注碼</div>
          <div className="pb-v">{POSITION_LABEL[stock.positionSize]}</div>
        </div>
        <div>
          <div className="pb-k">驅動</div>
          <span className="pb-dtag" style={{ background: driverColor(stock.driver) }}>
            {stock.driver}
          </span>
        </div>
      </div>

      <div className="pb-body">
        {stock.synopsis && (
          <div className="pb-row">
            <span className="pb-lbl">簡介</span>
            {stock.synopsis}
          </div>
        )}

        {hasPE && (
          <div className="pb-stats">
            <span>
              P/E <b>{stock.peRatio!.toFixed(1)}</b>
              {stock.peerAvgPE != null ? ` vs 同業 ${stock.peerAvgPE.toFixed(1)}` : ""}
            </span>
          </div>
        )}

        <div className="pb-row">
          <span className="pb-lbl">買入價位</span>
          <div className="pb-entries">
            <div className="pb-entry">
              <div className="pb-e1">第一注</div>
              <div className="pb-e2">{fmtPrice(stock.entryTiers.first)}</div>
            </div>
            <div className="pb-entry">
              <div className="pb-e1">加注</div>
              <div className="pb-e2">{fmtPrice(stock.entryTiers.add)}</div>
            </div>
            <div className="pb-entry">
              <div className="pb-e1">重注</div>
              <div className="pb-e2">{fmtPrice(stock.entryTiers.heavy)}</div>
            </div>
          </div>
        </div>

        {stock.catalysts.length > 0 && (
          <div className="pb-row">
            <span className="pb-lbl">催化劑 / 前景</span>
            <ul className="pb-mini">
              {stock.catalysts.slice(0, 3).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {stock.risks.length > 0 && (
          <div className="pb-row">
            <span className="pb-lbl">風險 ⚠️</span>
            <ul className="pb-mini">
              {stock.risks.slice(0, 2).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {stock.nextEarnings && (
        <div style={{ padding: "0 15px 13px" }}>
          <div className="pb-earn">
            📅 下次業績 <span className="pb-nd">{fmtDate(stock.nextEarnings)}</span>
          </div>
        </div>
      )}
    </Link>
  );
}
