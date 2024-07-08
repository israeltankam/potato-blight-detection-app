from flask import Blueprint, render_template, request, jsonify
from PIL import Image
import io
from .model import predict_disease

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        image = Image.open(io.BytesIO(file.read()))
        prediction, probabilities = predict_disease(image)
        return jsonify({
            'prediction': prediction,
            'probabilities': probabilities
        })
    return jsonify({'error': 'Failed to process the file'}), 500
