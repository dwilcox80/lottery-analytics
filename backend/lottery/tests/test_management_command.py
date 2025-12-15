# backend/lottery/tests/test_management_command.py
from unittest.mock import patch
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from datetime import date


class IngestLotteryCommandTests(TestCase):

    @patch("lottery.management.commands.ingest_lottery.ingest_powerball_latest")
    @patch("lottery.management.commands.ingest_lottery.ingest_megamillions_latest")
    def test_latest_mode_both(self, mock_mega, mock_power):
        call_command("ingest_lottery", mode="latest", lottery="both")

        mock_power.assert_called_once()
        mock_mega.assert_called_once()

    @patch("lottery.management.commands.ingest_lottery.ingest_powerball_latest")
    def test_latest_mode_powerball_only(self, mock_power):
        call_command("ingest_lottery", mode="latest", lottery="powerball")

        mock_power.assert_called_once()

    @patch("lottery.management.commands.ingest_lottery.ingest_megamillions_latest")
    def test_latest_mode_megamillions_only(self, mock_mega):
        call_command("ingest_lottery", mode="latest", lottery="megamillions")

        mock_mega.assert_called_once()

    def test_backfill_requires_dates(self):
        with self.assertRaises(CommandError):
            call_command("ingest_lottery", mode="backfill", lottery="both")

    def test_invalid_date_format(self):
        with self.assertRaises(CommandError):
            call_command(
                "ingest_lottery",
                mode="backfill",
                lottery="both",
                start="2024/01/01",
                end="2024-01-31",
            )

    @patch("lottery.management.commands.ingest_lottery.ingest_powerball_between_dates")
    @patch("lottery.management.commands.ingest_lottery.ingest_megamillions_between_dates")
    def test_backfill_calls_correct_ingestion(self, mock_mega, mock_power):
        call_command(
            "ingest_lottery",
            mode="backfill",
            lottery="both",
            start="2024-01-01",
            end="2024-01-31",
        )

        mock_power.assert_called_once_with(date(2024, 1, 1), date(2024, 1, 31))
        mock_mega.assert_called_once_with(date(2024, 1, 1), date(2024, 1, 31))