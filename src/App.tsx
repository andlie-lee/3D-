import { useRef } from 'react';
import { Viewer3D, ViewerHandle } from './components/Viewer3D';
import { ParamPanel } from './components/ParamPanel';
import { ClippingControls } from './components/ClippingControls';
import { RebarTable } from './components/RebarTable';
import { ExportMenu } from './components/ExportMenu';
import { HUD } from './components/HUD';
import { Boxes } from 'lucide-react';

export default function App() {
  const viewerRef = useRef({}) as ViewerHandle;

  return (
    <div className="w-full h-full flex">
      {/* Left panel: parameters */}
      <aside className="panel w-72 p-3 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-2">
          <Boxes size={16} className="text-sky-400" />
          3D 钢筋平法可视化
        </div>
        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
          教学/展示级。规则参考 22G101-1 简化，非审图用途。
        </p>
        <ParamPanel />
      </aside>

      {/* Center: 3D viewer */}
      <main className="flex-1 relative">
        <Viewer3D viewerRef={viewerRef} />
        <HUD />
      </main>

      {/* Right panel: display + table + export */}
      <aside className="panel w-80 p-3 overflow-y-auto shrink-0">
        <ClippingControls />
        <div className="my-3 h-px bg-slate-700" />
        <ExportMenu viewerRef={viewerRef} />
        <div className="my-3 h-px bg-slate-700" />
        <RebarTable />
        <div className="mt-4 text-[11px] text-slate-500 leading-relaxed">
          <div className="font-semibold text-slate-400 mb-1">图例</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#ff5a3c' }} />纵筋</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#3aa3ff' }} />箍筋</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#9aa0a6' }} />分布筋</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#06d6a0' }} />腰筋</span>
            <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#a78bfa' }} />拉筋</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
