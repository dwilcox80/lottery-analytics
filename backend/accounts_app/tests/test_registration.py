# backend/accounts_app/tests/test_registration.py
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status


class RegistrationTests(APITestCase):
    def test_successful_registration(self):
        payload = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123"
        }

        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        User = get_user_model()
        user = User.objects.get(username="newuser")
        self.assertTrue(user.check_password("password123"))

    def test_missing_fields_returns_400(self):
        payload = {"username": "incomplete"}
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)

    def test_duplicate_username_returns_400(self):
        User = get_user_model()
        User.objects.create_user(
            username="duplicate",
            email="dup@example.com",
            password="password123"
        )

        payload = {
            "username": "duplicate",
            "email": "new@example.com",
            "password": "password123"
        }

        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)
