import os
from TdApis import app

app.run(host = "0.0.0.0", debug = True, port=os.environ.get('PORT', 80))