# lottery/management/commands/ingest_lottery.py
from datetime import date
from django.core.management.base import BaseCommand, CommandError

from lottery.ingestion import  (
    ingest_megamillions_between_dates,
    ingest_megamillions_latest,
    ingest_powerball_between_dates,
    ingest_powerball_latest,
)


class Command(BaseCommand):
    help = "Ingest lottery data (Mega Millions, Powerball, or both)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--mode",
            choices=["backfill", "latest", "reconcile"],
            required=True,
            help="Ingestion mode: latest (no dates), backfill/reconcile (requires dates).",
        )
        parser.add_argument(
            "--lottery",
            choices=["megamillions", "powerball", "both"],
            default="both",
            help="Which lottery to ingest.",
        )
        parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
        parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")

    def handle(self, *args, **options):
        mode = options["mode"]
        lottery = options["lottery"]
        start = options.get("start")
        end = options.get("end")

        self.stdout.write(self.style.NOTICE(f"Mode: {mode} | Lottery: {lottery}"))

        # Validate date requirements
        if mode in ["backfill", "reconcile"]:
            if not start or not end:
                raise CommandError(
                    "Backfill and reconcile modes require --start and --end."
                )
            try:
                start_date = date.fromisoformat(start)
                end_date = date.fromisoformat(end)
            except ValueError:
                raise CommandError("Dates must be in YYYY-MM-DD format.")

            self._run_between(lottery, start_date, end_date)

        elif mode == "latest":
            self._run_latest(lottery)

        self.stdout.write(self.style.SUCCESS("Done!"))

    # -----------------------------
    # Helpers
    # -----------------------------

    def _run_latest(self, lottery):
        if lottery in ["powerball", "both"]:
            self.stdout.write("-> Ingesting latest Powerball draw")
            ingest_powerball_latest()

        if lottery in ["megamillions", "both"]:
            self.stdout.write("-> Ingesting latest Mega Millions draw")
            ingest_megamillions_latest()

    def _run_between(self, lottery, start_date, end_date):
        if lottery in ["powerball", "both"]:
            self.stdout.write(
                f"-> Ingesting Powerball draws between {start_date} and {end_date}"
            )
            ingest_powerball_between_dates(start_date, end_date)

        if lottery in ["megamillions", "both"]:
            self.stdout.write(
                f"-> Ingesting Mega Millions draws between {start_date} and {end_date}"
            )
            ingest_megamillions_between_dates(start_date, end_date)