import { useEffect, useState } from "react";
import { fetchAnalytics } from "../api/axios.js";

export default function Analytics() {
  const [lottery, setLottery] = useState("powerball");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetchAnalytics(lottery)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lottery]);

  return (
    <div>
      <h1>Lottery Analytics</h1>

      <select value={lottery} onChange={(e) => setLottery(e.target.value)}>
        <option value="powerball">Powerball</option>
        <option value="megamillions">Mega Millions</option>
      </select>

      {loading && <div>Loading…</div>}
      {error && <div>Error: {error}</div>}

      {data && (
        <pre style={{ fontSize: "0.8rem" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}