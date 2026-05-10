import { useParamsStore } from '../store/paramsStore';
import { ComponentType, Grade } from '../rebar/types';

const TYPE_LABEL: Record<ComponentType, string> = {
  beam: '梁 KL',
  column: '柱 KZ',
  slab: '板 LB',
  wall: '剪力墙 Q',
  foundation: '基础 JC',
};

const GRADES: Grade[] = ['HPB300', 'HRB400', 'HRB500'];

function NumField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="field">
      <span className="text-slate-300">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="field">
      <span className="text-slate-300">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function BeamFields() {
  const p = useParamsStore((s) => s.beam);
  const u = useParamsStore((s) => s.updateBeam);
  return (
    <>
      <div className="section-title">几何</div>
      <NumField label="跨度 L (mm)" value={p.span} step={100} onChange={(v) => u({ span: v })} />
      <NumField label="梁宽 b (mm)" value={p.b} step={10} onChange={(v) => u({ b: v })} />
      <NumField label="梁高 h (mm)" value={p.h} step={10} onChange={(v) => u({ h: v })} />
      <NumField label="保护层 (mm)" value={p.cover} onChange={(v) => u({ cover: v })} />

      <div className="section-title">上部纵筋</div>
      <NumField
        label="根数"
        value={p.topBars.count}
        onChange={(v) => u({ topBars: { ...p.topBars, count: v } })}
      />
      <NumField
        label="直径 (mm)"
        value={p.topBars.d}
        onChange={(v) => u({ topBars: { ...p.topBars, d: v } })}
      />
      <Select
        label="级别"
        value={p.topBars.grade}
        options={GRADES}
        onChange={(v) => u({ topBars: { ...p.topBars, grade: v } })}
      />

      <div className="section-title">下部纵筋</div>
      <NumField
        label="根数"
        value={p.bottomBars.count}
        onChange={(v) => u({ bottomBars: { ...p.bottomBars, count: v } })}
      />
      <NumField
        label="直径 (mm)"
        value={p.bottomBars.d}
        onChange={(v) => u({ bottomBars: { ...p.bottomBars, d: v } })}
      />
      <Select
        label="级别"
        value={p.bottomBars.grade}
        options={GRADES}
        onChange={(v) => u({ bottomBars: { ...p.bottomBars, grade: v } })}
      />

      <div className="section-title">箍筋</div>
      <NumField
        label="直径 (mm)"
        value={p.stirrup.d}
        onChange={(v) => u({ stirrup: { ...p.stirrup, d: v } })}
      />
      <Select
        label="肢数"
        value={String(p.stirrup.legs) as '2' | '4'}
        options={['2', '4'] as const}
        onChange={(v) => u({ stirrup: { ...p.stirrup, legs: Number(v) as 2 | 4 } })}
      />
      <NumField
        label="加密区间距"
        value={p.stirrup.spDense}
        onChange={(v) => u({ stirrup: { ...p.stirrup, spDense: v } })}
      />
      <NumField
        label="非加密间距"
        value={p.stirrup.spNormal}
        onChange={(v) => u({ stirrup: { ...p.stirrup, spNormal: v } })}
      />
      <NumField
        label="加密区长度"
        value={p.stirrup.denseLen}
        onChange={(v) => u({ stirrup: { ...p.stirrup, denseLen: v } })}
      />

      <div className="section-title">腰筋</div>
      <NumField
        label="每侧根数"
        value={p.waist?.count ?? 0}
        onChange={(v) =>
          u({ waist: { count: v, d: p.waist?.d ?? 12, grade: p.waist?.grade ?? 'HRB400' } })
        }
      />
      <NumField
        label="直径 (mm)"
        value={p.waist?.d ?? 12}
        onChange={(v) =>
          u({ waist: { count: p.waist?.count ?? 0, d: v, grade: p.waist?.grade ?? 'HRB400' } })
        }
      />

      <div className="section-title">端部锚固</div>
      <Select
        label="左端"
        value={p.anchor.left}
        options={['straight', 'bend'] as const}
        onChange={(v) => u({ anchor: { ...p.anchor, left: v } })}
      />
      <Select
        label="右端"
        value={p.anchor.right}
        options={['straight', 'bend'] as const}
        onChange={(v) => u({ anchor: { ...p.anchor, right: v } })}
      />
    </>
  );
}

