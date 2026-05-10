# 3D 钢筋平法可视化 (Rebar3D)

参数驱动的纯前端 3D 钢筋可视化网页，支持梁(KL)、柱(KZ)、板(LB)、剪力墙(Q)、基础(JC)五类构件。教学/展示级精度，钢筋按平法规则自动排布；混凝土支持半透明 + 任意方向剖切；支持 PNG / GLTF / PDF 导出。

## 技术栈

- **Vite + React 18 + TypeScript**
- **three.js + @react-three/fiber + @react-three/drei**
- **Zustand** 参数状态
- **Tailwind CSS** UI
- **jsPDF + jspdf-autotable** PDF 导出

## 渲染策略

- 钢筋：`CatmullRomCurve3` + `TubeGeometry`，同形钢筋使用 `InstancedMesh` 批量渲染
- 混凝土：`BoxGeometry` + `MeshPhysicalMaterial`，启用 `localClippingEnabled` + `clippingPlanes`
- 单位：几何按 mm 构建，渲染时 `group scale = 0.001` 转米

## 安装与运行

```bash
npm install
npm run dev
```

打开 http://localhost:5173

## 构建

```bash
npm run build
npm run preview
```

## 平法说明

参考 22G101-1 简化实现：
- 默认保护层：梁/柱 25mm，板 15mm，墙 20mm，基础 40mm
- 箍筋：135° 弯钩，平直段 max(10d, 75mm)
- 梁端部弯锚：15d
- 锚固长度 laE 简化常数表（HRB400 = 40d）

> 该工具为教学与方案展示用途，不可替代施工图算量。
