from database_access import DbAccess
import pickle

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

file = open("initial_data", "wb")
pickle.dump(initial_data, file)
file.close()
file = open("initial_data", "rb")
print(pickle.load(file))
file.close()


#
# initial_data = {
#   "_id": "",
#   "password": "",
#   "birthday": "",
#   "Exercises": [],
#   "bodyStats": {
#     "Weight": {
#       "amount": 0,
#       "units": "lbs."
#     },
#     "height": {
#       "feet": 0,
#       "inches": 0
#     },
#     "bodyFat": 0
#   },
#   "goals": {
#     "Weight": {
#       "amount": 0,
#       "units": "lbs."
#     },
#     "bodyFat": 0,
#     "calories": 0,
#     "protein": 0,
#     "fat": 0,
#     "carbs": 0
#   },
#   "WeightEntries": [],
#   "bodyFatEntries": [],
#   "proteinEntries": [],
#   "carbEntries": [],
#   "trackableExercises": [],
#   "previousExerciseNames": [],
#     "calorieEntries": [],
#     "fatEntries": []
# }
