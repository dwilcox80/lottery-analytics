export default function HottestBonus({ data }) {
  return (
    <div className="card">
      <h3>🔥 Hottest Bonus Balls</h3>
      {["30", "60", "90"].map((range) => (
        <div key={range}>
          <strong>{range} days:</strong> {data[range].join(", ")}
        </div>
      ))}
    </div>
  );
}