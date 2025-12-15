from collections import defaultdict
from django.db import models


class DrawAnalyticsQuerySet(models.QuerySet):
    def _ball_range(self):
        """
        Returns the valid main ball range for the lottery
        """
        model_name = self.model.__name__
        if model_name == "PowerBallDraw":
            return range(1, 70)
        elif model_name == "MegaMillionsDraw":
            return range(1, 71)
        else:
            return []

    def with_joint_counts(self):
        weekday_counts = defaultdict(lambda: defaultdict(int))
        day_counts = defaultdict(lambda: defaultdict(int))
        joint_counts = defaultdict(
            lambda: defaultdict(lambda: defaultdict(int))
        )

        all_weekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        all_days = [str(d) for d in range(1,32)]
        all_balls = [str(b) for b in self._ball_range()]

        # Pre-initialize all to zero
        for w in all_weekdays:
            for d in all_days:
                for b in all_balls:
                    joint_counts[w][d][b] = 0

        for draw in self:
            date = draw.draw_date
            weekday = date.strftime('%A')
            day = str(date.day)

            for ball in draw.get_main_balls():
                b = str(ball)
                weekday_counts[weekday][b] += 1
                day_counts[day][b] += 1
                joint_counts[weekday][day][b] += 1

        return {
            'weekday': weekday_counts,
            'day_of_month': day_counts,
            'joint': joint_counts,
        }
