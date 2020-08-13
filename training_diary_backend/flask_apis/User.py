from ..user_authentication import Authentication as Authentication
from flask import make_response
import traceback
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import base64
from email.mime.text import MIMEText

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

class User:
    def __init__(self, username, app):
        self.__username = username
        self.__app = app
        self.__auth = self.__create_auth(username)
        self.__sender = "trainingdiary.bot@gmail.com"
        self.__recovery_subject = "Training Diary - Recover Credentials"

    ## USER AUTHENTICATION METHODS ##

    # google's starter code to get the gmail service object
    def get_service_obj(self):
        creds = None
        # The file token.pickle stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        service = build('gmail', 'v1', credentials=creds)
        return service

    """
    Create a message for an email.
    Args:
      sender: Email address of the sender.
      to: Email address of the receiver.
      subject: The subject of the email message.
      message_text: The text of the email message.

    Returns:
      An object containing a base64url encoded email object.
    """

    def create_recovery_account_message(self, sender, to, subject, message_text):
        message = MIMEText(message_text)
        message['to'] = to
        message['from'] = sender
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes())
        raw = raw.decode()
        body = {'raw': raw}
        return body

    """
    Send an email message.
    Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    message: Message to be sent.
    """

    def send_recovery_account_message(self, service, user_id, message):
        message = (service.users().messages().send(userId=user_id, body=message)
                   .execute())
    #used to reset user data members after new account information (username) is updated
    def reset_user_attributes(self, new_username):
        self.__username = new_username
        self.__auth = self.__create_auth(new_username)

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
            if self.__auth.validate_registration(email):
                db_access = self.__auth.get_db_access()
                hashed_password = self.__auth.hash_new_password(password)
                db_access.create_document(hashed_password, email, birthday)
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

    def update_username_and_email(self, token, account_info):
        try:
            isVerified = self.__auth.isApiUser(self.__app, token)
            if isVerified:
                db_access = self.__auth.get_db_access()
                if account_info.get("_id") is not None:
                    id_filter = {"_id": account_info.get("_id")}
                    if db_access.is_existing_user(id_filter):
                        return make_response({}, 409)
                    self.reset_user_attributes(account_info.get("_id"))
                if account_info.get("email") is not None:
                    email_filter = {"email": account_info.get("email")}
                    if db_access.is_existing_user(email_filter):
                        return make_response({}, 409)
                db_access.update_username_and_email(account_info)
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                return make_response({}, 200, response_header)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    def change_password(self, token, old_password, new_password):
        try:
            isVerified = self.__auth.isApiUser(self.__app, token)
            if isVerified:
                if self.__auth.validate_login(old_password):
                    response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                    new_hashed_password = self.__auth.hash_new_password(new_password)
                    db_access = self.__auth.get_db_access()
                    db_access.update_document({"password": new_hashed_password})
                    return make_response({}, 200, response_header)
                return make_response({}, 409)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    def recover_password(self, token, new_password):
        try:
            isVerified = self.__auth.isApiUser(self.__app, token)
            if isVerified:
                db_access = self.__auth.get_db_access()
                new_hashed_password = self.__auth.hash_new_password(new_password)
                db_access.update_document({"password": new_hashed_password})
                return make_response({}, 200)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)


    def generate_temp_credentials(self, email):
        try:
            db_access = self.__auth.get_db_access()
            if db_access.is_existing_user({"email": email}):
                document = db_access.get_document({"email": email})
                username = document.get("_id")
                self.reset_user_attributes(username)
                temp_password = self.__auth.encode_temp_password(self.__app)
                msg = "Username: " + username + "\n" + "Temporary Password " + temp_password
                recovery_email_msg = self.create_recovery_account_message(self.__sender, email, self.__recovery_subject, msg)
                gmail_service_obj = self.get_service_obj()
                self.send_recovery_account_message(gmail_service_obj, self.__sender, recovery_email_msg)
                return make_response({}, 200)
            return make_response({}, 401)
        except Exception:
            self.__log_error(traceback.format_exc())
            return make_response({}, 500)

    def validate_temp_credentials(self, username, temp_password):
        try:
            if self.__auth.is_temp_password_valid(self.__app, temp_password, username):
                self.reset_user_attributes(username)
                response_header = self.__token_msg(self.__auth.encode_api_token(self.__app))
                return make_response(self.__auth.get_db_access().get_all_data(), 200, response_header)
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

