# lottery/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import DrawAnalyticsQuerySet


class BaseDraw(models.Model):
    draw_date = models.DateField(db_index=True)
    ball_1 = models.PositiveSmallIntegerField()
    ball_2 = models.PositiveSmallIntegerField()
    ball_3 = models.PositiveSmallIntegerField()
    ball_4 = models.PositiveSmallIntegerField()
    ball_5 = models.PositiveSmallIntegerField()
    bonus_ball = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Default; subclasses must override
    BALL_RANGE = range(1, 1)
    BONUS_BALL_RANGE = range(1, 1)

    class Meta:
        abstract = True
        ordering = ["-draw_date"]

    def get_main_balls(self):
        return [
            self.ball_1,
            self.ball_2,
            self.ball_3,
            self.ball_4,
            self.ball_5,
        ]

    def __str__(self):
        return f"{self.__class__.__name__} {self.draw_date}"


class BasePositionTracker(models.Model):
    class PositionChoices(models.TextChoices):
        """
        Model choice fields for analytical position comparison.
        """
        OVERDUE30 = "0D-30", _("Overdue - Drawn 30+ Days Ago"),
        OVERDUE60 = "OD-60", _("Overdue - Drawn 60+ Days Ago"),
        OVERDUE90 = "OD-90", _("Overdue - Drawn 90+ Days Ago"),
        HOT30 = "HOT-30", _("Hot - Most Drawn Last 30 Days"),
        HOT60 = "HOT-60", _("Hot - Most Drawn Last 60 Days"),
        HOT90 = "HOT-90", _("Hot - Most Drawn Last 90 Days"),
        ON_CHART_LOW = "ON-LOW", _("On Chart for Draw Date, Low Count"),
        ON_CHART_MID = "ON-MID", _("On Chart for Draw Date, Mid Count"),
        ON_CHART_HIGH = "ON-HIGH", _("On Chart for Draw Date, High Count"),
        UNCATEGORIZED = "UNCATEGORIZED", _("Previously Uncategorized for Draw Date"),

    draw_date = models.DateField(db_index=True)
    ball_1 = models.CharField(max_length=15, choices=PositionChoices, default=PositionChoices.UNCATEGORIZED)
    ball_2 = models.CharField(max_length=15, choices=PositionChoices, default=PositionChoices.UNCATEGORIZED)
    ball_3 = models.CharField(max_length=15, choices=PositionChoices, default=PositionChoices.UNCATEGORIZED)
    ball_4 = models.CharField(max_length=15, choices=PositionChoices, default=PositionChoices.UNCATEGORIZED)
    ball_5 = models.CharField(max_length=15, choices=PositionChoices, default=PositionChoices.UNCATEGORIZED)
    bonus_ball = models.CharField(max_length=15, choices=PositionChoices, default=PositionChoices.UNCATEGORIZED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ["-draw_date"]

    def get_main_balls(self):
        return [
            self.ball_1,
            self.ball_2,
            self.ball_3,
            self.ball_4,
            self.ball_5,
        ]

    def __str__(self):
        return f"{self.__class__.__name__} {self.draw_date}"


class MegaMillionsDraw(BaseDraw):
    objects = DrawAnalyticsQuerySet.as_manager()

    # Mega Millions: main balls 1–70
    BALL_RANGE = range(1, 71)
    # Mega Millions: mega balls 1-24
    BONUS_BALL_RANGE = range(1, 25)

    megaplier = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Mega Millions Draw"
        verbose_name_plural = "Mega Millions Draws"


class MegaMillionsDrawPositionTracker(BasePositionTracker):
    class Meta:
        verbose_name = "Mega Millions Draw Position Tracker"
        verbose_name_plural = "Mega Millions Draw Position Tracker"


class PowerBallDraw(BaseDraw):
    objects = DrawAnalyticsQuerySet.as_manager()

    # Powerball: main balls 1–69
    BALL_RANGE = range(1, 70)
    # Powerball: bonus balls 1–26
    BONUS_BALL_RANGE = range(1, 27)

    multiplier = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Powerball Draw"
        verbose_name_plural = "Powerball Draws"


class PowerBallDrawPositionTracker(BasePositionTracker):
    class Meta:
        verbose_name = "Powerball Draw Position Tracker"
        verbose_name_plural = "Powerball Draw Position Tracker"
