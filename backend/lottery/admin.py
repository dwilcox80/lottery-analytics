from django.contrib import admin
from .models import MegaMillionsDraw, MegaMillionsDrawPositionTracker, PowerBallDraw, PowerBallDrawPositionTracker


@admin.register(MegaMillionsDraw)
class MegaMillionsDrawAdmin(admin.ModelAdmin):
    list_display = (
        "draw_date",
        "ball_1",
        "ball_2",
        "ball_3",
        "ball_4",
        "ball_5",
        "bonus_ball",
        "megaplier",
    )
    list_filter = ("draw_date",)
    search_fields = ("draw_date",)


@admin.register(MegaMillionsDrawPositionTracker)
class MegaMillionsDrawPositionTrackerAdmin(admin.ModelAdmin):
    list_display = (
        "draw_date",
        "ball_1",
        "ball_2",
        "ball_3",
        "ball_4",
        "ball_5",
        "bonus_ball",
    )
    list_filter = ("draw_date",)
    search_fields = ("draw_date",)


@admin.register(PowerBallDraw)
class PowerballDrawAdmin(admin.ModelAdmin):
    list_display = (
        "draw_date",
        "ball_1",
        "ball_2",
        "ball_3",
        "ball_4",
        "ball_5",
        "bonus_ball",
        "multiplier",
    )
    list_filter = ("draw_date",)
    search_fields = ("draw_date",)


@admin.register(PowerBallDrawPositionTracker)
class PowerBallDrawPositionTrackerAdmin(admin.ModelAdmin):
    list_display = (
        "draw_date",
        "ball_1",
        "ball_2",
        "ball_3",
        "ball_4",
        "ball_5",
        "bonus_ball",
    )
    list_filter = ("draw_date",)
    search_fields = ("draw_date",)

