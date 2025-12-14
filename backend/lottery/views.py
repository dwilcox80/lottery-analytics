from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import MegaMillionsDraw, PowerBallDraw
from .analytics import day_of_the_month_frequency, weekday_frequency


class LotteryAnalyticsView(APIView):
    authentication_classes = [SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self, lottery):
        if lottery == 'powerball':
            return PowerBallDraw.objects.all()
        elif lottery == 'megamillions':
            return MegaMillionsDraw.objects.all()
        else:
            raise ValueError("Invalid lottery")

    def get(self, request):
        lottery = request.query_params.get('lottery')

        if lottery not in ['megamillions', 'powerball']:
            return Response({'error': 'lottery must be megamillions or powerball'}, status=400)

        queryset = self.get_queryset(lottery)

        return Response({
            "weekday": weekday_frequency(queryset),
            "day_of_month": day_of_the_month_frequency(queryset),
        })
