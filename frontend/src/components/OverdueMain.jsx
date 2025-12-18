export default function OverdueMain({ data }) {
  return (
    <div className="card">
      <h3>⏳ Overdue Main Balls</h3>
      {["30", "60", "90"].map((range) => (
        <div key={range}>
          <strong>{">" + range} days:</strong> {data[range].join(", ") || "—"}
        </div>
      ))}
    </div>
  );
}