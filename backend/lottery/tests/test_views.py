# backend/lottery/tests/test_views.py
import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

from lottery.views import LotteryAnalyticsView
from lottery.models import PowerBallDraw


class LotteryAnalyticsViewTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        User = get_user_model()
        self.user = User.objects.create_user(
            username="tester",
            password="password123",
            is_active=True
        )

        PowerBallDraw.objects.create(
            draw_date=datetime.date(2024, 1, 1),
            ball_1=1, ball_2=2, ball_3=3, ball_4=4, ball_5=5,
            bonus_ball=10
        )

    def test_missing_lottery_param_returns_400(self):
        request = self.factory.get("/api/lottery/analytics/")
        force_authenticate(request, user=self.user)
        response = LotteryAnalyticsView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_invalid_lottery_param_returns_400(self):
        request = self.factory.get("/api/lottery/analytics/?lottery=invalid")
        force_authenticate(request, user=self.user)
        response = LotteryAnalyticsView.as_view()(request)
        self.assertEqual(response.status_code, 400)

    def test_unsupported_method_returns_405(self):
        request = self.factory.post("/api/lottery/analytics/")
        force_authenticate(request, user=self.user)
        response = LotteryAnalyticsView.as_view()(request)
        self.assertEqual(response.status_code, 405)

    def test_valid_request_returns_200(self):
        request = self.factory.get("/api/lottery/analytics/?lottery=powerball")
        force_authenticate(request, user=self.user)
        response = LotteryAnalyticsView.as_view()(request)
        self.assertEqual(response.status_code, 200)
