import { useParamsStore } from '../store/paramsStore';

export function ClippingControls() {
  const d = useParamsStore((s) => s.display);
  const u = useParamsStore((s) => s.updateDisplay);

  return (
    <div className="space-y-1">
      <div className="section-title">显示</div>
      <label className="field">
        <span className="text-slate-300">混凝土透明度</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={d.concreteOpacity}
          onChange={(e) => u({ concreteOpacity: Number(e.target.value) })}
          className="w-32"
        />
      </label>
      <label className="field">
        <span className="text-slate-300">显示钢筋</span>
        <input
          type="checkbox"
          checked={d.showRebar}
          onChange={(e) => u({ showRebar: e.target.checked })}
        />
      </label>

      <div className="section-title">剖切</div>
      <label className="field">
        <span className="text-slate-300">启用</span>
        <input
          type="checkbox"
          checked={d.clipEnabled}
          onChange={(e) => u({ clipEnabled: e.target.checked })}
        />
      </label>
      <label className="field">
        <span className="text-slate-300">轴</span>
        <select value={d.clipAxis} onChange={(e) => u({ clipAxis: e.target.value as 'x' | 'y' | 'z' })}>
          <option value="x">X</option>
          <option value="y">Y</option>
          <option value="z">Z</option>
        </select>
      </label>
      <label className="field">
        <span className="text-slate-300">位置</span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.02}
          value={d.clipPosition}
          onChange={(e) => u({ clipPosition: Number(e.target.value) })}
          className="w-32"
        />
      </label>
      <label className="field">
        <span className="text-slate-300">反向</span>
        <input
          type="checkbox"
          checked={d.clipFlip}
          onChange={(e) => u({ clipFlip: e.target.checked })}
        />
      </label>
    </div>
  );
}
