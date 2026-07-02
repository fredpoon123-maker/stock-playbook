import type { Stock } from "@prisma/client";
import { updateStock } from "@/lib/actions";
import { parseJSON, type EntryTiers, type FactorGrades } from "@/lib/types";

function dateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function StockForm({ stock }: { stock?: Stock }) {
  const entryTiers = parseJSON<EntryTiers>(stock?.entryTiers, {
    first: null,
    add: null,
    heavy: null,
  });
  const catalysts = parseJSON<string[]>(stock?.catalysts, []);
  const risks = parseJSON<string[]>(stock?.risks, []);
  const factorGrades = parseJSON<FactorGrades>(stock?.saFactorGrades, {});

  return (
    <form action={updateStock} className="flex flex-col gap-6">
      <input type="hidden" name="originalTicker" value={stock?.ticker ?? ""} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Ticker">
          <input
            name="ticker"
            defaultValue={stock?.ticker}
            required
            className="input"
          />
        </Field>
        <Field label="公司名稱">
          <input
            name="name"
            defaultValue={stock?.name}
            required
            className="input"
          />
        </Field>
        <Field label="驅動因子">
          <input
            name="driver"
            defaultValue={stock?.driver}
            required
            className="input"
          />
        </Field>
        <Field label="行業（peer分組用）">
          <input
            name="industry"
            defaultValue={stock?.industry ?? ""}
            className="input"
          />
        </Field>
        <Field label="信念">
          <select
            name="conviction"
            defaultValue={stock?.conviction ?? "MED"}
            className="input"
          >
            <option value="HIGH">High</option>
            <option value="MED">Med</option>
            <option value="LOW">Low</option>
          </select>
        </Field>
        <Field label="注碼">
          <select
            name="positionSize"
            defaultValue={stock?.positionSize ?? "MEDIUM"}
            className="input"
          >
            <option value="LARGE">大注</option>
            <option value="MEDIUM">中注</option>
            <option value="SMALL">細注</option>
          </select>
        </Field>
        <Field label="狀態">
          <select
            name="status"
            defaultValue={stock?.status ?? "HOLD"}
            className="input"
          >
            <option value="ACCUMULATE">🟢 Accumulate</option>
            <option value="HOLD">🟡 Hold / Watch</option>
            <option value="AVOID">🔴 Avoid</option>
          </select>
        </Field>
        <Field label="下次業績日期">
          <input
            type="date"
            name="nextEarnings"
            defaultValue={dateInputValue(stock?.nextEarnings)}
            className="input"
          />
        </Field>
      </div>

      <Field label="簡介">
        <textarea
          name="synopsis"
          defaultValue={stock?.synopsis ?? ""}
          rows={2}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="第一注 ($)">
          <input
            type="number"
            step="0.01"
            name="entryFirst"
            defaultValue={entryTiers.first ?? ""}
            className="input"
          />
        </Field>
        <Field label="加注 ($)">
          <input
            type="number"
            step="0.01"
            name="entryAdd"
            defaultValue={entryTiers.add ?? ""}
            className="input"
          />
        </Field>
        <Field label="重注 ($)">
          <input
            type="number"
            step="0.01"
            name="entryHeavy"
            defaultValue={entryTiers.heavy ?? ""}
            className="input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="催化劑（每行一項）">
          <textarea
            name="catalysts"
            defaultValue={catalysts.join("\n")}
            rows={4}
            className="input"
          />
        </Field>
        <Field label="風險（每行一項）">
          <textarea
            name="risks"
            defaultValue={risks.join("\n")}
            rows={4}
            className="input"
          />
        </Field>
      </div>

      <fieldset className="rounded-lg border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-medium text-zinc-600">
          Seeking Alpha Premium資料（手動抄錄）
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Quant Rating">
            <input
              name="saQuantRating"
              defaultValue={stock?.saQuantRating ?? ""}
              className="input"
              placeholder="Strong Buy"
            />
          </Field>
          <Field label="Author Rating">
            <input
              name="saAuthorRating"
              defaultValue={stock?.saAuthorRating ?? ""}
              className="input"
              placeholder="Buy"
            />
          </Field>
          <Field label="Valuation Grade">
            <input
              name="gradeValuation"
              defaultValue={factorGrades.valuation ?? ""}
              className="input"
              placeholder="D+"
            />
          </Field>
          <Field label="Growth Grade">
            <input
              name="gradeGrowth"
              defaultValue={factorGrades.growth ?? ""}
              className="input"
              placeholder="A"
            />
          </Field>
          <Field label="Profitability Grade">
            <input
              name="gradeProfitability"
              defaultValue={factorGrades.profitability ?? ""}
              className="input"
            />
          </Field>
          <Field label="Momentum Grade">
            <input
              name="gradeMomentum"
              defaultValue={factorGrades.momentum ?? ""}
              className="input"
            />
          </Field>
          <Field label="Revisions Grade">
            <input
              name="gradeRevisions"
              defaultValue={factorGrades.revisions ?? ""}
              className="input"
            />
          </Field>
        </div>
      </fieldset>

      <Field label="筆記">
        <textarea
          name="notes"
          defaultValue={stock?.notes ?? ""}
          rows={3}
          className="input"
        />
      </Field>

      <button
        type="submit"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {stock ? "儲存" : "新增股票"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
