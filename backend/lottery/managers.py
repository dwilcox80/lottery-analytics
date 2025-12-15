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
        """
        Returns a nested dict structure with:
        - weekday: counts of each ball by weekday name
        - day_of_month: counts of each ball by day number (1–31)
        - joint: counts of each ball by (weekday, day_of_month)

        This is designed to be directly consumable by a React frontend.
        """

        # Nested defaultdicts:
        # weekday_counts[weekday][ball] -> int
        weekday_counts = defaultdict(lambda: defaultdict(int))
        # day_counts[day][ball] -> int
        day_counts = defaultdict(lambda: defaultdict(int))
        # joint_counts[weekday][day][ball] -> int
        joint_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

        all_weekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        all_days = [str(d) for d in range(1, 32)]
        all_balls = [str(b) for b in self._ball_range()]

        # Pre-initialize all combinations to zero so the frontend
        # always gets a stable, complete matrix.
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

        # Iterate through draws. If this ever gets huge, you can switch to
        # .iterator() or .values_list() for lower memory footprint.
        for draw in self.iterator():
            date = draw.draw_date
            weekday = date.strftime("%A")  # e.g. "Monday"
            day = str(date.day)            # "1" .. "31"

            for ball in draw.get_main_balls():
                b = str(ball)

                # Skip balls outside the configured range, just in case.
                if b not in all_balls:
                    continue

                weekday_counts[weekday][b] += 1
                day_counts[day][b] += 1
                joint_counts[weekday][day][b] += 1

        def _to_dict(obj):
            """
            Recursively convert defaultdicts to plain dicts
            so DRF/JSON serialization is stable and predictable.
            """
            if isinstance(obj, defaultdict):
                return {k: _to_dict(v) for k, v in obj.items()}
            if isinstance(obj, dict):
                return {k: _to_dict(v) for k, v in obj.items()}
            return obj

        return {
            "weekday": _to_dict(weekday_counts),
            "day_of_month": _to_dict(day_counts),
            "joint": _to_dict(joint_counts),
        }