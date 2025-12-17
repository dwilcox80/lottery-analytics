import { Chart } from "react-chartjs-2";
import chroma from "chroma-js";

import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";

ChartJS.register(
  MatrixController,
  MatrixElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title
);

export default function Heatmap({ heatmap, title, xLabel, yLabel }) {
  if (!heatmap) return null;

  const balls = Object.keys(heatmap)
    .map(Number)
    .sort((a, b) => a - b);

  if (balls.length === 0) return <div>No data</div>;

  const colKeys = Array.from(
    new Set(
      balls.flatMap((b) => Object.keys(heatmap[b] || {}))
    )
  ).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb;
  });

  const cells = [];
  const counts = [];

  balls.forEach((ball, rowIndex) => {
    colKeys.forEach((col, colIndex) => {
      const count = heatmap[ball]?.[col] || 0;
      cells.push({ x: colIndex, y: rowIndex, v: count });
      counts.push(count);
    });
  });

  const max = Math.max(...counts, 1);
  const colorScale = chroma.scale(["#f0f9e8", "#08589e"]).domain([0, max]);

  const chartData = {
    datasets: [
      {
        label: title,
        data: cells,
        backgroundColor: (ctx) => colorScale(ctx.raw.v).hex(),
        borderColor: "#fff",
        borderWidth: 1,
        width: (ctx) => {
          const area = ctx.chart.chartArea;
          if (!area) return 10; // safe fallback before layout
          return area.width / colKeys.length;
        },
        height: (ctx) => {
          const area = ctx.chart.chartArea;
          if (!area) return 10; // safe fallback before layout
          return area.height / balls.length;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: title },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const ball = balls[ctx.raw.y];
            const col = colKeys[ctx.raw.x];
            return `${yLabel} ${ball} × ${xLabel} ${col}: ${ctx.raw.v}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        labels: colKeys,
        title: { display: true, text: xLabel },
      },
      y: {
        type: "category",
        labels: balls.map(String),
        title: { display: true, text: yLabel },
      },
    },
  };

  return (
    <div style={{ width: "1000px", height: "1200px" }}>
      <Chart type="matrix" data={chartData} options={options} />
    </div>
  );
}