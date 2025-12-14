from django.db.models import Count, IntegerField, Value
from django.db.models.functions import ExtractWeekDay, ExtractDay
from itertools import chain


BALL_FIELDS = ['ball_1', 'ball_2', 'ball_3', 'ball_4', 'ball_5', 'bonus_ball']


def weekday_frequency(qs):
    """
    Returns: {
        weekday (1-7): { ball_number: count }
    }
    """
    results = {}

    qs = qs.annotate(weekday=ExtractWeekDay("draw_date"))

    for field in BALL_FIELDS:
        rows = (
            qs.values("weekday", field)
            .annotate(count=Count(field))
            .order_by()
        )
        for row in rows:
            wd = row['weekday']
            ball = row[field]
            if ball is None:
                continue

            results.setdefault(wd, {})
            results[wd][ball] = results[wd].get(ball, 0) + row['count']

    return results

def day_of_the_month_frequency(qs):
    """
    Returns:
    {
        day (1-31): { ball_number: count }
    }
    """
    results = {}

    qs = qs.annotate(day=ExtractDay("draw_date"))

    for field in BALL_FIELDS:
        rows = (
            qs.values("day", field)
            .annotate(count=Count(field))
            .order_by()
        )
        for row in rows:
            day = row['day']
            ball = row[field]
            if ball is None:
                continue

            results.setdefault(day, {})
            results[day][ball] = results[day].get(ball, 0) + row['count']

    return results
