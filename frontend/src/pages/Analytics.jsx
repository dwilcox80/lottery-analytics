import { useEffect, useState } from "react";
import api from "../api/axios";
import LotterySelector from "../components/LotterySelector";
import DaySelector from "../components/DaySelector";
import BallFrequencyChart from "../components/BallFrequencyChart";

export default function Analytics() {
    const [lottery, setLottery] = useState("powerball");
    const [weekday, setWeekday] = useState("2");  // Monday
    const [dayOfMonth, setDayOfMonth] = useState("1");
    const [data, setData] = useState(null);

    useEffect(() => {
        api
            .get(`lottery/analytics/?lottery=${lottery}`)
            .then((res) => setData(res.data));
    }, [lottery]);

    if (!data) return <p>Loading...</p>;

    const weekdayData = data.weekday[weekday] || {};
    const dayData = data.day_of_month[dayOfMonth] || {};

    // Cross-reference (intersection)
    const combined = {};
    for (const ball in weekdayData) {
        if (dayData[ball]) {
            combined[ball] = weekdayData[ball] + dayData[ball];
        }
    }

    return (
        <div>
            <h2>Lottery Analytics</h2>

            <LotterySelector value={lottery} onChange={setLottery} />

            <DaySelector
                type="weekday"
                value={weekday}
                onChange={setWeekday}
            />

            <DaySelector
                type="day"
                value={dayOfMonth}
                onChange={setDayOfMonth}
            />

            <BallFrequencyChart
                data={combined}
                title="Ball Frequency (Cross-Referenced)"
            />
        </div>
    );
}