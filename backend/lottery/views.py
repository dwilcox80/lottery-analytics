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
        lottery = request.query_params.get('lottery')

        if lottery == 'megamillions':
            data = MegaMillionsDraw.objects.with_joint_counts()
        elif lottery == 'powerball':
            data = PowerBallDraw.objects.with_joint_counts()
        else:
            return Response({'error': 'lottery must be megamillions or powerball'}, status=400)

        return Response(data)
