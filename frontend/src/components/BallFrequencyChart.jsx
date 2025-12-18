import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import chroma from "chroma-js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BallFrequencyChart({ weekdayData, title }) {
  if (!weekdayData) return null;

  // Aggregate counts across all weekdays
  const aggregate = {};

  for (const balls of Object.values(weekdayData)) {
    for (const [ball, count] of Object.entries(balls)) {
      const b = Number(ball);
      aggregate[b] = (aggregate[b] || 0) + count;
    }
  }

  // Convert to sorted rows
  const rows = Object.entries(aggregate)
    .map(([ball, count]) => ({ ball: Number(ball), count }))
    .sort((a, b) => a.ball - b.ball);

  const labels = rows.map((r) => r.ball);
  const counts = rows.map((r) => r.count);

  if (labels.length === 0) {
    return <div>No data for selected filters</div>;
  }

  const max = Math.max(...counts, 1);
  const colorScale = chroma.scale(["#e0f2fe", "#0284c7"]).domain([0, max]);

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: counts,
        backgroundColor: counts.map((c) => colorScale(c).hex()),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: title },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Ball ${ctx.label}: ${ctx.raw}`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Ball Number" } },
      y: { title: { display: true, text: "Count" }, beginAtZero: true },
    },
  };

  return <Bar data={chartData} options={options} />;
}