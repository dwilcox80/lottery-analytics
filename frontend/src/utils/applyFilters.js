import { WEEKDAYS } from "../constants/days_of_the_week.js";

/**
 * Unified filtering engine for lottery analytics.
 *
 * Backend shape (per lottery):
 *
 * data = {
 *   weekday: { ... },          // main balls
 *   day_of_month: { ... },     // main balls
 *   joint: { ... },            // main balls
 *
 *   bonus_weekday: { ... },    // bonus balls
 *   bonus_day_of_month: { ... },
 *   bonus_joint: { ... },
 * }
 *
 * Output:
 *   - weekday_main: filtered weekday→ball→count (main)
 *   - weekday_bonus: filtered weekday→ball→count (bonus)
 *   - joint_main: filtered weekday→day→ball→count (main)
 *   - joint_bonus: filtered weekday→day→ball→count (bonus)
 *   - heatmap_main: ball→day→count (main)
 *   - heatmap_bonus: ball→day→count (bonus)
 */

export function applyFilters(data, filters) {
  if (!data) return null;

  const { weekday, dayOfMonth, ball } = filters;

  const selectedBall = ball === "" ? null : String(ball);
  const selectedDay = dayOfMonth === "" ? null : String(dayOfMonth);

  // WEEKDAYS = ["Sunday", "Monday", ...] (0-based indices)
  const weekdayNames = WEEKDAYS;
  const selectedWeekdays =
    weekday === "" ? weekdayNames : [weekdayNames[weekday]];

  // MAIN BALLS
  const joint_main = buildFilteredJoint(
    data.joint || {},
    selectedWeekdays,
    selectedDay,
    selectedBall
  );
  const weekday_main = buildFilteredWeekday(
    data.joint || {},
    selectedWeekdays,
    selectedDay,
    selectedBall
  );
  const heatmap_main = buildHeatmapFromJoint(joint_main);

  // BONUS BALLS
  const joint_bonus = buildFilteredJoint(
    data.bonus_joint || {},
    selectedWeekdays,
    selectedDay,
    selectedBall
  );
  const weekday_bonus = buildFilteredWeekday(
    data.bonus_joint || {},
    selectedWeekdays,
    selectedDay,
    selectedBall
  );
  const heatmap_bonus = buildHeatmapFromJoint(joint_bonus);

  return {
    weekday_main,
    weekday_bonus,
    joint_main,
    joint_bonus,
    heatmap_main,
    heatmap_bonus,
  };
}

/**
 * weekday → ball → count
 *
 * If a specific day is selected, we rebuild weekday frequencies
 * from joint[weekday][day][ball]. Otherwise we aggregate over all days.
 */
function buildFilteredWeekday(joint, selectedWeekdays, selectedDay, selectedBall) {
  const result = {};

  selectedWeekdays.forEach((weekday) => {
    const weekdayData = {};
    const weekdayJoint = joint[weekday] || {};

    if (selectedDay !== null) {
      const ballMap = weekdayJoint[selectedDay] || {};
      for (const [ball, count] of Object.entries(ballMap)) {
        if (selectedBall === null || selectedBall === ball) {
          weekdayData[ball] = count;
        }
      }
    } else {
      for (const [, ballMap] of Object.entries(weekdayJoint)) {
        for (const [ball, count] of Object.entries(ballMap)) {
          if (selectedBall !== null && selectedBall !== ball) continue;
          weekdayData[ball] = (weekdayData[ball] || 0) + count;
        }
      }
    }

    result[weekday] = weekdayData;
  });

  return result;
}

/**
 * joint → weekday → day → ball → count
 *
 * We only include selected weekdays.
 * If a specific day is selected, we keep only that day; otherwise all days.
 */
function buildFilteredJoint(joint, selectedWeekdays, selectedDay, selectedBall) {
  const result = {};

  selectedWeekdays.forEach((weekday) => {
    const weekdayJoint = joint[weekday] || {};
    const filteredDays = {};

    if (selectedDay !== null) {
      const ballMap = weekdayJoint[selectedDay] || {};
      filteredDays[selectedDay] = filterBallLayer(ballMap, selectedBall);
    } else {
      for (const [day, ballMap] of Object.entries(weekdayJoint)) {
        filteredDays[day] = filterBallLayer(ballMap, selectedBall);
      }
    }

    result[weekday] = filteredDays;
  });

  return result;
}

/**
 * Reduce joint (weekday→day→ball→count) into:
 *
 * heatmap[ball][day] = total count across selected weekdays
 *
 * This is exactly what the Ball × Day-of-Month heatmap needs.
 */
function buildHeatmapFromJoint(filteredJoint) {
  const heatmap = {};

  if (!filteredJoint || typeof filteredJoint !== "object") {
    return heatmap;
  }

  for (const weekday of Object.keys(filteredJoint)) {
    const dayMap = filteredJoint[weekday];

    // Skip if weekday has no days
    if (!dayMap || typeof dayMap !== "object") continue;

    for (const day of Object.keys(dayMap)) {
      const ballMap = dayMap[day];

      // Skip if day has no balls
      if (!ballMap || typeof ballMap !== "object") continue;

      for (const [ball, count] of Object.entries(ballMap)) {
        if (!heatmap[ball]) heatmap[ball] = {};
        heatmap[ball][day] = (heatmap[ball][day] || 0) + count;
      }
    }
  }

  return heatmap;
}

/**
 * Filter a ball → count map by selectedBall.
 */
function filterBallLayer(ballMap, selectedBall) {
  if (selectedBall === null) return ballMap;
  if (!ballMap || typeof ballMap !== "object") return {};

  return {
    [selectedBall]: ballMap[selectedBall] ?? 0,
  };
}