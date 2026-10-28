import { useState, useMemo, useRef, useEffect } from "react";
import {
  Globe,
  MapPin,
  Flame,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Server,
  Clock,
  Layers,
  Move,
} from "lucide-react";
import {
  OVERSEAS_BRANCHES,
  matchesBranchFilter,
} from "../data/overseasBranches";

// Project lat/lng to SVG (1000 x 500 equirectangular world space)
const projectLatLng = (lat, lng) => {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
};

// Detailed World Landmass Polygons (lat/lng pairs converted to SVG points)
const WORLD_LAND_POLYGONS = [
  // North America
  {
    name: "North America",
    coords: [
      [70, -165], [71, -156], [70, -140], [69, -125], [65, -110], [60, -95],
      [62, -78], [58, -64], [52, -55], [47, -53], [45, -61], [43, -66],
      [41, -70], [40.5, -74], [38, -75], [35, -75.5], [31, -81], [25, -80],
      [25, -82], [29, -85], [29, -90], [27, -97], [22, -98], [19, -96],
      [18, -92], [21, -87], [16, -86], [10, -83], [8, -78], [9, -84],
      [14, -92], [16, -98], [20, -105], [23, -106], [30, -114], [23, -110],
      [32, -117], [37, -122], [48, -124], [55, -132], [60, -142], [61, -151],
      [55, -162], [60, -166], [65, -168],
    ],
  },
  // Greenland
  {
    name: "Greenland",
    coords: [
      [60, -44], [65, -38], [70, -22], [78, -18], [82, -32], [81, -55],
      [76, -68], [68, -53],
    ],
  },
  // South America
  {
    name: "South America",
    coords: [
      [11, -75], [10, -62], [6, -52], [1, -50], [-2, -42], [-6, -35],
      [-13, -38], [-23, -42], [-33, -52], [-38, -58], [-47, -66], [-54, -68],
      [-53, -74], [-42, -74], [-30, -71], [-18, -71], [-12, -77], [-5, -81],
      [1, -79], [7, -77],
    ],
  },
  // Continental Europe
  {
    name: "Europe",
    coords: [
      [36, -9], [43, -9], [43, -2], [47, -2], [49, -4], [50, 2], [53, 5],
      [54, 8], [57, 8], [55, 11], [54, 14], [55, 20], [60, 22], [60, 30],
      [66, 25], [64, 20], [59, 18], [56, 13], [59, 11], [58, 7], [62, 5],
      [69, 16], [71, 28], [69, 40], [66, 42], [60, 50], [45, 40], [45, 29],
      [41, 29], [38, 24], [37, 22], [40, 19], [42, 16], [38, 16], [38, 13],
      [41, 14], [44, 12], [43, 8], [43, 3], [39, 0], [36, -5],
    ],
  },
  // Great Britain (UK)
  {
    name: "Great Britain",
    coords: [
      [50.1, -5.2], [50.7, -1.8], [51.1, 1.3], [51.5, 0.7], [52.7, 1.7],
      [53.6, 0.1], [55.0, -1.5], [56.0, -2.5], [57.5, -1.8], [58.6, -3.1],
      [58.5, -5.0], [56.5, -5.6], [55.0, -4.9], [53.4, -3.1], [53.2, -4.5],
      [51.7, -5.1], [51.4, -3.2],
    ],
  },
  // Ireland
  {
    name: "Ireland",
    coords: [
      [51.5, -9.8], [52.2, -6.4], [54.6, -5.5], [55.3, -7.4], [53.5, -10.1],
    ],
  },
  // Africa
  {
    name: "Africa",
    coords: [
      [35, -6], [37, 10], [32, 15], [31, 32], [22, 37], [12, 44], [11, 51],
      [2, 45], [-4, 40], [-15, 40], [-25, 35], [-34, 25], [-34, 18],
      [-22, 14], [-12, 13], [-5, 12], [4, 9], [5, -4], [6, -11], [15, -17],
      [25, -15], [30, -10],
    ],
  },
  // Madagascar
  {
    name: "Madagascar",
    coords: [
      [-12, 49], [-18, 49.5], [-25, 47], [-25, 44], [-16, 44.5],
    ],
  },
  // Asia (Mainland including Middle East, India, China, Indochina, Malaya, Siberia)
  {
    name: "Asia",
    coords: [
      [41, 29], [36, 36], [31, 35], [28, 35], [13, 44], [15, 52], [22, 59],
      [26, 56], [29, 49], [25, 62], [23, 68], [16, 73], [8, 77], [15, 80],
      [21, 87], [22, 91], [16, 94], [14, 98], [8, 98], [1.4, 103.6],
      [1.35, 104.1], [4, 103.5], [7, 100.5], [13, 100.5], [12, 102.5],
      [9, 105], [12, 109], [18, 106], [21, 108], [21.5, 110], [22.2, 113.9],
      [22.6, 114.5], [24.5, 118], [28, 121.5], [31, 121.8], [34, 120],
      [36, 120.5], [37.5, 122], [38, 119], [40, 120], [40, 124], [43, 132],
      [48, 140], [54, 141], [60, 150], [52, 157], [60, 163], [66, 170],
      [68, 180], [72, 140], [75, 105], [70, 70], [66, 42], [45, 40],
    ],
  },
  // Korean Peninsula (South Korea & North Korea)
  {
    name: "Korean Peninsula",
    coords: [
      [40.0, 124.3], [38.9, 125.2], [37.9, 126.1], [37.45, 126.6],
      [36.8, 126.2], [35.5, 126.4], [34.4, 126.2], [34.6, 127.7],
      [35.1, 129.0], [36.0, 129.5], [37.5, 129.2], [38.6, 128.4],
      [40.2, 128.5], [42.0, 130.2], [41.5, 126.5],
    ],
  },
  // Japan - Hokkaido
  {
    name: "Hokkaido",
    coords: [
      [41.5, 140.2], [42.3, 141.0], [43.3, 145.6], [44.3, 145.2],
      [45.5, 141.9], [43.2, 140.4],
    ],
  },
  // Japan - Honshu
  {
    name: "Honshu",
    coords: [
      [41.2, 140.8], [39.6, 142.0], [38.3, 141.5], [36.4, 140.6],
      [35.7, 140.8], [35.0, 139.8], [35.6, 139.7], [34.6, 138.8],
      [34.7, 137.0], [33.5, 135.8], [34.6, 135.5], [34.4, 134.0],
      [34.0, 131.0], [34.5, 131.4], [35.5, 133.5], [35.7, 135.2],
      [37.4, 137.2], [36.8, 137.8], [38.0, 139.2], [40.2, 139.9],
    ],
  },
  // Japan - Shikoku & Kyushu
  {
    name: "Shikoku & Kyushu",
    coords: [
      [34.2, 134.6], [33.3, 134.2], [32.8, 132.5], [33.9, 132.2],
      [33.8, 130.9], [31.2, 131.0], [31.3, 130.2], [32.8, 129.8],
      [33.9, 130.8],
    ],
  },
  // Taiwan & Hainan
  {
    name: "Taiwan",
    coords: [
      [25.3, 121.5], [23.5, 121.5], [22.0, 120.8], [23.0, 120.1], [24.8, 120.9],
    ],
  },
  // Sumatra
  {
    name: "Sumatra",
    coords: [
      [5.6, 95.3], [3.6, 98.8], [1.0, 102.5], [-2.5, 105.5], [-5.9, 105.8],
      [-5.5, 104.2], [-1.0, 100.3], [2.5, 97.5],
    ],
  },
  // Java
  {
    name: "Java",
    coords: [
      [-6.0, 106.0], [-6.8, 110.5], [-7.5, 114.4], [-8.7, 114.5],
      [-8.0, 110.0], [-6.8, 105.5],
    ],
  },
  // Kalimantan (Borneo)
  {
    name: "Borneo",
    coords: [
      [7.0, 116.8], [4.2, 117.8], [1.0, 118.8], [-3.5, 116.2], [-3.0, 111.5],
      [1.0, 109.0], [3.0, 113.0],
    ],
  },
  // Sulawesi
  {
    name: "Sulawesi",
    coords: [
      [1.5, 125.0], [0.5, 120.0], [-5.5, 119.5], [-4.5, 122.5], [-1.0, 121.5],
    ],
  },
  // Philippines
  {
    name: "Philippines",
    coords: [
      [18.5, 121.0], [16.0, 122.0], [13.0, 124.0], [7.0, 126.5], [6.0, 124.0],
      [10.0, 122.0], [14.5, 120.5],
    ],
  },
  // Australia
  {
    name: "Australia",
    coords: [
      [-12, 131], [-12, 136], [-16, 138], [-11, 142], [-19, 147], [-28, 153],
      [-37, 150], [-39, 146], [-35, 136], [-32, 132], [-34, 115], [-22, 114],
      [-15, 124],
    ],
  },
  // New Zealand
  {
    name: "New Zealand",
    coords: [
      [-35, 173], [-38, 178], [-42, 174], [-46, 167], [-41, 172],
    ],
  },
];

