export default function DaySelector({ value, onChange, type }) {
    const options =
        type === "weekday"
        ? [
                [1, "Sunday"],
                [2, "Monday"],
                [3, "Tuesday"],
                [4, "Wednesday"],
                [5, "Thursday"],
                [6, "Friday"],
                [7, "Saturday"],
          ]
        : Array.from({ length: 31 }, (_, i) => [i + 1, i + 1]);

    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map(([val, label]) => (
                <option key={val} value={val}>
                    {label}
                </option>
            ))}
        </select>
    );
}