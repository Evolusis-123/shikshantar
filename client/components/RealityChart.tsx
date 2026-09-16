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

const CATEGORIES = ["Higher education", "Skilled jobs"] as const;

const SHORT_CATEGORIES = ["Higher ed.", "Skilled jobs"] as const;

const SLUM_DATA = [5, 8];
const NON_SLUM_DATA = [65, 75];
const SLUM_COLOR = "#e12d1f";
const NON_SLUM_COLOR = "#bcdcf3";
const LABEL_COLOR = "#1a1a1a";
const CIRCLE_COLOR = "rgba(216, 99, 130, .9)";

/**
 * Chart.js paints datasets back to front, so the slum share must come first for its
 * red 0-to-5% block to sit on top of the light non-slum bar instead of under it.
 */
const SLUM_SET = 0;
const NON_SLUM_SET = 1;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

type BarGeometry = { x: number; y: number; base: number; height: number };

function barGeometry(bar: unknown, final = true): BarGeometry | null {
  const element = bar as { getProps?: (props: string[], final?: boolean) => BarGeometry };
  if (typeof element?.getProps !== "function") return null;

  const geometry = element.getProps(["x", "y", "base", "height"], final);
  return typeof geometry.x === "number" && typeof geometry.y === "number" ? geometry : null;
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (width <= 0 || height <= 0) return;

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fill();
}

/** Faint full-width track behind each bar so the missing share reads as a shortfall. */
const shortfallTrackPlugin: Plugin<"bar"> = {
  id: "shortfallTrack",
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const left = scales.x.getPixelForValue(0);
    const width = chartArea.right - left;

    ctx.save();
    ctx.fillStyle = "rgba(36, 40, 62, .05)";
    chart.getDatasetMeta(NON_SLUM_SET).data.forEach((bar) => {
      const geometry = barGeometry(bar);
      if (!geometry) return;
      fillRoundedRect(ctx, left, geometry.y - geometry.height / 2, width, geometry.height, 10);
    });
    ctx.restore();
  },
};

/** Two open, slightly tilted passes — reads as a loop drawn by hand, not a shape. */
function strokeSketchEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -0.07, -0.34, Math.PI * 2 - 0.12);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy - 1, rx * 0.97, ry * 1.05, -0.02, 0.16, Math.PI * 2 + 0.36);
  ctx.stroke();
}

