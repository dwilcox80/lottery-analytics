export default function HottestMain({ data }) {
  return (
    <div className="card">
      <h3>🔥 Hottest Main Balls</h3>
      <div className="ranges">
        {["30", "60", "90"].map((range) => (
          <div key={range}>
            <strong>{range} days:</strong> {data[range].join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}