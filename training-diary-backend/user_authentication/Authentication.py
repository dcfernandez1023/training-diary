##THIS CLASS IS USED TO VALIDATE LOGIN, REGISTRATION, AND GRANT/DENY ACCESS TO APIS##
##INTENDED TO BE INSTANTIATED WITHIN THE USER CLASS##

import jwt
import datetime
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
        return self.__dbAccess.is_valid_user(password)

    #validates registration using DbAccess object methods
    #returns true if user can register with the given username
    #returns false if the username is taken
    def validate_registration(self):
        return not self.__dbAccess.is_existing_user()

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

    #grants access to api usage
    #returns true to indicate user has access to apis
    #returns false to indicate user does not have access to apis
    def isApiUser(self, app, token):
        decoded_token = self.__decode_api_token(app, token)
        if decoded_token == self.__username:
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
            return 1
        except jwt.InvalidTokenError:
            return 1
