# backend/lottery/tests/test_ingestion.py
from unittest.mock import patch
from django.test import TestCase
from datetime import date

from ..ingestion import (
    ingest_megamillions_between_dates,
    ingest_megamillions_latest,
    ingest_powerball_between_dates,
    ingest_powerball_latest,
)
from ..models import MegaMillionsDraw, PowerBallDraw


MOCK_MEGA_DRAW = [{
    "drawing_date": "2024-01-01",
    "ball1": 1,
    "ball2": 2,
    "ball3": 3,
    "ball4": 4,
    "ball5": 5,
    "megaball": 10,
    "megaplier": 3,
}]

MOCK_POWERBALL_DRAW = [{
    "drawing_date": "2024-02-01",
    "ball1": 10,
    "ball2": 20,
    "ball3": 30,
    "ball4": 40,
    "ball5": 50,
    "powerball": 15,
    "multiplier": 2,
}]


class IngestionTests(TestCase):

    @patch("lottery.ingestion._fetch")
    def test_ingest_megamillions_between_dates(self, mock_fetch):
        mock_fetch.return_value = MOCK_MEGA_DRAW

        ingest_megamillions_between_dates(date(2024, 1, 1), date(2024, 1, 31))

        draw = MegaMillionsDraw.objects.get(draw_date="2024-01-01")
        self.assertEqual(draw.ball_1, 1)
        self.assertEqual(draw.bonus_ball, 10)
        self.assertEqual(draw.megaplier, 3)

    @patch("lottery.ingestion._fetch")
    def test_ingest_megamillions_latest(self, mock_fetch):
        mock_fetch.return_value = MOCK_MEGA_DRAW

        ingest_megamillions_latest()

        self.assertEqual(MegaMillionsDraw.objects.count(), 1)

    @patch("lottery.ingestion._fetch")
    def test_ingest_powerball_between_dates(self, mock_fetch):
        mock_fetch.return_value = MOCK_POWERBALL_DRAW

        ingest_powerball_between_dates(date(2024, 2, 1), date(2024, 2, 28))

        draw = PowerBallDraw.objects.get(draw_date="2024-02-01")
        self.assertEqual(draw.ball_1, 10)
        self.assertEqual(draw.bonus_ball, 15)
        self.assertEqual(draw.multiplier, 2)

    @patch("lottery.ingestion._fetch")
    def test_ingest_powerball_latest(self, mock_fetch):
        mock_fetch.return_value = MOCK_POWERBALL_DRAW

        ingest_powerball_latest()

        self.assertEqual(PowerBallDraw.objects.count(), 1)

    @patch("lottery.ingestion._fetch")
    def test_ingestion_is_idempotent(self, mock_fetch):
        mock_fetch.return_value = MOCK_MEGA_DRAW

        ingest_megamillions_latest()
        ingest_megamillions_latest()

        # Should not duplicate
        self.assertEqual(MegaMillionsDraw.objects.count(), 1)