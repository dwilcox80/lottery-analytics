import { WEEKDAYS } from "../constants/days_of_the_week.js";

export default function DaySelector({ value, onChange, type }) {
  const options =
    type === "weekday"
      ? WEEKDAYS.map((label, index) => [index, label]) // 0–6
      : Array.from({ length: 31 }, (_, i) => [i + 1, i + 1]);

  return (
    <select
        value={value === "" ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
    >
        <option value="">--Any--</option>
        {options.map(([val, label]) => (
            <option key={val} value={val}>
                {label}
            </option>
        ))}
    </select>
  );
}