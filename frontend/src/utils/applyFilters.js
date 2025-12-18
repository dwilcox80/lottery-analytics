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

    // Weekday filter (weekday is an index into WEEKDAYS)
    if (weekday !== "" && drawWeekdayIndex !== Number(weekday)) {
      return false;
    }

    // Day-of-month filter
    if (dayOfMonth !== "" && drawDay !== Number(dayOfMonth)) {
      return false;
    }

    // Ball filter (included in main or bonus)
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
// 3. HEATMAP HELPERS
// ---------------------------------------------------------

function weekdayToHeatmap(weekdayData) {
  const heatmap = {};
  for (const [weekday, balls] of Object.entries(weekdayData)) {
    for (const [ball, count] of Object.entries(balls)) {
      if (!heatmap[ball]) heatmap[ball] = {};
      heatmap[ball][weekday] = count;
    }
  }
  return heatmap;
}

function monthHeatmap(draws, isBonus, selectedBall) {
  const heatmap = {};
  draws.forEach((draw) => {
    const month = String(new Date(draw.date).getMonth() + 1);

    if (isBonus) {
      const b = String(draw.bonus);
      if (selectedBall && selectedBall !== b) return;
      if (!heatmap[b]) heatmap[b] = {};
      heatmap[b][month] = (heatmap[b][month] || 0) + 1;
    } else {
      draw.main.forEach((ball) => {
        const b = String(ball);
        if (selectedBall && selectedBall !== b) return;
        if (!heatmap[b]) heatmap[b] = {};
        heatmap[b][month] = (heatmap[b][month] || 0) + 1;
      });
    }
  });
  return heatmap;
}

function cooccurrenceHeatmap(draws) {
  const heatmap = {};
  draws.forEach((draw) => {
    const bonus = String(draw.bonus);
    draw.main.forEach((ball) => {
      const b = String(ball);
      if (!heatmap[b]) heatmap[b] = {};
      heatmap[b][bonus] = (heatmap[b][bonus] || 0) + 1;
    });
  });
  return heatmap;
}

function drawIndexHeatmap(draws, isBonus, selectedBall) {
  const heatmap = {};
  draws.forEach((draw, index) => {
    const drawIndex = index + 1;

    if (isBonus) {
      const b = String(draw.bonus);
      if (selectedBall && selectedBall !== b) return;
      if (!heatmap[b]) heatmap[b] = {};
      heatmap[b][drawIndex] = 1;
    } else {
      draw.main.forEach((ball) => {
        const b = String(ball);
        if (selectedBall && selectedBall !== b) return;
        if (!heatmap[b]) heatmap[b] = {};
        heatmap[b][drawIndex] = 1;
      });
    }
  });
  return heatmap;
}

// ---------------------------------------------------------
// 4. MAIN applyFilters()
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

  // Step 3: recompute heatmaps from filtered draws
  const heatmap_weekday_main = weekdayToHeatmap(weekday_main);
  const heatmap_weekday_bonus = weekdayToHeatmap(weekday_bonus);

  const heatmap_month_main = monthHeatmap(filteredDraws, false, selectedBall);
  const heatmap_month_bonus = monthHeatmap(filteredDraws, true, selectedBall);

  const heatmap_cooccurrence_main = cooccurrenceHeatmap(filteredDraws);

  const heatmap_drawindex_main = drawIndexHeatmap(
    filteredDraws,
    false,
    selectedBall
  );
  const heatmap_drawindex_bonus = drawIndexHeatmap(
    filteredDraws,
    true,
    selectedBall
  );

  return {
    weekday_main,
    weekday_bonus,

    heatmap_weekday_main,
    heatmap_weekday_bonus,

    heatmap_month_main,
    heatmap_month_bonus,

    heatmap_cooccurrence_main,

    heatmap_drawindex_main,
    heatmap_drawindex_bonus,
  };
}