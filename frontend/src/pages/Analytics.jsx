import {useEffect, useState} from "react";
import {useAnalyticsApi} from "../api/axios.js";

import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BallFrequencyChart from "../components/BallFrequencyChart";
import BallSelector from "../components/BallSelector";
import DaySelector from "../components/DaySelector";
import LotterySelector from "../components/LotterySelector";

import {applyFilters} from "../utils/applyFilters";

export default function Analytics() {
    const [lottery, setLottery] = useState("powerball");
    const [data, setData] = useState(null);

    const [filters, setFilters] = useState({
        weekday: "",
        dayOfMonth: "",
        ball: "",
    });

    const [showBonus, setShowBonus] = useState(false);
    const [heatmapMode, setHeatmapMode] = useState("weekday");

    function updateFilter(key, value) {
        setFilters((prev) => ({...prev, [key]: value}));
    }

    const {fetchAnalytics} = useAnalyticsApi();

    useEffect(() => {
        setData(null);
        fetchAnalytics(lottery).then((res) => setData(res.data));
    }, [lottery]);

    if (!data) return <div>Loading…</div>;

    const filtered = applyFilters(data, filters);

    let heatmap;
    let title;
    let xLabel;
    let yLabel = showBonus ? "Bonus Ball" : "Ball Number";

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

            <AnalyticsDashboard summary={analytics.summary} />

        </div>
    );
}