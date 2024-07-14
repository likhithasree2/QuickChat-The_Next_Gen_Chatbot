from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import pyjokes

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/time', methods=['GET'])
def get_time():
    current_time = datetime.now().strftime("%H:%M:%S")
    return jsonify(current_time=current_time)

@app.route('/joke', methods=['GET'])
def get_joke():
    joke = pyjokes.get_joke()
    return jsonify(joke=joke)

if __name__ == '_main_':
    app.run(debug=True)
