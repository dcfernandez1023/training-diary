from user_authentication import Authentication

auth = Authentication.Authentication("test", "123")
print(auth.validate_login())
print(auth.validate_registration())
