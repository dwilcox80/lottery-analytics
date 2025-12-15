from django.db import models
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


class PowerBallDraw(BaseDraw):
    objects = DrawAnalyticsQuerySet.as_manager()
    multiplier = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Powerball Draw"
        verbose_name_plural = "Powerball Draws"


class MegaMillionsDraw(BaseDraw):
    objects = DrawAnalyticsQuerySet.as_manager()
    megaplier = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Mega Millions Draw"
        verbose_name_plural = "Mega Millions Draws"

