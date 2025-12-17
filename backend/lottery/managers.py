# lottery/managers.py
from collections import defaultdict
from django.db import models


class DrawAnalyticsQuerySet(models.QuerySet):
    def _ball_range(self):
        """
        Returns the valid main ball range for the lottery model.
        Expects the model to define a BALL_RANGE attribute.
        """
        ball_range = getattr(self.model, "BALL_RANGE", None)
        if ball_range is None:
            return []
        return ball_range

    def with_joint_counts(self):
        weekday_counts = defaultdict(lambda: defaultdict(int))
        day_counts = defaultdict(lambda: defaultdict(int))
        joint_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

        bonus_weekday_counts = defaultdict(lambda: defaultdict(int))
        bonus_day_counts = defaultdict(lambda: defaultdict(int))
        bonus_joint_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

        all_weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        all_days = [str(d) for d in range(1, 32)]
        all_balls = [str(b) for b in self._ball_range()]
        all_bonus = [str(b) for b in getattr(self.model, "BONUS_BALL_RANGE", [])]

        # Pre-init main balls
        for w in all_weekdays:
            for b in all_balls:
                weekday_counts[w][b] = 0
        for d in all_days:
            for b in all_balls:
                day_counts[d][b] = 0
        for w in all_weekdays:
            for d in all_days:
                for b in all_balls:
                    joint_counts[w][d][b] = 0

        # Pre-init bonus balls
        for w in all_weekdays:
            for b in all_bonus:
                bonus_weekday_counts[w][b] = 0
        for d in all_days:
            for b in all_bonus:
                bonus_day_counts[d][b] = 0
        for w in all_weekdays:
            for d in all_days:
                for b in all_bonus:
                    bonus_joint_counts[w][d][b] = 0

        # Collect draws for frontend time-series & co-occurrence
        draws_list = []

        for draw in self.order_by("draw_date"):
            date = draw.draw_date
            weekday = date.strftime("%A")
            day = str(date.day)

            # Main balls
            main_balls = draw.get_main_balls()
            for ball in main_balls:
                b = str(ball)
                if b in all_balls:
                    weekday_counts[weekday][b] += 1
                    day_counts[day][b] += 1
                    joint_counts[weekday][day][b] += 1

            # Bonus ball
            bonus = str(draw.bonus_ball)
            if bonus in all_bonus:
                bonus_weekday_counts[weekday][bonus] += 1
                bonus_day_counts[day][bonus] += 1
                bonus_joint_counts[weekday][day][bonus] += 1

            # Add to draws array
            draws_list.append({
                "date": date.isoformat(),
                "main": main_balls,
                "bonus": draw.bonus_ball,
            })

        def _to_dict(obj):
            if isinstance(obj, defaultdict):
                return {k: _to_dict(v) for k, v in obj.items()}
            if isinstance(obj, dict):
                return {k: _to_dict(v) for k, v in obj.items()}
            return obj

        return {
            "weekday": _to_dict(weekday_counts),
            "day_of_month": _to_dict(day_counts),
            "joint": _to_dict(joint_counts),

            "bonus_weekday": _to_dict(bonus_weekday_counts),
            "bonus_day_of_month": _to_dict(bonus_day_counts),
            "bonus_joint": _to_dict(bonus_joint_counts),

            "draws": draws_list,
        }
