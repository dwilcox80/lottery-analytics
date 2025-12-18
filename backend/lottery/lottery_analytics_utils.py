"""
Lottery app utility file for analytical heavy lifting
"""

from datetime import timedelta, datetime
from django.utils import timezone


def compute_summary(draws_list, main_range, bonus_range):
    """
    Efficiently computes hottest balls, overdue balls, and recent draws
    using the precomputed draws_list from with_joint_counts().

    draws_list: [
        { "date": "2025-12-17", "main": [...], "bonus": 17 },
        ...
    ]

    main_range: iterable of valid main ball numbers
    bonus_range: iterable of valid bonus ball numbers
    """

    today = timezone.now().date()

    # Precompute date cutoffs
    ranges = {
        30: today - timedelta(days=30),
        60: today - timedelta(days=60),
        90: today - timedelta(days=90),
    }

    # Initialize counters
    hottest_main = {30: {}, 60: {}, 90: {}}
    hottest_bonus = {30: {}, 60: {}, 90: {}}

    # Track last-seen dates
    last_seen_main = {str(n): None for n in main_range}
    last_seen_bonus = {str(n): None for n in bonus_range}


    # Iterate through precomputed draws
    # Iterate through precomputed draws
    for rec in draws_list:
        # Convert ISO date string to date object
        date = datetime.fromisoformat(rec["date"]).date()
        main = rec["main"]
        bonus = str(rec["bonus"])

        # Skip historical bonus values outside the current valid range
        if bonus not in last_seen_bonus:
            continue

        # Track last seen
        for m in main:
            last_seen_main[str(m)] = date
        last_seen_bonus[bonus] = date

        # Count hottest in each range
        for days, cutoff in ranges.items():
            if date >= cutoff:
                for m in main:
                    key = str(m)
                    hottest_main[days][key] = hottest_main[days].get(key, 0) + 1
                hottest_bonus[days][bonus] = hottest_bonus[days].get(bonus, 0) + 1

    # Sort hottest balls (top 5)
    hottest_main_sorted = {
        days: sorted(counts, key=counts.get, reverse=True)[:5]
        for days, counts in hottest_main.items()
    }

    hottest_bonus_sorted = {
        days: sorted(counts, key=counts.get, reverse=True)[:5]
        for days, counts in hottest_bonus.items()
    }

    # Compute raw overdue lists
    raw_overdue_main = {
        days: [
            n for n, last in last_seen_main.items()
            if last is not None and (today - last).days > days
        ]
        for days in ranges
    }

    raw_overdue_bonus = {
        days: [
            n for n, last in last_seen_bonus.items()
            if last is not None and (today - last).days > days
        ]
        for days in ranges
    }

    # Deduplicate: assign each ball to the highest overdue bucket only
    overdue_main = {30: [], 60: [], 90: []}
    overdue_bonus = {30: [], 60: [], 90: []}

    for n in last_seen_main:
        if n in raw_overdue_main[90]:
            overdue_main[90].append(n)
        elif n in raw_overdue_main[60]:
            overdue_main[60].append(n)
        elif n in raw_overdue_main[30]:
            overdue_main[30].append(n)

    for n in last_seen_bonus:
        if n in raw_overdue_bonus[90]:
            overdue_bonus[90].append(n)
        elif n in raw_overdue_bonus[60]:
            overdue_bonus[60].append(n)
        elif n in raw_overdue_bonus[30]:
            overdue_bonus[30].append(n)

    # Last 10 draws (already sorted by date in manager)
    recent = draws_list[-10:]

    return {
        "hottest_main": hottest_main_sorted,
        "hottest_bonus": hottest_bonus_sorted,
        "overdue_main": overdue_main,
        "overdue_bonus": overdue_bonus,
        "recent_draws": recent,
    }
