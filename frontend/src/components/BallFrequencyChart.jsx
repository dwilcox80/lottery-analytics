import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

export default function BallFrequencyChar({ data, title, }) {
    const labels = Object.keys(data).sort((a, b) => a - b);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Frequency",
                data: labels.map((k) => data[k]),
            },
        ],
    };

    return(
        <div>
            <h3>{title}</h3>
            <Bar data={chartData} />
        </div>
    );
}