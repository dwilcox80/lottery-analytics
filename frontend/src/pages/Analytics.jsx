import { useEffect, useState } from "react";
import { useAnalyticsApi } from "../api/axios.js";

import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BallFrequencyChart from "../components/BallFrequencyChart";
import BallSelector from "../components/BallSelector";
import DaySelector from "../components/DaySelector";
import LotterySelector from "../components/LotterySelector";

import { applyFilters } from "../utils/applyFilters";
import { WEEKDAYS } from "../constants/days_of_the_week.js";

export default function Analytics() {
    const [lottery, setLottery] = useState("powerball");
    const [data, setData] = useState(null);

    const [filters, setFilters] = useState({
        weekday: "",
        dayOfMonth: "",
        ball: "",
    });

    const [showBonus, setShowBonus] = useState(false);

    function updateFilter(key, value) {
        setFilters((prev) => ({...prev, [key]: value}));
    }

    const {fetchAnalytics} = useAnalyticsApi();

    useEffect(() => {
        setData(null);
        fetchAnalytics(lottery).then((res) => setData(res.data));
    }, [lottery]);
    console.log(data)
    if (!data) return <div>Loading…</div>;

    const filtered = applyFilters(data, filters);

    // Determine if any filters are active
    const filtersActive =
        filters.weekday !== "" ||
        filters.dayOfMonth !== "" ||
        filters.ball !== "";

    // Reset all filters
    function clearAllFilters() {
        setFilters({
            weekday: "",
            dayOfMonth: "",
            ball: "",
        });
    }

    return (
        <div style={{width: "900px"}}>
            <LotterySelector value={lottery} onChange={setLottery}/>

            <DaySelector
                type="weekday"
                value={filters.weekday}
                onChange={(v) => updateFilter("weekday", v)}
            />

            <DaySelector
                type="day"
                value={filters.dayOfMonth}
                onChange={(v) => updateFilter("dayOfMonth", v)}
            />

            <BallSelector
                data={data}
                value={filters.ball}
                onChange={(v) => updateFilter("ball", v)}
            />

            {/* Clear Filters Button */}
            <div style={{margin: "1rem 0"}}>
                <button
                    onClick={clearAllFilters}
                    disabled={!filtersActive}
                    style={{
                        padding: "6px 12px",
                        background: filtersActive ? "#e5e7eb" : "#f3f4f6",
                        color: filtersActive ? "#111" : "#999",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: filtersActive ? "pointer" : "not-allowed",
                        marginRight: "1rem",
                    }}
                >
                    Clear All Filters
                </button>

                {filtersActive && (
                    <span style={{fontSize: "0.9rem", color: "#555"}}>
                    Filters active:
                        {filters.weekday !== "" && ` Weekday=${WEEKDAYS[Number(filters.weekday)]}`}
                        {filters.dayOfMonth !== "" && ` Day=${filters.dayOfMonth}`}
                        {filters.ball !== "" && ` Ball=${filters.ball}`}
                  </span>
                )}
            </div>

            <div style={{margin: "1rem 0"}}>
                <button onClick={() => setShowBonus(false)} disabled={!showBonus}>
                    Main Balls
                </button>
                <button onClick={() => setShowBonus(true)} disabled={showBonus}>
                    Bonus Ball
                </button>
            </div>

            <BallFrequencyChart
                weekdayData={showBonus ? filtered.weekday_bonus : filtered.weekday_main}
                title={showBonus ? "Bonus Ball Frequency" : "Main Ball Frequency"}
            />

            <AnalyticsDashboard  summary={data.summary}/>
        </div>
    );
}