// Zoom ViewBox presets in the 1000x500 SVG coordinate space
const VIEWBOX_PRESETS = {
  All: { x: 80, y: 45, w: 840, h: 360, label: "Global World View (Semua Cabang)" },
  Singapura: {
    x: 750,
    y: 222,
    w: 76,
    h: 44,
    label: "Zoom: Singapura & Selat Malaka",
  },
  "Hong Kong": {
    x: 778,
    y: 164,
    w: 76,
    h: 44,
    label: "Zoom: Hong Kong & Pearl River Delta",
  },
  "Tokyo dan Osaka - Jepang": {
    x: 835,
    y: 122,
    w: 92,
    h: 54,
    label: "Zoom: Jepang (Tokyo & Osaka)",
  },
  "Tokyo - Jepang": {
    x: 852,
    y: 130,
    w: 68,
    h: 40,
    label: "Zoom: Greater Tokyo - Jepang",
  },
  "Osaka - Jepang": {
    x: 840,
    y: 133,
    w: 68,
    h: 40,
    label: "Zoom: Kansai / Osaka - Jepang",
  },
  "New York - Amerika Serikat": {
    x: 245,
    y: 112,
    w: 96,
    h: 52,
    label: "Zoom: New York - Amerika Serikat",
  },
  "Seoul - Korea Selatan": {
    x: 816,
    y: 124,
    w: 72,
    h: 42,
    label: "Zoom: Seoul - Korea Selatan",
  },
  "London - Inggris": {
    x: 462,
    y: 85,
    w: 76,
    h: 44,
    label: "Zoom: London - Inggris (UK)",
  },
};

