export default function BallSelector({ data, value, onChange }) {
  if (!data || !data.weekday_main) return null;

  // Pick any weekday (they all have the same keys)
  const firstWeekday = Object.keys(data.weekday_main)[0];
  if (!firstWeekday) return null;

  const ballKeys = Object.keys(data.weekday_main[firstWeekday]);
  if (ballKeys.length === 0) return null;

  const maxBall = Math.max(...ballKeys.map(Number));
  const balls = Array.from({ length: maxBall }, (_, i) => i + 1);

  return (
    <select
      value={value === "" ? "" : value}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
    >
      <option value="">-- Any --</option>
      {balls.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  );
}