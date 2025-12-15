# backend/accounts_app/tests/test_auth.py
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


class AuthTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="tester",
            password="password123",
            is_active=True
        )

    def test_jwt_authentication_success(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

        response = self.client.get("/api/lottery/analytics/?lottery=powerball")
        self.assertNotEqual(response.status_code, 401)

    def test_missing_token_fails(self):
        response = self.client.get("/api/lottery/analytics/?lottery=powerball")
        self.assertEqual(response.status_code, 403)

    def test_invalid_token_fails(self):
        self.client.credentials(
            HTTP_AUTHORIZATION="Bearer invalidtoken123"
        )
        response = self.client.get("/api/lottery/analytics/?lottery=powerball")
        self.assertEqual(response.status_code, 403)
