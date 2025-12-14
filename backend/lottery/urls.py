from django.urls import path
from .views import LotteryAnalyticsView

urlpatterns = [
    path('analytics/', LotteryAnalyticsView.as_view()),
]
