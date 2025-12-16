export default function BallSelector({ data, value, onChange }) {
  if (!data || !data.weekday) return null;

  // Pick any weekday (they all have the same keys)
  const firstWeekday = Object.keys(data.weekday)[0];
  const ballKeys = Object.keys(data.weekday[firstWeekday]);
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