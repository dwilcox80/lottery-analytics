# backend/lottery/tests/test_analytics.py
import datetime
from django.test import TestCase
from ..models import PowerBallDraw, MegaMillionsDraw


class PowerBallAnalyticsTests(TestCase):
    def setUp(self):
        # Create predictable test data
        # Two Powerball draws:
        # - Monday, 1st of month
        # - Wednesday, 1st of month
        PowerBallDraw.objects.create(
            draw_date=datetime.date(2024, 1, 1),  # Monday, 1st
            ball_1=1, ball_2=2, ball_3=3, ball_4=4, ball_5=5,
            bonus_ball=10
        )
        PowerBallDraw.objects.create(
            draw_date=datetime.date(2024, 5, 1),  # Wednesday, 1st
            ball_1=1, ball_2=1, ball_3=2, ball_4=3, ball_5=5,
            bonus_ball=20
        )

    def test_weekday_counts(self):
        data = PowerBallDraw.objects.with_joint_counts()
        weekday = data["weekday"]

        # Monday draw had balls 1–5 once each
        self.assertEqual(weekday["Monday"]["1"], 1)
        self.assertEqual(weekday["Monday"]["5"], 1)

        # Wednesday draw had ball 1 twice, ball 2 once, ball 3 once, ball 5 once
        self.assertEqual(weekday["Wednesday"]["1"], 2)
        self.assertEqual(weekday["Wednesday"]["2"], 1)
        self.assertEqual(weekday["Wednesday"]["5"], 1)

    def test_day_of_month_counts(self):
        data = PowerBallDraw.objects.with_joint_counts()
        day = data["day_of_month"]

        # Both draws were on the 1st
        # Total balls on the 1st:
        # Draw 1: 1,2,3,4,5
        # Draw 2: 1,1,2,3,5
        # So ball 1 appears 3 times on the 1st
        self.assertEqual(day["1"]["1"], 3)
        self.assertEqual(day["1"]["5"], 2)

    def test_joint_counts(self):
        data = PowerBallDraw.objects.with_joint_counts()
        joint = data["joint"]

        # Monday + 1st
        self.assertEqual(joint["Monday"]["1"]["1"], 1)
        self.assertEqual(joint["Monday"]["1"]["5"], 1)

        # Wednesday + 1st
        self.assertEqual(joint["Wednesday"]["1"]["1"], 2)
        self.assertEqual(joint["Wednesday"]["1"]["5"], 1)

    def test_full_matrix_exists(self):
        data = PowerBallDraw.objects.with_joint_counts()

        # Ensure all weekdays exist
        for weekday in [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"
        ]:
            self.assertIn(weekday, data["weekday"])

        # Ensure all days 1–31 exist
        for d in range(1, 32):
            self.assertIn(str(d), data["day_of_month"])

        # Ensure all balls in range exist
        for b in PowerBallDraw.BALL_RANGE:
            self.assertIn(str(b), data["weekday"]["Monday"])


class MegaMillionsAnalyticsTests(TestCase):
    def setUp(self):
        # Two Mega Millions draws:
        # - Tuesday, 1st
        # - Friday, 1st
        MegaMillionsDraw.objects.create(
            draw_date=datetime.date(2024, 10, 1),  # Tuesday
            ball_1=10, ball_2=20, ball_3=30, ball_4=40, ball_5=50,
            bonus_ball=5
        )
        MegaMillionsDraw.objects.create(
            draw_date=datetime.date(2024, 11, 1),  # Friday
            ball_1=10, ball_2=10, ball_3=20, ball_4=30, ball_5=50,
            bonus_ball=15
        )

    def test_weekday_counts(self):
        data = MegaMillionsDraw.objects.with_joint_counts()
        weekday = data["weekday"]

        # Tuesday draw: 10,20,30,40,50
        self.assertEqual(weekday["Tuesday"]["10"], 1)
        self.assertEqual(weekday["Tuesday"]["50"], 1)

        # Friday draw: 10,10,20,30,50
        self.assertEqual(weekday["Friday"]["10"], 2)
        self.assertEqual(weekday["Friday"]["20"], 1)
        self.assertEqual(weekday["Friday"]["50"], 1)

    def test_day_of_month_counts(self):
        data = MegaMillionsDraw.objects.with_joint_counts()
        day = data["day_of_month"]

        # Both draws were on the 1st
        # Combined:
        # Draw 1: 10,20,30,40,50
        # Draw 2: 10,10,20,30,50
        self.assertEqual(day["1"]["10"], 3)
        self.assertEqual(day["1"]["20"], 2)
        self.assertEqual(day["1"]["50"], 2)

    def test_joint_counts(self):
        data = MegaMillionsDraw.objects.with_joint_counts()
        joint = data["joint"]

        # Tuesday + 1st
        self.assertEqual(joint["Tuesday"]["1"]["10"], 1)
        self.assertEqual(joint["Tuesday"]["1"]["50"], 1)

        # Friday + 1st
        self.assertEqual(joint["Friday"]["1"]["10"], 2)
        self.assertEqual(joint["Friday"]["1"]["50"], 1)

    def test_full_matrix_exists(self):
        data = MegaMillionsDraw.objects.with_joint_counts()

        # All weekdays
        for weekday in [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"
        ]:
            self.assertIn(weekday, data["weekday"])

        # All days 1–31
        for d in range(1, 32):
            self.assertIn(str(d), data["day_of_month"])

        # All balls in Mega Millions range (1–70)
        for b in MegaMillionsDraw.BALL_RANGE:
            self.assertIn(str(b), data["weekday"]["Monday"])