/** The slum share, called out in words and ringed by hand along with its red block. */
function createInBarPlugin(compact: boolean, tiny: boolean): Plugin<"bar"> {
  return {
    id: "inBarAnnotations",
    afterDatasetsDraw(chart) {
      const nonSlumMeta = chart.getDatasetMeta(NON_SLUM_SET);
      const slumMeta = chart.getDatasetMeta(SLUM_SET);
      const { ctx, scales } = chart;
      const axisStart = scales.x.getPixelForValue(0);

      ctx.save();
      CATEGORIES.forEach((_, index) => {
        // Animated positions, so annotations grow in with the bars.
        const bar = barGeometry(nonSlumMeta.data[index], false);
        const slum = barGeometry(slumMeta.data[index], false);
        if (!bar || !slum) return;

        const figureSize = tiny ? 11 : compact ? 13 : 15;
        ctx.font = `700 ${figureSize}px 'DM Sans', sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const figure = `Only ${SLUM_DATA[index]}%`;
        const figureWidth = ctx.measureText(figure).width;
        const figureX = slum.x + 10;
        if (figureX + figureWidth > bar.x - 8) return;

        ctx.fillStyle = LABEL_COLOR;
        ctx.fillText(figure, figureX, bar.y + 0.5);

        // Ring the red block and its figure together.
        const left = axisStart - 4;
        const right = figureX + figureWidth + 10;
        ctx.strokeStyle = CIRCLE_COLOR;
        ctx.lineWidth = tiny ? 1.6 : 2.2;
        ctx.lineCap = "round";
        strokeSketchEllipse(
          ctx,
          (left + right) / 2,
          bar.y,
          (right - left) / 2,
          bar.height / 2 + (tiny ? 7 : 10),
        );
      });
      ctx.restore();
    },
  };
}

export default function RealityChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const update = () => setWidth(node.clientWidth || 800);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Hold the chart back until it is on screen, so the bars are seen growing.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const compact = width < 560;
  const tiny = width < 380;
  const barThickness = tiny ? 34 : compact ? 44 : 58;

  const data = useMemo<ChartData<"bar">>(
    () => ({
      labels: [...CATEGORIES],
      datasets: [
        {
          label: compact ? "Slum" : "Slum Children",
          data: SLUM_DATA,
          backgroundColor: SLUM_COLOR,
          borderRadius: { topLeft: 0, topRight: 8, bottomLeft: 0, bottomRight: 8 },
          borderSkipped: false,
          grouped: false,
          maxBarThickness: barThickness,
        },
        {
          label: compact ? "Non-slum" : "Non-Slum Children",
          data: NON_SLUM_DATA,
          backgroundColor: NON_SLUM_COLOR,
          borderRadius: { topLeft: 0, topRight: 10, bottomLeft: 0, bottomRight: 10 },
          borderSkipped: false,
          grouped: false,
          maxBarThickness: barThickness,
        },
      ],
    }),
    [barThickness, compact],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: prefersReducedMotion() ? 0 : 1200,
        easing: "easeOutQuart",
        delay: (context) => {
          const ctx = context as unknown as { type?: string; mode?: string; dataIndex?: number };
          if (ctx.type !== "data" || ctx.mode !== "default") return 0;
          return (ctx.dataIndex ?? 0) * 220;
        },
      },
      interaction: { mode: "index", intersect: false },
      layout: {
        padding: { top: 4, right: tiny ? 8 : 14, bottom: 4, left: 0 },
      },
      plugins: {
        legend: {
          position: "top",
          align: "start",
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
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}%`,
          },
        },
        datalabels: {
          // Only the non-slum total is labelled here; the slum figure is drawn
          // next to its marker line, where there is room for it.
          display: (ctx) => ctx.datasetIndex === NON_SLUM_SET,
          anchor: "end",
          align: "left",
          offset: 10,
          color: LABEL_COLOR,
          font: {
            family: "'DM Sans', sans-serif",
            size: tiny ? 10 : compact ? 11 : 13,
            weight: 700,
          },
          formatter: (value: number) => `${value}%`,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: compact ? 25 : 20,
            callback: (value) => `${value}%`,
            color: "#8d8990",
            font: { family: "'DM Sans', sans-serif", size: tiny ? 9 : 11 },
            maxTicksLimit: compact ? 5 : 6,
          },
          grid: { color: "rgba(36, 40, 62, 0.08)" },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#24283e",
            font: {
              family: "'DM Sans', sans-serif",
              size: tiny ? 10 : compact ? 11 : 13,
              weight: 600,
            },
            autoSkip: false,
            crossAlign: "far",
            // Clearance for the hand-drawn ring that starts just left of the axis.
            padding: 12,
            callback(_value, index) {
              return (compact ? SHORT_CATEGORIES : CATEGORIES)[index] ?? "";
            },
          },
        },
      },
      datasets: {
        bar: {
          categoryPercentage: 0.66,
          barPercentage: 1,
        },
      },
    }),
    [compact, tiny],
  );

  const plugins = useMemo(
    () => [shortfallTrackPlugin, createInBarPlugin(compact, tiny)],
    [compact, tiny],
  );

  return (
    <div
      ref={wrapRef}
      className="reality-chart-wrap"
      aria-label="Comparison of outcomes for slum and non-slum children"
    >
      {inView && <Bar data={data} options={options} plugins={plugins} />}
    </div>
  );
}
