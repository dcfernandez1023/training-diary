##THIS PYTHON SCRIPT IS THE MAIN ENTRY POINT OF THE BACKEND##
##THE ENTIRE BACKEND IS INTENDED TO RUN FROM THIS SCRIPT##

import flask
from flask import request
from flask_apis import User


##GLOBAL VARIABLES
app = flask.Flask("__main__")
app.config['SECRET_KEY'] = 'Th1s1ss3cr3t'
TEMP_USER = "TEMP"


## AUTHENTICATION APIS ##

#login api
#responds with api token if successful
@app.route("/login", methods = ["POST"])
def user_login():
    request_body = request.get_json()
    username = request_body.get("username")
    password = request_body.get("password")
    user = User.User(username, app)
    return user.login(password)

#register api
#responds with api token if successful
@app.route("/register", methods = ["POST"])
def user_registration():
    request_body = request.get_json()
    username = request_body.get("username")
    password = request_body.get("password")
    email = request_body.get("email")
    birthday = request_body.get("birthday")
    user = User.User(username, app)
    return user.registration(password, email, birthday)

#valid token api
#checks if client's token is valid for api usage
#responds with api token if successful
@app.route("/verifyLogin/<username>", methods = ["POST"])
def verify_api_token(username):
    token = request.headers.get("token")
    user = User.User(username, app)
    return user.verify_api_token(token)

#change username & email api
@app.route("/postAccountInfo/<username>", methods = ["POST"])
def update_username_and_email(username):
    token = request.headers.get("token")
    request_body = request.get_json()
    user = User.User(username, app)
    return user.update_username_and_email(token, request_body)

@app.route("/postCredentials/<username>", methods = ["POST"])
def update_password(username):
    token = request.headers.get("token")
    request_body = request.get_json()
    old_password = request_body.get("oldPassword")
    new_password = request_body.get("newPassword")
    user = User.User(username, app)
    return user.change_password(token, old_password, new_password)

@app.route("/getTempPassword", methods = ["POST"])
def get_temp_password():
    request_body = request.get_json()
    email = request_body.get("email")
    user = User.User(TEMP_USER, app)
    return user.generate_temp_credentials(email)

## GET APIS ##

#gets entire user document from database
#obtains username from url parameter and api token from request header
@app.route("/getAllData/<username>", methods = ["GET"])
def get_all_data(username):
    token = request.headers.get("token")
    user = User.User(username, app)
    return user.get_all_data(token)


## POST APIS ##

#posts data from response body into document
#used for updating and creating new data
#obtains username from url parameter, token from request header, and data from request body
@app.route("/postData/<username>", methods = ["POST"])
def post_data(username):
    token = request.headers.get("token")
    request_body = request.get_json()
    user = User.User(username, app)
    return user.post_data(token, request_body)


app.run(host = "localhost", port = 8080, debug = True)
