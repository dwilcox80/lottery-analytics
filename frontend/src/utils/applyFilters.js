import { WEEKDAYS } from "../constants/days_of_the_week.js";

// ---------------------------------------------------------
// 1. FILTER RAW DRAWS BY WEEKDAY, DAY-OF-MONTH, BALL
// ---------------------------------------------------------

function filterDraws(draws, filters) {
  const { weekday, dayOfMonth, ball } = filters;

  return draws.filter((draw) => {
    const date = new Date(draw.date + "T00:00:00");
    const drawWeekdayIndex = date.getDay(); // 0=Sun..6=Sat
    const drawDay = date.getDate();


    // Weekday filter
    if (weekday !== "" && drawWeekdayIndex !== Number(weekday)) {
      return false;
    }

    // Day-of-month filter
    if (dayOfMonth !== "" && drawDay !== Number(dayOfMonth)) {
      return false;
    }

    // Ball filter
    if (ball !== "") {
      const b = String(ball);
      const inMain = draw.main.map(String).includes(b);
      const isBonus = String(draw.bonus) === b;
      if (!inMain && !isBonus) {
        return false;
      }
    }
    return true;
  });
}

// ---------------------------------------------------------
// 2. RECOMPUTE WEEKDAY COUNTS FROM FILTERED DRAWS
// ---------------------------------------------------------

function computeWeekdayCounts(draws, isBonus, selectedBall) {
  const result = {};

  draws.forEach((draw) => {
    const date = new Date(draw.date);
    const weekdayIndex = date.getDay(); // 0–6
    const weekdayName = WEEKDAYS[weekdayIndex];

    if (!result[weekdayName]) result[weekdayName] = {};

    if (isBonus) {
      const b = String(draw.bonus);
      if (!selectedBall || selectedBall === b) {
        result[weekdayName][b] = (result[weekdayName][b] || 0) + 1;
      }
    } else {
      draw.main.forEach((ball) => {
        const b = String(ball);
        if (!selectedBall || selectedBall === b) {
          result[weekdayName][b] = (result[weekdayName][b] || 0) + 1;
        }
      });
    }
  });

  return result;
}

// ---------------------------------------------------------
// 3. MAIN applyFilters()
// ---------------------------------------------------------

export function applyFilters(data, filters) {
  if (!data) return null;

  const selectedBall =
    filters.ball === "" ? null : String(filters.ball);

  // Step 1: filter raw draws by weekday, day-of-month, ball
  const filteredDraws = filterDraws(data.draws, filters);

  // Step 2: recompute weekday counts from filtered draws
  const weekday_main = computeWeekdayCounts(filteredDraws, false, selectedBall);
  const weekday_bonus = computeWeekdayCounts(filteredDraws, true, selectedBall);

  return {
    weekday_main,
    weekday_bonus,

  };
}