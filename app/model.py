import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
from .f1score import F1Score  # Ensure the custom metric is imported

model = None

def load_model():
    global model
    model = tf.keras.models.load_model('model/model.keras', custom_objects={'F1Score': F1Score})

def predict_disease(image):
    if model is None:
        load_model()
    
    image = image.resize((224, 224))  # Resize image to match the input size of the model
    image = img_to_array(image) / 255.0  # Convert image to array and normalize
    image = np.expand_dims(image, axis=0)  # Expand dimensions to match input shape of model
    
    prediction = model.predict(image)[0][0]
    blight_prob = prediction * 100
    healthy_prob = (1 - prediction) * 100
    
    if prediction > 0.5:
        return "Healthy", {"Blight": blight_prob, "Healthy": healthy_prob}
    else:
        return "Blight", {"Blight": blight_prob, "Healthy": healthy_prob}
