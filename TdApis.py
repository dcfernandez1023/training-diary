##THIS PYTHON SCRIPT IS THE MAIN ENTRY POINT OF THE BACKEND##
##THE ENTIRE BACKEND IS INTENDED TO RUN FROM THIS SCRIPT##
from os import sys, path
import os
#sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
import flask
from flask_mail import Mail
from flask import request
import flask_apis.User as User


##GLOBAL VARIABLES
app = flask.Flask(__name__, static_folder = "./td-client/build", static_url_path = "/")
#app = flask.Flask("__main__")

app.config['SECRET_KEY'] = 'Th1s1ss3cr3t'
app.config["MAIL_SERVER"] = "smtp.googlemail.com"
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'trainingdiary.bot@gmail.com'
app.config['MAIL_DEFAULT_SENDER'] = 'trainingdiary.bot@gmail.com'
app.config['MAIL_PASSWORD'] = 'thegreendoorhouse1'
TEMP_USER = "TEMP"

MAIL = Mail(app)

##serving the react app

@app.route("/")
@app.route("/index")
def index():
    return app.send_static_file("index.html")

@app.route("/reset")
def reset():
    return app.send_static_file("index.html")

@app.route("/profile")
def profile():
    return app.send_static_file("index.html")

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
    return user.generate_temp_credentials(email, MAIL)

@app.route("/postTempPassword", methods = ["POST"])
def validate_temp_password():
    request_body = request.get_json()
    temp_password = request_body.get("tempPassword")
    username = request_body.get("username")
    user = User.User(TEMP_USER, app)
    return user.validate_temp_credentials(username, temp_password)

@app.route("/postRecoveryPassword/<username>", methods = ["POST"])
def recover_password(username):
    request_body = request.get_json()
    token = request.headers.get("token")
    password = request_body.get("password")
    user = User.User(username, app)
    return user.recover_password(token, password)

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

if(__name__ == "__main__"):
    app.run()
#app.run(host = "0.0.0.0", debug = True, port=os.environ.get('PORT', 80))
#app.run(host = "localhost", port = 8080, debug = True)
