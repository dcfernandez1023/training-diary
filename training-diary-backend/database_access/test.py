from database_access import DbAccess
import pickle
initial_data = {
  "_id": "",
  "password": "",
  "birthday": "",
  "exercises": [],
  "bodyStats": {
    "weight": {
      "amount": 0,
      "units": "lbs."
    },
    "height": {
      "feet": 0,
      "inches": 0
    },
    "bodyFat": 0
  },
  "goals": {
    "weight": {
      "amount": 0,
      "units": "lbs."
    },
    "bodyFat": 0,
    "calories": 0,
    "protein": 0,
    "fat": 0,
    "carbs": 0
  },
  "weightEntries": [],
  "bodyFatEntries": [],
  "proteinEntries": [],
  "carbEntries": [],
  "trackableExercises": [],
  "previousExerciseNames": [],
    "calorieEntries": [],
    "fatEntries": []
}
#default meta-data
file = open("initial_data", "wb")
pickle.dump(initial_data, file)
file.close()
file = open("initial_data", "rb")
print(pickle.load(file))
file.close()


