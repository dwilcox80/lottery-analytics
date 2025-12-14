from datetime import date
from django.core.management.base import BaseCommand, CommandError
from lottery.ingestion import ingest_megamillions_between_dates, ingest_megamillions_latest, \
    ingest_powerball_between_dates, ingest_powerball_latest


class Command(BaseCommand):
    help = 'Ingests latest lottery data results from Megamillions and Powerball into database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mode',
            choices=['backfill', 'latest', 'reconcile'],
            required=True,
            type=str,
            help='Ingestion mode'
        )
        parser.add_argument(
            '--lottery',
            choices=['megamillions', 'powerball', 'both'],
            default='both',
            type=str,
            help='Which lottery game to ingest'
        )
        parser.add_argument('--start', required=True, type=str)
        parser.add_argument('--end', required=True, type=str)

    def handle(self, *args, **options):
        mode = options['mode']
        lottery = options['lottery']
        start = options.get('start')
        end = options.get('end')

        if mode in ['backfill', 'reconcile']:
            if not start or not end:
                raise CommandError('Backfill and reconcile modes require the --start and --end flags')

        self.stdout.write(
            self.style.NOTICE(f'Mode: {mode} | Lottery: {lottery}')
        )

        if mode == 'latest':
            self._run_latest(lottery)
        else:
            start_date = date.fromisoformat(start)
            end_date = date.fromisoformat(end)
            self._run_between(lottery, start_date, end_date)

        self.stdout.write(self.style.SUCCESS('Done!'))

    def _run_latest(self, lottery):
        if lottery in ['powerball', 'both']:
            self.stdout.write("-> Ingesting Powerball latest data")
            ingest_powerball_latest()
        if lottery in ['megamillions', 'both']:
            self.stdout.write("-> Ingesting Megamillions latest data")
            ingest_megamillions_latest()

    def _run_between(self, lottery, start_date, end_date):
        if lottery in ['powerball', 'both']:
            self.stdout.write(f"-> Ingesting Powerball data between {start_date} and {end_date}")
            ingest_powerball_between_dates(start_date, end_date)
        if lottery in ['megamillions', 'both']:
            self.stdout.write(f"-> Ingesting Megamillions data between {start_date} and {end_date}")
            ingest_megamillions_between_dates(start_date, end_date)
