# backend/lottery/tests/test_models.py
from django.test import TestCase
from ..models import PowerBallDraw, MegaMillionsDraw
import datetime


class ModelTests(TestCase):

    def test_powerball_str(self):
        draw = PowerBallDraw.objects.create(
            draw_date=datetime.date(2024, 1, 1),
            ball_1=1, ball_2=2, ball_3=3, ball_4=4, ball_5=5,
            bonus_ball=10
        )
        self.assertEqual(str(draw), "PowerBallDraw 2024-01-01")

    def test_megamillions_str(self):
        draw = MegaMillionsDraw.objects.create(
            draw_date=datetime.date(2024, 1, 1),
            ball_1=10, ball_2=20, ball_3=30, ball_4=40, ball_5=50,
            bonus_ball=5
        )
        self.assertEqual(str(draw), "MegaMillionsDraw 2024-01-01")

    def test_ball_range_powerball(self):
        self.assertEqual(PowerBallDraw.BALL_RANGE.start, 1)
        self.assertEqual(PowerBallDraw.BALL_RANGE.stop, 70)

    def test_ball_range_megamillions(self):
        self.assertEqual(MegaMillionsDraw.BALL_RANGE.start, 1)
        self.assertEqual(MegaMillionsDraw.BALL_RANGE.stop, 71)