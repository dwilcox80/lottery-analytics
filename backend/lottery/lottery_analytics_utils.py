"""
Utility file to help with analytic heavy lifting
"""
from datetime import timedelta
from django.utils import timezone

def compute_summary(draws):
    today = timezone.now().date()

    # Convert queryset to list of dicts for easier processing
    records = list(draws.values("draw_date", "main", "bonus"))

    # Precompute date ranges
    ranges = {
        30: today - timedelta(days=30),
        60: today - timedelta(days=60),
        90: today - timedelta(days=90),
    }

    # Initialize counters
    hottest_main = {30: {}, 60: {}, 90: {}}
    hottest_bonus = {30: {}, 60: {}, 90: {}}

    last_seen_main = {n: None for n in range(1, 70)}
    last_seen_bonus = {n: None for n in range(1, 27)}

    # Iterate through draws
    for rec in records:
        date = rec["draw_date"]
        main = rec["main"]
        bonus = rec["bonus"]

        # Track last seen
        for m in main:
            last_seen_main[m] = date
        last_seen_bonus[bonus] = date

        # Count hottest in each range
        for days, cutoff in ranges.items():
            if date >= cutoff:
                for m in main:
                    hottest_main[days][m] = hottest_main[days].get(m, 0) + 1
                hottest_bonus[days][bonus] = hottest_bonus[days].get(bonus, 0) + 1

    # Sort hottest
    hottest_main_sorted = {
        days: sorted(counts, key=counts.get, reverse=True)[:5]
        for days, counts in hottest_main.items()
    }

    hottest_bonus_sorted = {
        days: sorted(counts, key=counts.get, reverse=True)[:5]
        for days, counts in hottest_bonus.items()
    }

    # Overdue
    overdue_main = {
        days: [
            n for n, last in last_seen_main.items()
            if last is not None and (today - last).days > days
        ]
        for days in ranges
    }

    overdue_bonus = {
        days: [
            n for n, last in last_seen_bonus.items()
            if last is not None and (today - last).days > days
        ]
        for days in ranges
    }

    # Last 10 draws
    recent = [
        {
            "date": rec["draw_date"],
            "main": rec["main"],
            "bonus": rec["bonus"],
        }
        for rec in records[-10:]
    ]

    return {
        "hottest_main": hottest_main_sorted,
        "hottest_bonus": hottest_bonus_sorted,
        "overdue_main": overdue_main,
        "overdue_bonus": overdue_bonus,
        "recent_draws": recent,
    }
