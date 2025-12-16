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

// Register Chart.js components
ChartJS.register(
  MatrixController,
  MatrixElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title
);

/**
 * Heatmap: Ball (Y) × Day-of-Month (X)
 *
 * Expects:
 *   heatmap[ball][day] = count
 */
export default function Heatmap({ heatmap, title, yLabel }) {
  if (!heatmap) return null;

  const balls = Object.keys(heatmap)
    .map((b) => Number(b))
    .sort((a, b) => a - b);

  if (balls.length === 0) {
    return <div>No data for selected filters</div>;
  }

  // Collect all (ball, day, count) triples
  const cells = [];
  const allCounts = [];

  balls.forEach((ballNumber, rowIndex) => {
    const dayMap = heatmap[String(ballNumber)] || {};

    for (let day = 1; day <= 31; day++) {
      const key = String(day);
      const count = dayMap[key] || 0;

      cells.push({
        x: day,
        y: rowIndex,
        v: count,
      });

      allCounts.push(count);
    }
  });

  const max = Math.max(...allCounts, 1);
  const colorScale = chroma.scale(["#f0f9e8", "#08589e"]).domain([0, max]);

  const chartData = {
    datasets: [
      {
        label: title,
        data: cells,
        backgroundColor: (ctx) => colorScale(ctx.raw.v).hex(),
        borderColor: "#ffffff",
        borderWidth: 1,
        width: (ctx) => {
          const area = ctx.chart.chartArea;
          if (!area) return 10;
          return area.width / 31; // 31 days
        },
        height: (ctx) => {
          const area = ctx.chart.chartArea;
          if (!area) return 10;
          return area.height / balls.length; // one row per ball
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const { x, y, raw } = ctx;
            const ballNumber = balls[y];
            return `${yLabel} ${ballNumber} — Day ${x}: ${raw.v}`;
          },
        },
      },
      legend: { display: false },
    },
    scales: {
      x: {
        type: "linear",
        min: 1,
        max: 31,
        ticks: {
          stepSize: 1,
          autoSkip: false,
          precision: 0,
          callback: (v) => Number(v).toString(),
        },
        title: { display: true, text: "Day of Month" },
      },
      y: {
        type: "category",
        labels: balls.map((b) => String(b)),
        ticks: {
          autoSkip: false,
        },
        title: { display: true, text: yLabel },
      },
    },
  };

  return (
    <div>
      <Chart
        key={title}
        type="matrix"
        data={chartData}
        options={options}
        redraw={false}
      />
    </div>
  );
}