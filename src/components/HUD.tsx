import { useMemo } from 'react';
import { useParamsStore } from '../store/paramsStore';
import { generate } from '../rebar/generators';

export function HUD() {
  const params = useParamsStore((s) => s.current());
  const model = useMemo(() => generate(params), [params]);

  const totalBars =
    model.rebars.length +
    model.batches.reduce((acc, b) => acc + Math.max(1, b.translations.length), 0);

  const dim = model.concrete;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 panel rounded px-3 py-1.5 text-[11px] text-slate-300 flex gap-4 pointer-events-none">
      <span>
        构件 <span className="text-sky-300 font-semibold">{params.type.toUpperCase()}</span>
      </span>
      <span>
        尺寸 {dim.sizeX} × {dim.sizeY} × {dim.sizeZ} mm
      </span>
      <span>
        钢筋 <span className="text-amber-300 font-semibold">{totalBars}</span> 根
      </span>
    </div>
  );
}
