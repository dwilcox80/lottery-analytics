"""
Lottery app views
"""
from django.core.cache import cache
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import MegaMillionsDraw, PowerBallDraw
from .lottery_analytics_utils import compute_summary


class LotteryAnalyticsView(APIView):
    authentication_classes = [SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lottery = request.query_params.get("lottery", "").lower().strip()

        if lottery not in ("megamillions", "powerball"):
            return Response(
                {
                    "error": {
                        "code": "INVALID_LOTTERY",
                        "message": "Query parameter `lottery` must be 'megamillions' or 'powerball'.",
                    }
                },
                status=400,
            )

        cache_key = f"lottery_analytics:{lottery}"
        cached = cache.get(cache_key)

        # Select queryset
        if lottery == "megamillions":
            qs = MegaMillionsDraw.objects.all()
        else:
            qs = PowerBallDraw.objects.all()

        # Latest draw date in DB
        latest_db_date = qs.latest("draw_date").draw_date

        # If cache is valid, return it
        if cached and cached.get("latest_date") == latest_db_date:
            return Response(cached["data"])

        # Recompute analytics
        weekday_main, weekday_bonus = qs.with_joint_counts()

        summary = compute_summary(qs)

        analytics = {
            "weekday_main": weekday_main,
            "weekday_bonus": weekday_bonus,
            "summary": summary,
        }

        payload = {
            "latest_date": latest_db_date,
            "data": analytics,
        }

        cache.set(cache_key, payload, timeout=3600)

        return Response(analytics)