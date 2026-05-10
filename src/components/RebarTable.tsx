import { useMemo } from 'react';
import { useParamsStore } from '../store/paramsStore';
import { generate } from '../rebar/generators';
import { GeneratedModel } from '../rebar/types';

const STEEL_DENSITY_KG_PER_M3 = 7850;

export interface TableRow {
  label: string;
  diameter: number;
  grade: string;
  count: number;
  unitLengthMm: number;
  totalLengthM: number;
  weightKg: number;
}

export function buildTableRows(model: GeneratedModel): TableRow[] {
  const rows: TableRow[] = [];

  // Group single rebars by (label || role+diameter)
  const singleGroups = new Map<string, { sample: typeof model.rebars[number]; count: number; len: number }>();
  model.rebars.forEach((r) => {
    const key = `${r.role}-${r.diameter}-${r.grade}-${r.label ?? ''}`;
    const len = r.curve.getLength();
    const g = singleGroups.get(key);
    if (g) {
      g.count += 1;
      g.len += len;
    } else {
      singleGroups.set(key, { sample: r, count: 1, len });
    }
  });
  singleGroups.forEach((g) => {
    const unit = g.len / g.count;
    const areaMm2 = Math.PI * (g.sample.diameter / 2) ** 2;
    const volumeM3 = (areaMm2 * 1e-6) * (g.len * 1e-3);
    rows.push({
      label: g.sample.label ?? `${g.sample.role} Φ${g.sample.diameter}`,
      diameter: g.sample.diameter,
      grade: g.sample.grade,
      count: g.count,
      unitLengthMm: Math.round(unit),
      totalLengthM: +(g.len / 1000).toFixed(2),
      weightKg: +(volumeM3 * STEEL_DENSITY_KG_PER_M3).toFixed(2),
    });
  });

  // Batches
  model.batches.forEach((b) => {
    const unit = b.curve.getLength();
    const count = Math.max(1, b.translations.length);
    const totalMm = unit * count;
    const areaMm2 = Math.PI * (b.diameter / 2) ** 2;
    const volumeM3 = (areaMm2 * 1e-6) * (totalMm * 1e-3);
    rows.push({
      label: b.label ?? `${b.role} Φ${b.diameter}`,
      diameter: b.diameter,
      grade: b.grade,
      count,
      unitLengthMm: Math.round(unit),
      totalLengthM: +(totalMm / 1000).toFixed(2),
      weightKg: +(volumeM3 * STEEL_DENSITY_KG_PER_M3).toFixed(2),
    });
  });

  return rows;
}

export function RebarTable() {
  const params = useParamsStore((s) => s.current());
  const model = useMemo(() => generate(params), [params]);
  const rows = useMemo(() => buildTableRows(model), [model]);
  const total = rows.reduce((acc, r) => acc + r.weightKg, 0);

  return (
    <div className="text-xs">
      <div className="section-title">钢筋材料表</div>
      <div className="overflow-auto max-h-64 border border-slate-700 rounded">
        <table className="w-full text-left">
          <thead className="bg-slate-800 sticky top-0">
            <tr className="text-slate-300">
              <th className="px-2 py-1">编号/类别</th>
              <th className="px-2 py-1">规格</th>
              <th className="px-2 py-1 text-right">数量</th>
              <th className="px-2 py-1 text-right">单根(mm)</th>
              <th className="px-2 py-1 text-right">总长(m)</th>
              <th className="px-2 py-1 text-right">重量(kg)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-700">
                <td className="px-2 py-1">{r.label}</td>
                <td className="px-2 py-1">{r.grade} Φ{r.diameter}</td>
                <td className="px-2 py-1 text-right">{r.count}</td>
                <td className="px-2 py-1 text-right">{r.unitLengthMm}</td>
                <td className="px-2 py-1 text-right">{r.totalLengthM}</td>
                <td className="px-2 py-1 text-right">{r.weightKg}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-600 bg-slate-800">
              <td className="px-2 py-1 font-semibold" colSpan={5}>合计</td>
              <td className="px-2 py-1 text-right font-semibold">{total.toFixed(2)} kg</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
