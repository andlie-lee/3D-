import { Download, FileImage, FileText, Box } from 'lucide-react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useParamsStore } from '../store/paramsStore';
import { generate } from '../rebar/generators';
import { buildTableRows } from './RebarTable';
import { ViewerHandle } from './Viewer3D';

interface Props {
  viewerRef: ViewerHandle;
}

function downloadBlob(data: Blob | string, filename: string) {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'application/json' }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({ viewerRef }: Props) {
  const params = useParamsStore((s) => s.current());

  const exportPNG = () => {
    const gl = viewerRef.current.gl;
    if (!gl) return;
    // The canvas already has preserveDrawingBuffer enabled.
    const url = gl.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebar3d_${params.type}_${Date.now()}.png`;
    a.click();
  };

  const exportGLTF = () => {
    const scene = viewerRef.current.scene;
    if (!scene) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        const json = JSON.stringify(result, null, 2);
        downloadBlob(json, `rebar3d_${params.type}.gltf`);
      },
      (err) => console.error('GLTF export error', err),
      { binary: false },
    );
  };

  const exportPDF = () => {
    const model = generate(params);
    const rows = buildTableRows(model);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text(`Rebar 3D Visualization - ${params.type.toUpperCase()}`, 40, 40);

    // Embed canvas snapshot
    const gl = viewerRef.current.gl;
    if (gl) {
      const dataURL = gl.domElement.toDataURL('image/png');
      doc.addImage(dataURL, 'PNG', 40, 60, 515, 280);
    }

    autoTable(doc, {
      startY: 360,
      head: [['Label', 'Grade', 'Dia', 'Count', 'Unit (mm)', 'Total (m)', 'Weight (kg)']],
      body: rows.map((r) => [
        r.label,
        r.grade,
        `Φ${r.diameter}`,
        r.count,
        r.unitLengthMm,
        r.totalLengthM,
        r.weightKg,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`rebar3d_${params.type}.pdf`);
  };

  void THREE;

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn" onClick={exportPNG}>
        <FileImage size={14} /> PNG
      </button>
      <button className="btn" onClick={exportGLTF}>
        <Box size={14} /> GLTF
      </button>
      <button className="btn btn-primary" onClick={exportPDF}>
        <FileText size={14} /> PDF
      </button>
      <span className="hidden">
        <Download size={12} />
      </span>
    </div>
  );
}
