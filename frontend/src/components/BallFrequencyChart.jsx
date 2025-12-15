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

const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function BallFrequencyChart({ data, selectedBall }) {
    if (!data?.weekday) {
        return <div style={{ height: 300 }}>Loading...</div>
    }

    const ballKey = String(selectedBall);

    const values = WEEKDAYS.map(
        (day) => Number(data.weekday?.[day]?.[ballKey] ?? 0)
    )

    const chartData = {
        labels: WEEKDAYS,
        datasets: [
            {
                label: `Ball ${ballKey} frequency`,
                data: values,
                backgroundColor: "rgba(128, 0, 128, 0.6)",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 },
            },
        },
    };

    return(
        <div style={{ height: "300px" }}>
            <h3>{title}</h3>
            <Bar data={chartData} options={options} />
        </div>
    );
}