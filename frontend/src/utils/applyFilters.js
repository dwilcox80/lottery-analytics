import { WEEKDAYS } from "../constants/days_of_the_week.js";

export function applyFilters(data, filters) {
  if (!data) return null;

  const { weekday, dayOfMonth, ball } = filters;
  const selectedBall = ball === "" ? null : String(ball);

  const weekdayNames = WEEKDAYS;
  const selectedWeekdays =
    weekday === "" ? weekdayNames : [weekdayNames[weekday]];

  // MAIN weekday filtering
  const weekday_main = filterWeekday(data.weekday, selectedWeekdays, selectedBall);
  const weekday_bonus = filterWeekday(data.bonus_weekday, selectedWeekdays, selectedBall);

  // HEATMAP MODES
  const heatmap_weekday_main = weekdayToHeatmap(weekday_main);
  const heatmap_weekday_bonus = weekdayToHeatmap(weekday_bonus);

  const heatmap_month_main = monthHeatmap(data.draws, false, selectedBall);
  const heatmap_month_bonus = monthHeatmap(data.draws, true, selectedBall);

  const heatmap_cooccurrence_main = cooccurrenceHeatmap(data.draws);

  const heatmap_drawindex_main = drawIndexHeatmap(data.draws, false, selectedBall);
  const heatmap_drawindex_bonus = drawIndexHeatmap(data.draws, true, selectedBall);

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

function filterWeekday(weekdayData, selectedWeekdays, selectedBall) {
  const result = {};
  selectedWeekdays.forEach((w) => {
    const row = weekdayData[w] || {};
    if (selectedBall) {
      result[w] = { [selectedBall]: row[selectedBall] ?? 0 };
    } else {
      result[w] = row;
    }
  });
  return result;
}

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