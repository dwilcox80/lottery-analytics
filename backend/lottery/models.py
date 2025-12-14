from django.db import models


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


class PowerBallDraw(BaseDraw):
    multiplier = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Powerball Draw"
        verbose_name_plural = "Powerball Draws"


class MegaMillionsDraw(BaseDraw):
    megaplier = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Mega Millions Draw"
        verbose_name_plural = "Mega Millions Draws"