function ColumnFields() {
  const p = useParamsStore((s) => s.column);
  const u = useParamsStore((s) => s.updateColumn);
  return (
    <>
      <div className="section-title">几何</div>
      <NumField label="层高 H (mm)" value={p.height} step={100} onChange={(v) => u({ height: v })} />
      <NumField label="b (mm)" value={p.b} step={10} onChange={(v) => u({ b: v })} />
      <NumField label="h (mm)" value={p.h} step={10} onChange={(v) => u({ h: v })} />
      <NumField label="保护层 (mm)" value={p.cover} onChange={(v) => u({ cover: v })} />

      <div className="section-title">纵筋</div>
      <NumField
        label="每边根数"
        value={p.longBars.perSide}
        min={2}
        onChange={(v) => u({ longBars: { ...p.longBars, perSide: v } })}
      />
      <NumField
        label="直径 (mm)"
        value={p.longBars.d}
        onChange={(v) => u({ longBars: { ...p.longBars, d: v } })}
      />

      <div className="section-title">箍筋</div>
      <NumField
        label="直径 (mm)"
        value={p.stirrup.d}
        onChange={(v) => u({ stirrup: { ...p.stirrup, d: v } })}
      />
      <NumField
        label="加密区间距"
        value={p.stirrup.spDense}
        onChange={(v) => u({ stirrup: { ...p.stirrup, spDense: v } })}
      />
      <NumField
        label="非加密间距"
        value={p.stirrup.spNormal}
        onChange={(v) => u({ stirrup: { ...p.stirrup, spNormal: v } })}
      />
      <NumField
        label="底部加密区"
        value={p.stirrup.denseLenBottom}
        onChange={(v) => u({ stirrup: { ...p.stirrup, denseLenBottom: v } })}
      />
      <NumField
        label="顶部加密区"
        value={p.stirrup.denseLenTop}
        onChange={(v) => u({ stirrup: { ...p.stirrup, denseLenTop: v } })}
      />
      <Select
        label="复合箍"
        value={p.stirrup.composite}
        options={['simple', 'cross'] as const}
        onChange={(v) => u({ stirrup: { ...p.stirrup, composite: v } })}
      />
    </>
  );
}

function SlabFields() {
  const p = useParamsStore((s) => s.slab);
  const u = useParamsStore((s) => s.updateSlab);
  return (
    <>
      <div className="section-title">几何</div>
      <NumField label="Lx (mm)" value={p.lx} step={100} onChange={(v) => u({ lx: v })} />
      <NumField label="Ly (mm)" value={p.ly} step={100} onChange={(v) => u({ ly: v })} />
      <NumField label="厚度 (mm)" value={p.thickness} onChange={(v) => u({ thickness: v })} />
      <NumField label="保护层 (mm)" value={p.cover} onChange={(v) => u({ cover: v })} />

      <div className="section-title">底筋 X 向</div>
      <NumField label="直径" value={p.bottomX.d} onChange={(v) => u({ bottomX: { ...p.bottomX, d: v } })} />
      <NumField
        label="间距"
        value={p.bottomX.spacing}
        onChange={(v) => u({ bottomX: { ...p.bottomX, spacing: v } })}
      />

      <div className="section-title">底筋 Y 向</div>
      <NumField label="直径" value={p.bottomY.d} onChange={(v) => u({ bottomY: { ...p.bottomY, d: v } })} />
      <NumField
        label="间距"
        value={p.bottomY.spacing}
        onChange={(v) => u({ bottomY: { ...p.bottomY, spacing: v } })}
      />

      <div className="section-title">面筋 X 向</div>
      <NumField label="直径" value={p.topX.d} onChange={(v) => u({ topX: { ...p.topX, d: v } })} />
      <NumField label="间距" value={p.topX.spacing} onChange={(v) => u({ topX: { ...p.topX, spacing: v } })} />

      <div className="section-title">面筋 Y 向</div>
      <NumField label="直径" value={p.topY.d} onChange={(v) => u({ topY: { ...p.topY, d: v } })} />
      <NumField label="间距" value={p.topY.spacing} onChange={(v) => u({ topY: { ...p.topY, spacing: v } })} />
    </>
  );
}

