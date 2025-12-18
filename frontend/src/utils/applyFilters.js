import { WEEKDAYS } from "../constants/days_of_the_week.js";

// weekday names must match backend keys, e.g. "Monday", "Tuesday", ...
// WEEKDAYS should be like: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function applyFilters(analytics, filters) {
  if (!analytics) return null;

  const { draws } = analytics;
  const { weekday, dayOfMonth, ball } = filters;

  // 1. Build filtered draw list based on all active filters
  const filteredDraws = draws.filter((draw) => {
    const drawDate = new Date(draw.date + "T00:00:00");
    const drawWeekdayIndex = drawDate.getDay(); // 0=Sunday, 1=Monday, ...
    const drawWeekdayName = WEEKDAYS[drawWeekdayIndex === 0 ? 6 : drawWeekdayIndex - 1];
    const drawDayOfMonth = drawDate.getDate();

    // Weekday filter (frontend stores weekday index as string)
    if (weekday !== "") {
      const selectedIndex = Number(weekday);
      const selectedName = WEEKDAYS[selectedIndex];
      if (drawWeekdayName !== selectedName) {
        return false;
      }
    }

    // Day-of-month filter
    if (dayOfMonth !== "") {
      const selectedDay = Number(dayOfMonth);
      if (drawDayOfMonth !== selectedDay) {
        return false;
      }
    }

    // Ball filter
    if (ball !== "") {
      const b = Number(ball);
      const inMain = draw.main.includes(b);
      const inBonus = draw.bonus === b;

      // If we want the ball to be in either main or bonus, require that
      if (!inMain && !inBonus) {
        return false;
      }
    }

    return true;
  });

  // 2. Rebuild weekday_main and weekday_bonus from filtered draws
  const weekday_main = {};
  const weekday_bonus = {};

  // Initialize all weekdays so chart is stable, or lazily create as we go
  WEEKDAYS.forEach((name) => {
    weekday_main[name] = {};
    weekday_bonus[name] = {};
  });

  for (const draw of filteredDraws) {
    const drawDate = new Date(draw.date + "T00:00:00");
    const drawWeekdayIndex = drawDate.getDay();
    const drawWeekdayName = WEEKDAYS[drawWeekdayIndex === 0 ? 6 : drawWeekdayIndex - 1];

    // Main balls
    for (const m of draw.main) {
      const key = String(m);
      if (!weekday_main[drawWeekdayName][key]) {
        weekday_main[drawWeekdayName][key] = 0;
      }
      weekday_main[drawWeekdayName][key] += 1;
    }

    // Bonus ball
    const bonusKey = String(draw.bonus);
    if (!weekday_bonus[drawWeekdayName][bonusKey]) {
      weekday_bonus[drawWeekdayName][bonusKey] = 0;
    }
    weekday_bonus[drawWeekdayName][bonusKey] += 1;
  }

  // 3. Remove empty weekday rows so the chart doesn't see dead buckets
  for (const weekdayName of Object.keys(weekday_main)) {
    if (Object.keys(weekday_main[weekdayName]).length === 0) {
      delete weekday_main[weekdayName];
    }
  }

  for (const weekdayName of Object.keys(weekday_bonus)) {
    if (Object.keys(weekday_bonus[weekdayName]).length === 0) {
      delete weekday_bonus[weekdayName];
    }
  }

  return {
    weekday_main,
    weekday_bonus,
    draws: filteredDraws,
  };
}