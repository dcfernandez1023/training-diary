from user_authentication import Authentication
from flask import make_response, Response
import flask
import traceback

class User:
    def __init__(self, username, app):
        self.__username = username
        self.__app = app
        self.__auth = self.__create_auth(username)

    #used to reset user data members after new account information (username) is updated
    def reset_user_attributes(self, new_username):
        self.__username = new_username
        self.__auth = self.__create_auth(new_username)
    ## USER AUTHENTICATION METHODS ##

    #validates login and returns token (if valid)
    def login(self, password):
        try:
            if self.__auth.validate_login(password):
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                msg = make_response({}, 200, response_header)
                return msg
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    #validates registration, puts initial data into database, and returns token (if valid)
    def registration(self, password, email, birthday):
        try:
            if self.__auth.validate_registration():
                db_access = self.__auth.get_db_access()
                db_access.create_document(password, email, birthday)
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                msg = make_response({}, 200, response_header)
                return msg
            return make_response({}, 409)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    #verifies if token is valid for api usage
    def verify_api_token(self, token):
        try:
            isVerified = self.__auth.isApiUser(self.__app, token)
            if isVerified:
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                return make_response({}, 200, response_header)
            return make_response({}, 204)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    def update_username_and_email(self, token, new_username, new_email, new_birthday):
        try:
            isVerified = self.__auth.isApiUser(self.__app, token)
            if isVerified:
                update_body = {"_id": new_username, "email": new_email, "birthday": new_birthday}
                db_access = self.__auth.get_db_access()
                if new_username == self.__username:
                    db_access.update_username_and_email(update_body)
                    self.reset_user_attributes(new_username)
                    response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                    return make_response({}, 200, response_header)
                elif db_access.is_existing_user(new_username):
                    return make_response({}, 409)
                else:
                    db_access.update_username_and_email(update_body)
                    self.reset_user_attributes(new_username)
                    response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                    return make_response({}, 200, response_header)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    ## GET METHODS ##

    #gets entire user's document from database
    def get_all_data(self, token):
        try:
            if self.__auth.isApiUser(self.__app, token):
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                return make_response(self.__auth.get_db_access().get_all_data(), 200, response_header)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    ## POST METHODS ##

    #posts new data to document
    def post_data(self, token, data):
        try:
            if self.__auth.isApiUser(self.__app, token):
                self.__auth.get_db_access().update_document(data)
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                return make_response({}, 200, response_header)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)


    ## PRIVATE METHODS ##

    # simple function for returning consistent token messages
    def __token_msg(self, token):
        return {"token": token}

    #instantiates the auth object
    def __create_auth(self, username):
        return Authentication.Authentication(username)

    #logs errors to error txt file
    def __log_error(self, error_string):
        try:
            file = open(r"error_log", "a")
            import datetime
            error = {str(datetime.datetime.now()): error_string}
            file.write(str(error) + "\n")
            file.close()
        except Exception:
            return

