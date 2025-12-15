import chroma from "chroma-js"

const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const DAYS = Array.from({length: 31} , (_, i) => String(i + 1));

const colorScale = chroma.scale(["#ffffff", "#6a0dad"]).mode("lab");

export default function Heatmap({data, selectedBall}) {
    if (!data || !data.joint || !selectedBall) return null;

    let maxValue = 0;

    WEEKDAYS.forEach((w) => {
        DAYS.forEach((d) => {
            const v = data.joint?.[w]?.[d]?.[selectedBall] || 0;
            if (v > maxValue) maxValue = v;
        });
    });

    return (
        <div className="heatmap-container">
            <div className="heatmap-row">
                <div className="heatmap-cell header"/>
                {DAYS.map((d) => (
                    <div key={d} className="heatmap-cell header">
                        {d}
                    </div>
                ))}
            </div>
            {WEEKDAYS.map((weekday) => (
                <div key={weekday} className="heatmap-row">
                    <div className="heatmap-cell header">{weekday}</div>
                    {DAYS.map((day) => {
                        const value = data?.joint?.[weekday]?.[day]?.[selectedBall] || 0;
                        const ratio = maxValue > 0 ? value / maxValue : 0;
                        const bgColor = value === 0
                            ? "#ffffff"
                            : colorScale(ratio).hex();
                        return (
                            <div
                                key={`${weekday}-${day}`}
                                className="heatmap-cell"
                                style={{
                                    backgroundColor: bgColor,
                                    color: ratio > 0.6 ? "#ffffff" : "#000000",
                                }}
                                title={`${weekday}, ${day}: ${value}`}
                            >
                                {value > 0 ? value : ""}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
