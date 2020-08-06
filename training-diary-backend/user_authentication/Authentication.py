##THIS CLASS IS USED TO VALIDATE LOGIN, REGISTRATION, AND GRANT/DENY ACCESS TO APIS##
##INTENDED TO BE INSTANTIATED WITHIN THE USER CLASS##

import jwt
import datetime
import os
import hashlib
from database_access import DbAccess

class Authentication:
    #constructor takes in the flask's app in order to generate api tokens for the application
    def __init__(self, username):
        self.__username = username
        self.__dbAccess = DbAccess.DbAccess(username)

    ## USER LOGIN AUTHENTICATION ##

    #validates login using DbAccess object methods
    #returns true if login is successful
    #returns false if not successful
    def validate_login(self, password):
        salt = None
        hashed_password = None
        if self.__dbAccess.is_existing_user(self.__username):
            salt = self.__dbAccess.get_hash()[:32]
            hashed_password = self.hash_existing_password(password, salt)
        if salt is None or hashed_password is None:
            return False
        return self.__dbAccess.is_valid_user(hashed_password)

    #validates registration using DbAccess object methods
    #returns true if user can register with the given username
    #returns false if the username is taken
    def validate_registration(self, email):
        id_filter = {"_id": self.__username}
        email_filter = {"email": email}
        return not self.__dbAccess.is_existing_user(id_filter) and not self.__dbAccess.is_existing_user(email_filter)

    #used to hash a plaintext password to store in db
    def hash_new_password(self, password):
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        storage = salt + key
        return storage

    #used to hash a plaintext password to compare to an existing hashed password
    def hash_existing_password(self, password, salt):
        compare_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        compare_storage = salt + compare_key
        return compare_storage

    #returns the DbAccess object
    def get_db_access(self):
        return self.__dbAccess

    ##  API AUTHENTICATION ##

    #generates token to use apis
    #app = flask app
    def encode_api_token(self, app):
        token = jwt.encode(
            {'username': self.__username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)},
            app.config['SECRET_KEY'])
        return token.decode('UTF-8')

    def encode_temp_password(self, app):
        token = jwt.encode(
            {'username': self.__username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)},
            app.config['SECRET_KEY'])
        return token.decode('UTF-8')

    #grants access to api usage
    #returns true to indicate user has access to apis
    #returns false to indicate user does not have access to apis
    def isApiUser(self, app, token):
        decoded_token = self.__decode_api_token(app, token)
        if decoded_token == self.__username:
            return True
        return False

    def is_temp_password_valid(self, app, token, username):
        decoded_token = self.__decode_api_token(app, token)
        if decoded_token == username:
            return True
        return False

    # decodes and validates api token from client
    # intended to be called from isApiUser
    # returns 1 if token is expired or invalid
    # returns 0 if token is valid
    def __decode_api_token(self, app, token):
        try:
            payload = jwt.decode(token, app.config.get('SECRET_KEY'))
            return payload['username']
        except jwt.ExpiredSignatureError:
            return -1
        except jwt.InvalidTokenError:
            return -1
