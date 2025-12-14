import requests

from django.conf import settings
from datetime import date
from .models import MegaMillionsDraw, PowerBallDraw


if not settings.LOTTERYDATA_API_KEY:
    raise RuntimeError('You need to set LOTTERYDATA_API_KEY environment variable')

BASE_URL = "https://api.lotterydata.io/"
MEGAMILLIONS_URL_FRAGMENT = BASE_URL + "megamillions/v1/"
POWERBALL_URL_FRAGMENT = BASE_URL + "powerball/v1/"

HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "x-api-key": settings.LOTTERYDATA_API_KEY,
}


def ingest_megamillions_between_dates(start: date, end: date):
    between_dates_endpoint = f"betweendates/{start}/{end}"
    url = f"{MEGAMILLIONS_URL_FRAGMENT}{between_dates_endpoint}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()

    payload = response.json()
    draws = payload.get("data", [])

    for draw in draws:
        MegaMillionsDraw.objects.update_or_create(
            draw_date = draw["drawing_date"],
            defaults = {
                "ball_1": draw["ball1"],
                "ball_2": draw["ball2"],
                "ball_3": draw["ball3"],
                "ball_4": draw["ball4"],
                "ball_5": draw["ball5"],
                "bonus_ball": draw["megaball"],
                "megaplier": draw.get("megaplier"),
            }
        )


def ingest_megamillions_latest():
    latest_endpoint = "latest/"
    url = f"{MEGAMILLIONS_URL_FRAGMENT}{latest_endpoint}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()

    payload = response.json()
    draws = payload.get("data", [])

    if not draws:
        return

    for draw in draws:
        MegaMillionsDraw.objects.update_or_create(
            draw_date=draw["drawing_date"],
            defaults={
                "ball_1": draw["ball1"],
                "ball_2": draw["ball2"],
                "ball_3": draw["ball3"],
                "ball_4": draw["ball4"],
                "ball_5": draw["ball5"],
                "bonus_ball": draw["megaball"],
                "megaplier": draw.get("megaplier"),
            }
        )


def ingest_powerball_between_dates(start: date, end: date):
    between_dates_endpoint = f"betweendates/{start}/{end}"
    url = f"{POWERBALL_URL_FRAGMENT}{between_dates_endpoint}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()

    payload = response.json()
    draws = payload.get("data", [])

    for draw in draws:
        PowerBallDraw.objects.update_or_create(
            draw_date=draw["drawing_date"],
            defaults={
                "ball_1": draw["ball1"],
                "ball_2": draw["ball2"],
                "ball_3": draw["ball3"],
                "ball_4": draw["ball4"],
                "ball_5": draw["ball5"],
                "bonus_ball": draw["powerball"],
                "multiplier": draw.get("multiplier"),
            }
        )


def ingest_powerball_latest():
    latest_endpoint = "latest/"
    url = f"{POWERBALL_URL_FRAGMENT}{latest_endpoint}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()

    payload = response.json()
    draws = payload.get("data", [])

    if not draws:
        return

    for draw in draws:
        PowerBallDraw.objects.update_or_create(
            draw_date=draw["drawing_date"],
            defaults={
                "ball_1": draw["ball1"],
                "ball_2": draw["ball2"],
                "ball_3": draw["ball3"],
                "ball_4": draw["ball4"],
                "ball_5": draw["ball5"],
                "bonus_ball": draw["powerball"],
                "multiplier": draw.get("multiplier"),
            }
        )