// Sub-node offsets (in degrees lat/lng) for schema/job clusters when zoomed into a single branch
const SUB_NODE_OFFSETS = [
  { dLat: 0.9, dLng: -1.3 },
  { dLat: -0.8, dLng: 1.4 },
  { dLat: 1.1, dLng: 1.2 },
  { dLat: -1.0, dLng: -1.1 },
  { dLat: 0.2, dLng: 2.0 },
  { dLat: -0.3, dLng: -2.0 },
];

// Determine thermal color based on heat intensity (0 to 1)
const getHeatColor = (intensity, failedCount, totalCount) => {
  if (totalCount === 0) {
    return {
      core: "#9ca3af",
      mid: "#d1d5db",
      outer: "rgba(156, 163, 175, 0.15)",
      badgeBg: "bg-gray-100 text-gray-600 border-gray-300",
      level: "No Activity",
      hex: "#9ca3af",
    };
  }
  if (failedCount === 0) {
    return {
      core: "#22c55e",
      mid: "#87d068",
      outer: "rgba(135, 208, 104, 0.2)",
      badgeBg: "bg-[#87d068]/15 text-[#5b9a3d] border-[#87d068]/40",
      level: "Healthy (Low Heat)",
      hex: "#87d068",
    };
  }
  if (intensity >= 0.45 || failedCount >= 4) {
    return {
      core: "#dc2626",
      mid: "#f97316",
      outer: "rgba(224, 67, 85, 0.28)",
      badgeBg: "bg-[#e04355]/15 text-[#e04355] border-[#e04355]/40",
      level: "Critical Hotspot",
      hex: "#e04355",
    };
  }
  return {
    core: "#f59e0b",
    mid: "#facc15",
    outer: "rgba(250, 173, 20, 0.25)",
    badgeBg: "bg-[#faad14]/15 text-[#d48806] border-[#faad14]/40",
    level: "Elevated Warning",
    hex: "#faad14",
  };
};

