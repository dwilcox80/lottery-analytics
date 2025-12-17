import {useEffect, useState} from "react";
import {useAnalyticsApi} from "../api/axios.js";

import LotterySelector from "../components/LotterySelector";
import DaySelector from "../components/DaySelector";
import BallSelector from "../components/BallSelector";
import BallFrequencyChart from "../components/BallFrequencyChart";
import Heatmap from "../components/Heatmap";

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

    if (heatmapMode === "weekday") {
        heatmap = showBonus
            ? filtered.heatmap_weekday_bonus
            : filtered.heatmap_weekday_main;
        title = "Ball × Weekday";
        xLabel = "Weekday";
    } else if (heatmapMode === "month") {
        heatmap = showBonus
            ? filtered.heatmap_month_bonus
            : filtered.heatmap_month_main;
        title = "Ball × Month";
        xLabel = "Month";
    } else if (heatmapMode === "bonus") {
        heatmap = filtered.heatmap_cooccurrence_main;
        title = "Ball × Bonus Ball";
        xLabel = "Bonus Ball";
        yLabel = "Main Ball";
    } else if (heatmapMode === "drawIndex") {
        heatmap = showBonus
            ? filtered.heatmap_drawindex_bonus
            : filtered.heatmap_drawindex_main;
        title = "Ball × Draw Index";
        xLabel = "Draw Index";
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

            <div style={{margin: "1rem 0"}}>
                <button onClick={() => setShowBonus(false)} disabled={!showBonus}>
                    Main Balls
                </button>
                <button onClick={() => setShowBonus(true)} disabled={showBonus}>
                    Bonus Ball
                </button>
            </div>

            <div style={{margin: "1rem 0"}}>
                <button onClick={() => setHeatmapMode("weekday")}>Weekday</button>
                <button onClick={() => setHeatmapMode("month")}>Month</button>
                <button onClick={() => setHeatmapMode("bonus")}>Bonus Co-occurrence</button>
                <button onClick={() => setHeatmapMode("drawIndex")}>Draw Index</button>
            </div>

            <BallFrequencyChart
                weekdayData={showBonus ? filtered.weekday_bonus : filtered.weekday_main}
                title={showBonus ? "Bonus Ball Frequency" : "Main Ball Frequency"}
            />

            <Heatmap
                heatmap={heatmap}
                title={title}
                xLabel={xLabel}
                yLabel={yLabel}
            />
        </div>
    );
}