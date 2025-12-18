export default function RecentDraws({ data }) {
  return (
    <div className="card">
      <h3>🕒 Last 10 Draws</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Main</th>
            <th>Bonus</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, idx) => (
            <tr key={idx}>
              <td>{d.date}</td>
              <td>{d.main.join(", ")}</td>
              <td>{d.bonus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}