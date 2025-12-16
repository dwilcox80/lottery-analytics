import { useEffect, useState } from "react";
import { fetchAnalytics } from "../api/axios.js";

import LotterySelector from "../components/LotterySelector";
import DaySelector from "../components/DaySelector";
import BallSelector from "../components/BallSelector";
import BallFrequencyChart from "../components/BallFrequencyChart";
import Heatmap from "../components/Heatmap";

import { applyFilters } from "../utils/applyFilters";

export default function Analytics() {
  const [lottery, setLottery] = useState("powerball");
  const [data, setData] = useState(null);

  const [filters, setFilters] = useState({
    weekday: "",
    dayOfMonth: "",
    ball: "",
  });

  const [showBonus, setShowBonus] = useState(false); // main / bonus toggle

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    setData(null);
    fetchAnalytics(lottery).then((res) => setData(res.data));
  }, [lottery]);

  if (!data) return <div>Loading…</div>;

  // Apply unified filtering logic
  const filteredData = applyFilters(data, filters);

  const weekdayData = showBonus
    ? filteredData.weekday_bonus
    : filteredData.weekday_main;

  const heatmapData = showBonus
    ? filteredData.heatmap_bonus
    : filteredData.heatmap_main;

  const modeLabel = showBonus ? "Bonus Ball" : "Main Balls";

  return (
    <div style={{ width: "800px" }}>
      {/* Select lottery */}
      <LotterySelector value={lottery} onChange={setLottery} />

      {/* Select weekday */}
      <DaySelector
        type="weekday"
        value={filters.weekday}
        onChange={(v) => updateFilter("weekday", v)}
      />

      {/* Select day of month */}
      <DaySelector
        type="day"
        value={filters.dayOfMonth}
        onChange={(v) => updateFilter("dayOfMonth", v)}
      />

      {/* Select ball (range derived from analytics payload) */}
      <BallSelector
        data={data}
        value={filters.ball}
        onChange={(v) => updateFilter("ball", v)}
      />

      {/* Main / Bonus toggle */}
      <div style={{ margin: "1rem 0" }}>
        <button
          type="button"
          onClick={() => setShowBonus(false)}
          disabled={!showBonus}
        >
          Main Balls
        </button>
        <button
          type="button"
          onClick={() => setShowBonus(true)}
          disabled={showBonus}
          style={{ marginLeft: "0.5rem" }}
        >
          Bonus Ball
        </button>
      </div>

      {/* Render filtered analytics */}
      <BallFrequencyChart
        weekdayData={weekdayData}
        title={`${modeLabel} Frequency`}
      />

      <Heatmap
        heatmap={heatmapData}
        title={`${modeLabel} Heatmap (Ball × Day-of-Month)`}
        yLabel={showBonus ? "Bonus Ball" : "Ball Number"}
      />
    </div>
  );
}