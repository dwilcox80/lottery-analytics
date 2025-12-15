# lottery/views.py
from django.core.cache import cache
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import MegaMillionsDraw, PowerBallDraw


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

        data = cache.get(cache_key)
        if data is None:
            if lottery == "megamillions":
                qs = MegaMillionsDraw.objects.all()
            else:  # "powerball"
                qs = PowerBallDraw.objects.all()

            data = qs.with_joint_counts()
            # Cache for 1 hour; adjust as needed
            cache.set(cache_key, data, timeout=60 * 60)

        return Response(data)