function WallFields() {
  const p = useParamsStore((s) => s.wall);
  const u = useParamsStore((s) => s.updateWall);
  return (
    <>
      <div className="section-title">几何</div>
      <NumField label="长度 (mm)" value={p.length} step={100} onChange={(v) => u({ length: v })} />
      <NumField label="高度 (mm)" value={p.height} step={100} onChange={(v) => u({ height: v })} />
      <NumField label="厚度 (mm)" value={p.thickness} onChange={(v) => u({ thickness: v })} />
      <NumField label="保护层 (mm)" value={p.cover} onChange={(v) => u({ cover: v })} />

      <div className="section-title">竖向分布筋</div>
      <NumField label="直径" value={p.vertical.d} onChange={(v) => u({ vertical: { ...p.vertical, d: v } })} />
      <NumField
        label="间距"
        value={p.vertical.spacing}
        onChange={(v) => u({ vertical: { ...p.vertical, spacing: v } })}
      />

      <div className="section-title">水平分布筋</div>
      <NumField label="直径" value={p.horizontal.d} onChange={(v) => u({ horizontal: { ...p.horizontal, d: v } })} />
      <NumField
        label="间距"
        value={p.horizontal.spacing}
        onChange={(v) => u({ horizontal: { ...p.horizontal, spacing: v } })}
      />

      <div className="section-title">拉筋</div>
      <NumField label="直径" value={p.tie.d} onChange={(v) => u({ tie: { ...p.tie, d: v } })} />
      <NumField
        label="X 间距"
        value={p.tie.spacingX}
        onChange={(v) => u({ tie: { ...p.tie, spacingX: v } })}
      />
      <NumField
        label="Y 间距"
        value={p.tie.spacingY}
        onChange={(v) => u({ tie: { ...p.tie, spacingY: v } })}
      />
    </>
  );
}

function FoundationFields() {
  const p = useParamsStore((s) => s.foundation);
  const u = useParamsStore((s) => s.updateFoundation);
  return (
    <>
      <div className="section-title">几何</div>
      <NumField label="Lx (mm)" value={p.lx} step={100} onChange={(v) => u({ lx: v })} />
      <NumField label="Ly (mm)" value={p.ly} step={100} onChange={(v) => u({ ly: v })} />
      <NumField label="厚度 (mm)" value={p.thickness} onChange={(v) => u({ thickness: v })} />
      <NumField label="保护层 (mm)" value={p.cover} onChange={(v) => u({ cover: v })} />

      <div className="section-title">底筋 X 向</div>
      <NumField label="直径" value={p.bottomX.d} onChange={(v) => u({ bottomX: { ...p.bottomX, d: v } })} />
      <NumField
        label="间距"
        value={p.bottomX.spacing}
        onChange={(v) => u({ bottomX: { ...p.bottomX, spacing: v } })}
      />
      <div className="section-title">底筋 Y 向</div>
      <NumField label="直径" value={p.bottomY.d} onChange={(v) => u({ bottomY: { ...p.bottomY, d: v } })} />
      <NumField
        label="间距"
        value={p.bottomY.spacing}
        onChange={(v) => u({ bottomY: { ...p.bottomY, spacing: v } })}
      />
    </>
  );
}

export function ParamPanel() {
  const componentType = useParamsStore((s) => s.componentType);
  const setType = useParamsStore((s) => s.setComponentType);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-3 gap-1">
        {(Object.keys(TYPE_LABEL) as ComponentType[]).map((t) => (
          <button
            key={t}
            className={`btn ${componentType === t ? 'btn-primary' : ''}`}
            onClick={() => setType(t)}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {componentType === 'beam' && <BeamFields />}
        {componentType === 'column' && <ColumnFields />}
        {componentType === 'slab' && <SlabFields />}
        {componentType === 'wall' && <WallFields />}
        {componentType === 'foundation' && <FoundationFields />}
      </div>
    </div>
  );
}
