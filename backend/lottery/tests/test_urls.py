# backend/lottery/tests/test_urls.py
from django.urls import resolve
from ..views import LotteryAnalyticsView


def test_analytics_url_resolves():
    match = resolve("/api/lottery/analytics/")
    assert match.func.view_class is LotteryAnalyticsView