export default function OverseasHeatmap({
  overseasData,
  selectedBranch,
  onSelectBranch,
}) {
  const [heatMetric, setHeatMetric] = useState("failed"); // "failed" | "total" | "rate"
  const [hoveredBranchId, setHoveredBranchId] = useState(null);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef(null);
  const dragStartRef = useRef({
    clientX: 0,
    clientY: 0,
    startPanX: 0,
    startPanY: 0,
    moved: false,
  });

  const [prevBranch, setPrevBranch] = useState(selectedBranch);
  if (prevBranch !== selectedBranch) {
    setPrevBranch(selectedBranch);
    setPanOffset({ x: 0, y: 0 });
    setZoomMultiplier(1);
  }

  // Attach non-passive wheel listener to allow smooth mouse wheel zoom without scrolling the page
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoomMultiplier((prev) =>
        Math.max(0.7, Math.min(4.5, Number((prev + delta).toFixed(2)))),
      );
    };

    svgEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      svgEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Aggregate statistics per branch from overseasData (filtered by date, status, job search, but BEFORE branch filter so we can also compute each branch's stats)
  const branchStats = useMemo(() => {
    const statsMap = {};
    OVERSEAS_BRANCHES.forEach((b) => {
      statsMap[b.id] = {
        ...b,
        total: 0,
        success: 0,
        failed: 0,
        unknown: 0,
        totalRows: 0,
        schemas: {},
        jobs: [],
      };
    });

    overseasData.forEach((row) => {
      const bId = row.BRANCH;
      if (!statsMap[bId]) return;
      statsMap[bId].total += 1;
      if (row.STATUS === "Success") statsMap[bId].success += 1;
      else if (row.STATUS === "Failed") statsMap[bId].failed += 1;
      else statsMap[bId].unknown += 1;

      if (row.TOTAL_ROW_COUNT) {
        statsMap[bId].totalRows += row.TOTAL_ROW_COUNT;
      }

      if (!statsMap[bId].schemas[row.SCHEMA_NAME]) {
        statsMap[bId].schemas[row.SCHEMA_NAME] = {
          schema: row.SCHEMA_NAME,
          total: 0,
          failed: 0,
          success: 0,
        };
      }
      statsMap[bId].schemas[row.SCHEMA_NAME].total += 1;
      if (row.STATUS === "Failed") {
        statsMap[bId].schemas[row.SCHEMA_NAME].failed += 1;
      } else if (row.STATUS === "Success") {
        statsMap[bId].schemas[row.SCHEMA_NAME].success += 1;
      }

      statsMap[bId].jobs.push(row);
    });

    const maxFailed = Math.max(
      1,
      ...Object.values(statsMap).map((s) => s.failed),
    );
    const maxTotal = Math.max(
      1,
      ...Object.values(statsMap).map((s) => s.total),
    );

    return OVERSEAS_BRANCHES.map((b) => {
      const st = statsMap[b.id];
      const errorRate = st.total > 0 ? (st.failed / st.total) * 100 : 0;
      const successRate = st.total > 0 ? (st.success / st.total) * 100 : 0;

      const intensity =
        heatMetric === "failed"
          ? st.failed / maxFailed
          : heatMetric === "total"
            ? st.total / maxTotal
            : errorRate / 100;

      const heatStyle = getHeatColor(errorRate / 100, st.failed, st.total);
      const pos = projectLatLng(b.lat, b.lng);

      return {
        ...st,
        errorRate: Number(errorRate.toFixed(1)),
        successRate: Number(successRate.toFixed(1)),
        intensity: Math.max(0.18, Math.min(1, intensity)),
        heatStyle,
        x: pos.x,
        y: pos.y,
        schemaList: Object.values(st.schemas).sort(
          (a, b) => b.failed - a.failed || b.total - a.total,
        ),
      };
    });
  }, [overseasData, heatMetric]);

  // Filter branches to display on the map when a specific branch is selected!
  // ("ketika milih misalnya seoul, maka mapnya auto filter dan menampilkan yg seoul saja")
  const visibleBranchesOnMap = useMemo(() => {
    return branchStats.filter((b) => matchesBranchFilter(b.id, selectedBranch));
  }, [branchStats, selectedBranch]);

  // Compute active viewBox based on selectedBranch, zoomMultiplier, and mouse panOffset
  const currentViewBox = useMemo(() => {
    const base = VIEWBOX_PRESETS[selectedBranch] || VIEWBOX_PRESETS.All;
    const cx = base.x + base.w / 2;
    const cy = base.y + base.h / 2;
    const nw = base.w / zoomMultiplier;
    const nh = base.h / zoomMultiplier;
    const rawX = cx - nw / 2 + panOffset.x;
    const rawY = cy - nh / 2 + panOffset.y;
    const clampedX = Math.max(-80, Math.min(1080 - nw, rawX));
    const clampedY = Math.max(-40, Math.min(540 - nh, rawY));
    return {
      ...base,
      x: clampedX,
      y: clampedY,
      w: nw,
      h: nh,
    };
  }, [selectedBranch, zoomMultiplier, panOffset]);

  // Mouse Drag Panning Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y,
      moved: false,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dxPixels = e.clientX - dragStartRef.current.clientX;
    const dyPixels = e.clientY - dragStartRef.current.clientY;
    if (Math.abs(dxPixels) > 3 || Math.abs(dyPixels) > 3) {
      dragStartRef.current.moved = true;
    }
    const scaleX = currentViewBox.w / Math.max(1, rect.width);
    const scaleY = currentViewBox.h / Math.max(1, rect.height);
    setPanOffset({
      x: dragStartRef.current.startPanX - dxPixels * scaleX,
      y: dragStartRef.current.startPanY - dyPixels * scaleY,
    });
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const isMapMoved =
    zoomMultiplier !== 1 ||
    Math.abs(panOffset.x) > 0.5 ||
    Math.abs(panOffset.y) > 0.5;

  // Scale factor so markers & heat clouds look proportional when zoomed into a single city
  const isZoomedToBranch = selectedBranch !== "All";
  const markerScale = isZoomedToBranch ? 0.16 : 1;

  // Currently focused branch details (when single branch or Japan group is selected)
  const focusedSummary = useMemo(() => {
    if (selectedBranch === "All") return null;
    const matching = visibleBranchesOnMap;
    const total = matching.reduce((s, b) => s + b.total, 0);
    const success = matching.reduce((s, b) => s + b.success, 0);
    const failed = matching.reduce((s, b) => s + b.failed, 0);
    const errorRate = total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;
    const successRate =
      total > 0 ? Number(((success / total) * 100).toFixed(1)) : 0;

    // Combine schemas
    const schemaMap = {};
    matching.forEach((b) => {
      b.schemaList.forEach((sc) => {
        if (!schemaMap[sc.schema]) {
          schemaMap[sc.schema] = {
            schema: sc.schema,
            total: 0,
            failed: 0,
            success: 0,
          };
        }
        schemaMap[sc.schema].total += sc.total;
        schemaMap[sc.schema].failed += sc.failed;
        schemaMap[sc.schema].success += sc.success;
      });
    });

    return {
      title: selectedBranch,
      branches: matching,
      total,
      success,
      failed,
      errorRate,
      successRate,
      heatStyle: getHeatColor(errorRate / 100, failed, total),
      schemas: Object.values(schemaMap).sort(
        (a, b) => b.failed - a.failed || b.total - a.total,
      ),
    };
  }, [selectedBranch, visibleBranchesOnMap]);

  const handleBranchClick = (branchId) => {
    if (dragStartRef.current.moved) return;
    setZoomMultiplier(1);
    setPanOffset({ x: 0, y: 0 });
    if (selectedBranch === branchId) {
      onSelectBranch("All");
    } else {
      onSelectBranch(branchId);
    }
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER & QUICK BRANCH FILTER PILLS */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/30">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#e04355]/10 text-[#e04355]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">
                  Overseas Branch Heatmap (Cabang Luar Negeri)
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#20a7c9]/10 text-[#20a7c9] border border-[#20a7c9]/20">
                  {selectedBranch === "All"
                    ? "Semua Cabang (7 Lokasi)"
                    : `Auto-Filtered: ${selectedBranch}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Klik titik cabang pada peta atau pilih cabang di bawah untuk
                auto-filter peta heatmap beserta seluruh metrik &amp; tabel
                detail.
              </p>
            </div>
          </div>

          {/* HEATMAP METRIC SWITCHER */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded border border-gray-200 text-xs">
            <span className="text-gray-500 px-2 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Mode Heatmap:
            </span>
            {[
              { id: "failed", label: "Intensitas Error" },
              { id: "rate", label: "Error Rate (%)" },
              { id: "total", label: "Volume Eksekusi" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setHeatMetric(mode.id)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  heatMetric === mode.id
                    ? "bg-white text-[#20a7c9] shadow-xs border border-gray-200/80"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* BRANCH QUICK SELECTOR PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#20a7c9]" />
            Pilih Cabang:
          </span>

          <button
            type="button"
            onClick={() => {
              setZoomMultiplier(1);
              onSelectBranch("All");
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all border ${
              selectedBranch === "All"
                ? "bg-[#20a7c9] text-white border-[#20a7c9] shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#20a7c9] hover:text-[#20a7c9]"
            }`}
          >
            Semua Cabang (7)
          </button>

          <button
            type="button"
            onClick={() => {
              setZoomMultiplier(1);
              onSelectBranch(
                selectedBranch === "Tokyo dan Osaka - Jepang"
                  ? "All"
                  : "Tokyo dan Osaka - Jepang",
              );
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all border ${
              selectedBranch === "Tokyo dan Osaka - Jepang"
                ? "bg-[#20a7c9] text-white border-[#20a7c9] shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#20a7c9] hover:text-[#20a7c9]"
            }`}
          >
            🇯🇵 Tokyo &amp; Osaka - Jepang
          </button>

          {branchStats.map((branch) => {
            const isSelected = selectedBranch === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => handleBranchClick(branch.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all border ${
                  isSelected
                    ? "bg-[#20a7c9] text-white border-[#20a7c9] shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#20a7c9] hover:text-[#20a7c9]"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: isSelected
                      ? "#ffffff"
                      : branch.heatStyle.hex,
                  }}
                />
                <span>{branch.name}</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : branch.failed > 0
                        ? "bg-[#e04355]/10 text-[#e04355]"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {branch.failed} err
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN BODY: INTERACTIVE MAP (LEFT) + BRANCH DETAILS PANEL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* GEOGRAPHIC HEATMAP CANVAS / SVG */}
        <div className="lg:col-span-8 relative bg-[#0f172a] overflow-hidden min-h-[420px] flex flex-col justify-between select-none">
          {/* Top Map Overlay Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-xs border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded text-xs flex items-center gap-2 pointer-events-auto shadow-md">
              <Globe className="w-3.5 h-3.5 text-[#20a7c9]" />
              <span className="font-medium">{currentViewBox.label}</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                <Move className="w-3 h-3 text-[#20a7c9]" />
                Drag / Scroll Mouse
              </span>
              {selectedBranch !== "All" && (
                <span className="text-[11px] text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  Menampilkan {visibleBranchesOnMap.map((b) => b.shortName).join(" & ")} saja
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {isMapMoved && (
                <button
                  type="button"
                  onClick={() => {
                    setZoomMultiplier(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600 px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                  title="Reset Posisi & Zoom Peta"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset View
                </button>
              )}
              {selectedBranch !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setZoomMultiplier(1);
                    setPanOffset({ x: 0, y: 0 });
                    onSelectBranch("All");
                  }}
                  className="bg-[#20a7c9] hover:bg-[#1b8eab] text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Tampilkan Semua Cabang
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setZoomMultiplier((z) => Math.min(4.5, Number((z + 0.35).toFixed(2))))
                }
                className="p-1.5 rounded bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-md cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setZoomMultiplier((z) => Math.max(0.7, Number((z - 0.35).toFixed(2))))
                }
                className="p-1.5 rounded bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-md cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive SVG Map (Supports Mouse Drag Panning & Wheel Zooming) */}
          <svg
            ref={svgRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            viewBox={`${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.w} ${currentViewBox.h}`}
            className={`w-full h-[430px] block ${
              isDragging
                ? "cursor-grabbing"
                : "cursor-grab transition-all duration-300 ease-out"
            }`}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Ocean background gradient */}
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b1325" />
                <stop offset="50%" stopColor="#0f1b33" />
                <stop offset="100%" stopColor="#0b1325" />
              </linearGradient>

              {/* Gaussian blur filter for genuine thermal heatmap look */}
              <filter id="heatBlurWorld" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation={isZoomedToBranch ? "1.6" : "8"} />
              </filter>

              <filter id="heatBlurSubNode" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.1" />
              </filter>

              {/* Thermal Radial Gradients per Heat Level */}
              <radialGradient id="thermalCritical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#f97316" stopOpacity="0.75" />
                <stop offset="68%" stopColor="#facc15" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="thermalWarning" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="42%" stopColor="#facc15" stopOpacity="0.65" />
                <stop offset="75%" stopColor="#87d068" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#20a7c9" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="thermalHealthy" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#87d068" stopOpacity="0.9" />
                <stop offset="48%" stopColor="#20a7c9" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#20a7c9" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ocean Base */}
            <rect x="0" y="0" width="1000" height="500" fill="url(#oceanGrad)" />

            {/* Latitude / Longitude Graticule Grid */}
            <g stroke="#1e293b" strokeWidth={isZoomedToBranch ? "0.18" : "0.6"} opacity="0.75">
              {Array.from({ length: 19 }, (_, i) => i * 50).map((x) => (
                <line key={`lon-${x}`} x1={x} y1={0} x2={x} y2={500} />
              ))}
              {Array.from({ length: 11 }, (_, i) => i * 50).map((y) => (
                <line key={`lat-${y}`} x1={0} y1={y} x2={1000} y2={y} />
              ))}
              {/* Finer regional grid when zoomed in */}
              {isZoomedToBranch &&
                Array.from({ length: 100 }, (_, i) => i * 10).map((x) => (
                  <line
                    key={`fine-lon-${x}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={500}
                    stroke="#1e293b"
                    strokeWidth="0.08"
                    strokeDasharray="0.8 0.8"
                  />
                ))}
              {isZoomedToBranch &&
                Array.from({ length: 50 }, (_, i) => i * 10).map((y) => (
                  <line
                    key={`fine-lat-${y}`}
                    x1={0}
                    y1={y}
                    x2={1000}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="0.08"
                    strokeDasharray="0.8 0.8"
                  />
                ))}
            </g>

            {/* Equator & Tropics */}
            <line
              x1="0"
              y1="250"
              x2="1000"
              y2="250"
              stroke="#334155"
              strokeWidth={isZoomedToBranch ? "0.2" : "0.8"}
              strokeDasharray="4 4"
            />

            {/* World Continents & Country Polygons */}
            <g>
              {WORLD_LAND_POLYGONS.map((poly) => {
                const pointsStr = poly.coords
                  .map(([lat, lng]) => {
                    const { x, y } = projectLatLng(lat, lng);
                    return `${x.toFixed(2)},${y.toFixed(2)}`;
                  })
                  .join(" ");
                return (
                  <polygon
                    key={poly.name}
                    points={pointsStr}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth={isZoomedToBranch ? "0.22" : "0.8"}
                    strokeLinejoin="round"
                  />
                );
              })}
            </g>

            {/* Network Arcs from Indonesia (Jakarta Hub: -6.2, 106.8) to Visible Overseas Branches */}
            {(() => {
              const jkt = projectLatLng(-6.2088, 106.8456);
              return (
                <g>
                  {visibleBranchesOnMap.map((branch) => {
                    const midX = (jkt.x + branch.x) / 2;
                    const midY = Math.min(jkt.y, branch.y) - 22;
                    return (
                      <path
                        key={`arc-${branch.id}`}
                        d={`M ${jkt.x} ${jkt.y} Q ${midX} ${midY} ${branch.x} ${branch.y}`}
                        fill="none"
                        stroke={branch.heatStyle.hex}
                        strokeWidth={isZoomedToBranch ? "0.25" : "1.1"}
                        strokeDasharray={isZoomedToBranch ? "0.8 0.8" : "4 4"}
                        opacity="0.45"
                      />
                    );
                  })}
                  {/* Show Jakarta Hub Reference only in World View */}
                  {!isZoomedToBranch && (
                    <g transform={`translate(${jkt.x}, ${jkt.y})`}>
                      <circle r="3.2" fill="#20a7c9" opacity="0.9" />
                      <circle
                        r="6.5"
                        fill="none"
                        stroke="#20a7c9"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                      <text
                        y="11"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="7.5"
                        fontWeight="500"
                      >
                        HQ Jakarta
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}

            {/* LAYER 1: THERMAL HEATMAP CLOUDS (Only for visibleBranchesOnMap!) */}
            <g>
              {visibleBranchesOnMap.map((branch) => {
                const gradId =
                  branch.failed >= 4 || branch.errorRate >= 45
                    ? "url(#thermalCritical)"
                    : branch.failed > 0
                      ? "url(#thermalWarning)"
                      : "url(#thermalHealthy)";

                // Outer & inner thermal radius scaled by intensity
                const baseRadius = isZoomedToBranch
                  ? 7.5 + branch.intensity * 6.5
                  : 26 + branch.intensity * 28;

                return (
                  <g key={`heat-${branch.id}`}>
                    {/* Main Branch Thermal Cloud */}
                    <circle
                      cx={branch.x}
                      cy={branch.y}
                      r={baseRadius}
                      fill={gradId}
                      filter="url(#heatBlurWorld)"
                    />
                    <circle
                      cx={branch.x}
                      cy={branch.y}
                      r={baseRadius * 0.6}
                      fill={gradId}
                    />

                    {/* When zoomed into a branch, also render Schema / Pipeline sub-heatmap clouds around the city! */}
                    {isZoomedToBranch &&
                      branch.schemaList.map((sc, idx) => {
                        const offset =
                          SUB_NODE_OFFSETS[idx % SUB_NODE_OFFSETS.length];
                        const subPos = projectLatLng(
                          branch.lat + offset.dLat,
                          branch.lng + offset.dLng,
                        );
                        const subGrad =
                          sc.failed >= 2
                            ? "url(#thermalCritical)"
                            : sc.failed > 0
                              ? "url(#thermalWarning)"
                              : "url(#thermalHealthy)";
                        const subRadius =
                          3.2 + Math.min(4.5, sc.total * 0.8 + sc.failed * 1.1);

                        return (
                          <g key={`subheat-${branch.id}-${sc.schema}`}>
                            <line
                              x1={branch.x}
                              y1={branch.y}
                              x2={subPos.x}
                              y2={subPos.y}
                              stroke="#475569"
                              strokeWidth="0.18"
                              strokeDasharray="0.4 0.4"
                            />
                            <circle
                              cx={subPos.x}
                              cy={subPos.y}
                              r={subRadius}
                              fill={subGrad}
                              filter="url(#heatBlurSubNode)"
                            />
                            <circle
                              cx={subPos.x}
                              cy={subPos.y}
                              r="0.55"
                              fill={sc.failed > 0 ? "#ef4444" : "#87d068"}
                              stroke="#0f172a"
                              strokeWidth="0.15"
                            />
                            <text
                              x={subPos.x}
                              y={subPos.y - 0.9}
                              textAnchor="middle"
                              fill="#e2e8f0"
                              fontSize="1.15"
                              fontWeight="600"
                            >
                              Schema {sc.schema} ({sc.failed}/{sc.total} err)
                            </text>
                          </g>
                        );
                      })}
                  </g>
                );
              })}
            </g>

            {/* LAYER 2: INTERACTIVE BRANCH MARKERS & LABELS (Only for visibleBranchesOnMap!) */}
            <g>
              {visibleBranchesOnMap.map((branch) => {
                const isHovered = hoveredBranchId === branch.id;
                const isSelected = selectedBranch === branch.id;

                // Label offset so Tokyo and Osaka don't overlap in World View
                let labelDx = 0;
                let labelDy = isZoomedToBranch ? -2.2 : -12;
                if (!isZoomedToBranch) {
                  if (branch.id === "Tokyo - Jepang") {
                    labelDx = 14;
                    labelDy = -6;
                  } else if (branch.id === "Osaka - Jepang") {
                    labelDx = -14;
                    labelDy = 16;
                  } else if (branch.id === "Seoul - Korea Selatan") {
                    labelDx = -16;
                    labelDy = -10;
                  } else if (branch.id === "Hong Kong") {
                    labelDx = -12;
                    labelDy = -10;
                  } else if (branch.id === "Singapura") {
                    labelDx = 0;
                    labelDy = 17;
                  }
                }

                return (
                  <g
                    key={`marker-${branch.id}`}
                    transform={`translate(${branch.x}, ${branch.y})`}
                    onClick={() => handleBranchClick(branch.id)}
                    onMouseEnter={() => setHoveredBranchId(branch.id)}
                    onMouseLeave={() => setHoveredBranchId(null)}
                    className="cursor-pointer"
                  >
                    {/* Pulse Ring */}
                    <circle
                      r={(isHovered || isSelected ? 13 : 9) * markerScale}
                      fill="none"
                      stroke={branch.heatStyle.hex}
                      strokeWidth={1.5 * markerScale}
                      opacity="0.85"
                    />
                    {/* Core Pin */}
                    <circle
                      r={4.8 * markerScale}
                      fill={branch.heatStyle.core}
                      stroke="#ffffff"
                      strokeWidth={1.4 * markerScale}
                    />

                    {/* City + Metrics Label Pill */}
                    <g transform={`translate(${labelDx}, ${labelDy})`}>
                      <rect
                        x={-36 * markerScale}
                        y={-7.5 * markerScale}
                        width={72 * markerScale}
                        height={14 * markerScale}
                        rx={3 * markerScale}
                        fill="#0f172a"
                        fillOpacity="0.9"
                        stroke={
                          isSelected || isHovered
                            ? "#20a7c9"
                            : branch.heatStyle.hex
                        }
                        strokeWidth={0.9 * markerScale}
                      />
                      <text
                        x="0"
                        y={1.8 * markerScale}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize={7.2 * markerScale}
                        fontWeight="600"
                      >
                        {branch.shortName} • {branch.failed}/{branch.total} err
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Bottom Map Overlay: Thermal Legend & Active Filter Info */}
          <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-slate-400">
                Heatmap Intensity:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#87d068]">Low (Healthy)</span>
                <div
                  className="w-28 h-2.5 rounded-full border border-slate-700"
                  style={{
                    background:
                      "linear-gradient(90deg, #20a7c9 0%, #87d068 30%, #facc15 65%, #f97316 85%, #ef4444 100%)",
                  }}
                />
                <span className="text-[11px] text-[#ef4444] font-semibold">
                  Critical Error
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Cabang Aktif di Peta:{" "}
              <span className="text-white font-semibold">
                {visibleBranchesOnMap.length} dari {OVERSEAS_BRANCHES.length} lokasi
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BRANCH HEATMAP DETAILS & RANKING (AUTO-ADJUSTS TO SELECTION) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex flex-col justify-between">
          {focusedSummary ? (
            /* DETAILED VIEW FOR THE SELECTED BRANCH (e.g., Seoul - Korea Selatan) */
            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20a7c9] block">
                      Detail Heatmap Cabang
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-0.5">
                      {focusedSummary.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {focusedSummary.branches[0]?.timezone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {focusedSummary.branches[0]?.lat.toFixed(2)}°,{" "}
                        {focusedSummary.branches[0]?.lng.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold border ${focusedSummary.heatStyle.badgeBg}`}
                  >
                    {focusedSummary.heatStyle.level}
                  </span>
                </div>

                {/* Selected Branch KPI Mini Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">
                      Total Job
                    </span>
                    <span className="text-lg font-bold text-gray-800">
                      {focusedSummary.total}
                    </span>
                  </div>
                  <div className="bg-[#87d068]/10 p-2.5 rounded border border-[#87d068]/30">
                    <span className="text-[11px] text-[#5b9a3d] block">
                      Success
                    </span>
                    <span className="text-lg font-bold text-[#6db34f]">
                      {focusedSummary.success}
                    </span>
                  </div>
                  <div className="bg-[#e04355]/10 p-2.5 rounded border border-[#e04355]/30">
                    <span className="text-[11px] text-[#e04355] block">
                      Failed (Error)
                    </span>
                    <span className="text-lg font-bold text-[#e04355]">
                      {focusedSummary.failed}
                    </span>
                  </div>
                </div>

                {/* Thermal Error Bar */}
                <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      Tingkat Error Cabang (Heat Ratio)
                    </span>
                    <span className="font-bold text-gray-900">
                      {focusedSummary.errorRate}% Error ({focusedSummary.successRate}% Success)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${focusedSummary.errorRate}%` }}
                      className="bg-[#e04355] h-full transition-all duration-300"
                    />
                    <div
                      style={{ width: `${focusedSummary.successRate}%` }}
                      className="bg-[#87d068] h-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Schema Heatmap Breakdown inside Selected Branch */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#20a7c9]" />
                    Distribusi Heatmap Schema di {focusedSummary.title}
                  </h4>
                  {focusedSummary.schemas.length > 0 ? (
                    <div className="space-y-1.5 max-h-[165px] overflow-y-auto pr-1">
                      {focusedSummary.schemas.map((sc) => {
                        const scErrRate =
                          sc.total > 0
                            ? Math.round((sc.failed / sc.total) * 100)
                            : 0;
                        return (
                          <div
                            key={sc.schema}
                            className="flex items-center justify-between px-3 py-2 rounded border border-gray-200 bg-white text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-xs shrink-0"
                                style={{
                                  backgroundColor:
                                    sc.failed > 0 ? "#e04355" : "#87d068",
                                }}
                              />
                              <span className="font-semibold text-gray-800">
                                Schema {sc.schema}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {sc.total} jobs
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded font-medium ${
                                  sc.failed > 0
                                    ? "bg-[#e04355]/10 text-[#e04355]"
                                    : "bg-[#87d068]/15 text-[#5b9a3d]"
                                }`}
                              >
                                {sc.failed} failed ({scErrRate}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded">
                      Tidak ada eksekusi pada rentang filter ini.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setZoomMultiplier(1);
                  onSelectBranch("All");
                }}
                className="w-full py-2 px-3 rounded border border-[#20a7c9] text-[#20a7c9] hover:bg-[#20a7c9]/5 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filter &amp; Tampilkan Semua Cabang
              </button>
            </div>
          ) : (
            /* OVERVIEW LIST OF ALL 7 OVERSEAS BRANCHES */
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#20a7c9]" />
                      Status Heatmap per Cabang
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Pilih salah satu cabang untuk fokus peta &amp; filter data
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {branchStats.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => handleBranchClick(branch.id)}
                      onMouseEnter={() => setHoveredBranchId(branch.id)}
                      onMouseLeave={() => setHoveredBranchId(null)}
                      className="w-full text-left p-2.5 rounded border border-gray-200 hover:border-[#20a7c9] hover:bg-[#20a7c9]/5 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: branch.heatStyle.hex }}
                          />
                          <span className="font-semibold text-gray-800 text-xs group-hover:text-[#20a7c9]">
                            {branch.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${branch.heatStyle.badgeBg}`}
                        >
                          {branch.failed} Failed / {branch.total} Total
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${branch.errorRate}%` }}
                            className="bg-[#e04355] h-full"
                          />
                          <div
                            style={{ width: `${branch.successRate}%` }}
                            className="bg-[#87d068] h-full"
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-500 w-14 text-right">
                          {branch.errorRate}% err
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                <span>7 Kantor Cabang Luar Negeri</span>
                <span>Klik cabang untuk detail</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
