import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const CATEGORIES = [
  "Population",
  "Literacy",
  "In School",
  "Secondary\nComplete",
  "Higher\nEducation",
  "Skilled\nJobs",
] as const;

const SLUM_DATA = [42, 69, 20, 15, 5, 8];
const NON_SLUM_DATA = [58, 90, 95, 85, 65, 75];
const SLUM_COLOR = "#e74c3c";
const NON_SLUM_COLOR = "#3498db";

function createJustFivePlugin(compact: boolean): Plugin<"bar"> {
  return {
    id: "justFiveCallout",
    afterDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      const bar = meta.data[4];
      if (!bar || typeof (bar as { x?: number }).x !== "number") return;

      const { x, y } = bar as { x: number; y: number };
      const { ctx } = chart;
      const fontSize = compact ? 11 : 13;
      const labelY = y - (compact ? 22 : 28);

      ctx.save();
      ctx.font = `700 ${fontSize}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = "#24283e";
      ctx.textAlign = "center";
      ctx.fillText("Just 5%", x, labelY);

      ctx.strokeStyle = "#d86382";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, labelY + 6);
      ctx.lineTo(x, y - (compact ? 4 : 6));
      ctx.stroke();
      ctx.restore();
    },
  };
}

export default function RealityChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const update = () => setWidth(node.clientWidth || 800);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const compact = width < 560;
  const tiny = width < 380;

  const data = useMemo<ChartData<"bar">>(
    () => ({
      labels: [...CATEGORIES],
      datasets: [
        {
          label: compact ? "Slum" : "Slum Children",
          data: SLUM_DATA,
          backgroundColor: SLUM_COLOR,
          borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
          maxBarThickness: tiny ? 18 : compact ? 28 : 42,
        },
        {
          label: compact ? "Non-slum" : "Non-Slum Children",
          data: NON_SLUM_DATA,
          backgroundColor: NON_SLUM_COLOR,
          borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
          maxBarThickness: tiny ? 18 : compact ? 28 : 42,
        },
      ],
    }),
    [compact, tiny],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: compact ? 28 : 36,
          right: tiny ? 2 : 8,
          bottom: 4,
          left: tiny ? 0 : 4,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          align: "center",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded",
            boxWidth: compact ? 10 : 12,
            boxHeight: compact ? 10 : 12,
            padding: compact ? 12 : 18,
            color: "#24283e",
            font: {
              family: "'DM Sans', sans-serif",
              size: compact ? 11 : 13,
              weight: 600,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
          },
        },
        datalabels: {
          anchor: "end",
          align: "top",
          offset: 2,
          color: "#5b5a65",
          font: {
            family: "'DM Sans', sans-serif",
            size: tiny ? 9 : compact ? 10 : 11,
            weight: 600,
          },
          formatter: (value: number, ctx) => {
            if (ctx.datasetIndex === 0 && ctx.dataIndex === 4) return "";
            return `${value}%`;
          },
          clamp: true,
          display: (ctx) => {
            // Drop a few non-critical labels on very narrow charts to reduce clutter
            if (tiny && ctx.datasetIndex === 1 && ctx.dataIndex > 3) return false;
            return true;
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#5b5a65",
            font: {
              family: "'DM Sans', sans-serif",
              size: tiny ? 9 : compact ? 10 : 11,
              weight: 600,
            },
            maxRotation: compact ? 0 : 0,
            autoSkip: false,
            callback(_value, index) {
              const label = CATEGORIES[index] ?? "";
              if (tiny) {
                const short = ["Pop.", "Lit.", "School", "Sec.", "Higher", "Jobs"];
                return short[index] ?? label;
              }
              return label.includes("\n") ? label.split("\n") : label;
            },
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: compact ? 25 : 20,
            callback: (value) => `${value}%`,
            color: "#8d8990",
            font: { family: "'DM Sans', sans-serif", size: tiny ? 9 : 11 },
            maxTicksLimit: compact ? 5 : 6,
          },
          grid: {
            color: "rgba(36, 40, 62, 0.08)",
          },
          border: { display: false },
        },
      },
      datasets: {
        bar: {
          categoryPercentage: tiny ? 0.78 : compact ? 0.74 : 0.72,
          barPercentage: tiny ? 0.88 : 0.82,
        },
      },
    }),
    [compact, tiny],
  );

  const plugins = useMemo(() => [createJustFivePlugin(compact)], [compact]);

  return (
    <div
      ref={wrapRef}
      className="reality-chart-wrap"
      aria-label="Comparison of outcomes for slum and non-slum children"
    >
      <Bar data={data} options={options} plugins={plugins} />
    </div>
  );
}
