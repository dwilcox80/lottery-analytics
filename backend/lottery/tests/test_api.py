# backend/lottery/tests/test_api.py
import datetime
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from ..models import PowerBallDraw


class AnalyticsAPITests(APITestCase):
    def setUp(self):
        # Create a user for authentication
        User = get_user_model()
        self.user = User.objects.create_user(
            username="testuser",
            password="password123"
        )

        # JWT token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

        # Add a single draw
        PowerBallDraw.objects.create(
            draw_date=datetime.date(2024, 1, 1),
            ball_1=1, ball_2=2, ball_3=3, ball_4=4, ball_5=5,
            bonus_ball=10
        )

    def test_powerball_analytics_endpoint(self):
        url = "/api/lottery/analytics/?lottery=powerball"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Ensure keys exist
        self.assertIn("weekday", data)
        self.assertIn("day_of_month", data)
        self.assertIn("joint", data)

        # Ensure Monday counts exist
        self.assertIn("Monday", data["weekday"])
        self.assertEqual(data["weekday"]["Monday"]["1"], 1)

    def test_invalid_lottery(self):
        url = "/api/lottery/analytics/?lottery=invalid"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertEqual(
            response.json()["error"]["code"],
            "INVALID_LOTTERY"
        )