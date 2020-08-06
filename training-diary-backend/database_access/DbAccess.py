from pymongo import MongoClient
import pickle
import dns

class DbAccess:
    #constructor keeps username, password, gets the database, and gets the user's document
    #user's document will be set to None if user's document cannot be found
    def __init__(self, username):
        self.__username = username
        self.__db = self.__get_db()
        self.__document = self.__get_document(username)

    #setter for document
    def set_document(self, document):
        self.__document = document

    #gets hashed_password
    def get_hash(self):
        return self.__document.get("password")

    #determines if the user exists
    def is_existing_user(self, info):
        if self.__get_document(info) is None:
            return False
        return True

    #determines if credentials entered on the client side match the user's credentials in the database
    def is_valid_user(self, password):
        if self.__document is None:
            return False
        if self.__document.get("_id") == self.__username and self.__document.get("password") == password:
            return True
        return False

    def get_all_data(self):
        data = self.__document.copy()
        data.pop("password")
        return data

    def get_data(self, key):
        data = self.__document.copy()
        data.pop(key)
        return data

    #takes in dictionary request body sent from client and updates only _id and email key-value pairs of the document
    def update_username_and_email(self, update_body):
        if self.__document is None:
            raise Exception("Null document")
        self.__document.update(update_body)
        new_document = self.__document
        self.delete_document()
        self.set_document(new_document)
        self.__save_document()

    #takes in a dictionary request body sent from the client and updates corresponding key-value pairs of the document
    def update_document(self, data):
        if self.__document is None:
            raise Exception("Null document")
        self.__document.update(data)
        self.__save_document()

    #creates a new document and saves it to the database
    #only does so if username does not already exist
    def create_document(self, password, email, birthday):
        if self.is_existing_user(self.__username):
            return
        #file = open(r"D:\Users\Dominic\training-diary-app\database_access\initial_data", "rb")
        #initial_data = pickle.load(file)
        #file.close()
        initial_data = self.__get_metadata()
        initial_data.update({"_id": self.__username, "password": password, "email": email, "birthday": birthday})
        self.__document = initial_data
        self.__save_document()

    #finds document by username and deletes it
    def delete_document(self):
        if self.__document is None:
            return
        self.__db.get_collection("td").find_one_and_delete({"_id": self.__username})
        self.__document = None

    ##PRIVATE METHODS##

    #intended to be called whenever the document of this class needs to be saved
    def __save_document(self):
        if self.__document is None:
            return
        self.__db.get_collection("td").update_one({"_id": self.__document.get("_id")}, {"$set": self.__document}, upsert = True)

    #intended to be called only in constructor; gets the user's document
    #returns none if user document could not be found
    def __get_document(self, info):
        document = self.__db.get_collection("td").find_one(info)
        if document is None:
            return None
        return dict(document)

    #intended to be called only in constructor; gets the database
    def __get_db(self):
        client = MongoClient("mongodb+srv://bigdom1023:homekeys92@dom-cluster-1numt.mongodb.net/test?retryWrites=true&w=majority")
        db = client.get_database("TrainingDiary")
        return db

    def __get_metadata(self):
        meta_data = \
            {
                "categories": ["Body", "Diet", "Exercise"],
                "fieldDataTypes": ["string", "number"],
                "fieldConstants": ["Name", "Notes"],
                "calculationTypes": ["add", "subtract", "multiply", "divide", "average", "none"],
                "graphFilterConstants": ["Name"],
                "requiredGoalFieldTypes": ["number"],
                "goalStructure": {
                    "Goal Type": "",
                    "Fields": {},
                    "fieldOrder": [],
                    "lastUpdated": "",
                    "deletable": True,
                    "amountAchieved": 0,
                    "displayOrder": ["Goal Type", "Fields"]
                },
                "entryTypes":
                    [
                        {
                            "Date": "string",
                            "Category": "Body",
                            "Type": "Body-Weight",
                            "Body-Weight": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Body-Weight", "Notes"],
                            "calculationType": "average"
                        },

                        {
                            "Date": "string",
                            "Category": "Body",
                            "Type": "Body-Fat %",
                            "Body-Fat %": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Body-Fat %", "Notes"],
                            "calculationType": "average"
                        },

                        {
                            "Date": "string",
                            "Category": "Diet",
                            "Type": "Calories",
                            "Calories": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Calories", "Notes"],
                            "calculationType": "add"
                        },

                        {
                            "Date": "string",
                            "Category": "Diet",
                            "Type": "Protein",
                            "Protein": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Protein", "Notes"],
                            "calculationType": "add"
                        },

                        {
                            "Date": "string",
                            "Category": "Diet",
                            "Type": "Carbs",
                            "Carbs": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Carbs", "Notes"],
                            "calculationType": "add"
                        },

                        {
                            "Date": "string",
                            "Category": "Diet",
                            "Type": "Fats",
                            "Fats": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Fats", "Notes"],
                            "calculationType": "add"
                        },

                        {
                            "Date": "string",
                            "Category": "Exercise",
                            "Type": "Weight-training",
                            "Name": "string",
                            "Sets": "number",
                            "Reps": "number",
                            "Weight": "number",
                            "Notes": "string",
                            "displayOrder": ["Category", "Type", "Name", "Sets", "Reps", "Weight", "Notes"],
                            "calculationType": "none"
                        },

                        {
                            "Date": "string",
                            "Category": "Exercise",
                            "Type": "Cardio",
                            "Name": "string",
                            "Distance": "number",
                            "Time": "number",
                            "displayOrder": ["Category", "Type", "Name", "Distance", "Time", "Notes"],
                            "calculationType": "none"
                        },
                    ]
            }

        initial_data = {
            "_id": "",
            "password": "",
            "birthday": "",
            "goals": [
                {"Goal Type": "Diet",
                 "Fields": {"Calories": 0, "Protein": 0, "Fat": 0, "Carbs": 0},
                 "fieldOrder": ["Calories", "Protein", "Fat", "Carbs"],
                 "lastUpdated": "",
                 "deletable": False,
                 "amountAchieved": 0,
                 },

                {
                    "Goal Type": "Body",
                    "Fields": {"Body-Weight": 0, "Body-Fat %": 0},
                    "fieldOrder": ["Body-Weight", "Body-Fat %"],
                    "lastUpdated": "",
                    "deletable": False,
                    "amountAchieved": 0,
                },
            ],
            "entryNames": [],
            "trackableData": [],
            "userData": [],
            "metaData": meta_data
        }

        return initial_data

    ##for testing##
    def get_db(self):
        return self.__db