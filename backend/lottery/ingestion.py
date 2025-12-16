# lottery/ingestion.py
import requests
from datetime import date
from django.conf import settings

from .models import MegaMillionsDraw, PowerBallDraw


if not settings.LOTTERYDATA_API_KEY:
    raise RuntimeError("You need to set LOTTERYDATA_API_KEY environment variable")


BASE_URL = "https://api.lotterydata.io/"
HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "x-api-key": settings.LOTTERYDATA_API_KEY,
}


def _fetch(endpoint: str):
    """Internal helper to fetch JSON from lotterydata.io."""
    url = f"{BASE_URL}{endpoint}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    payload = response.json()
    return payload.get("data", [])


def _ingest_draws(draws, model, field_map):
    """
    Generic ingestion helper.
    - draws: list of dicts from API
    - model: Django model class
    - field_map: mapping of model fields -> API fields
    """
    for draw in draws:
        defaults = {
            model_field: draw.get(api_field)
            for model_field, api_field in field_map.items()
        }

        model.objects.update_or_create(
            draw_date=draw["drawing_date"],
            defaults=defaults,
        )


# -----------------------------
# Mega Millions
# -----------------------------

MEGA_FIELD_MAP = {
    "ball_1": "ball1",
    "ball_2": "ball2",
    "ball_3": "ball3",
    "ball_4": "ball4",
    "ball_5": "ball5",
    "bonus_ball": "megaball",
    "megaplier": "megaplier",
}


def ingest_megamillions_between_dates(start: date, end: date):
    endpoint = f"megamillions/v1/betweendates/{start}/{end}"
    draws = _fetch(endpoint)
    _ingest_draws(draws, MegaMillionsDraw, MEGA_FIELD_MAP)


def ingest_megamillions_latest():
    endpoint = "megamillions/v1/latest"
    draws = _fetch(endpoint)
    if draws:
        _ingest_draws(draws, MegaMillionsDraw, MEGA_FIELD_MAP)


# -----------------------------
# Powerball
# -----------------------------

POWERBALL_FIELD_MAP = {
    "ball_1": "ball1",
    "ball_2": "ball2",
    "ball_3": "ball3",
    "ball_4": "ball4",
    "ball_5": "ball5",
    "bonus_ball": "powerball",
    "multiplier": "multiplier",
}


def ingest_powerball_between_dates(start: date, end: date):
    endpoint = f"powerball/v1/betweendates/{start}/{end}"
    draws = _fetch(endpoint)
    _ingest_draws(draws, PowerBallDraw, POWERBALL_FIELD_MAP)


def ingest_powerball_latest():
    endpoint = "powerball/v1/latest"
    draws = _fetch(endpoint)
    if draws:
        _ingest_draws(draws, PowerBallDraw, POWERBALL_FIELD_MAP)