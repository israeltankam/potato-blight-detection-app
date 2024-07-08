document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const previewImg = document.getElementById('preview-img');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
});

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById('image-input');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image file first!");
        return;
    }

    // Resize image to 224x224 pixels before sending
    resizeImage(file, 224, 224, function(resizedFile) {
        formData.append('file', resizedFile);

        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const predictionText = document.getElementById('prediction-text');
            const recommendationsDiv = document.getElementById('recommendations');
            const blightProbability = data.probabilities.Blight;
            const healthyProbability = data.probabilities.Healthy;

            predictionText.innerHTML = `Prediction: ${data.prediction}<br>Blight Probability: ${blightProbability.toFixed(2)}%<br>Healthy Probability: ${healthyProbability.toFixed(2)}%`;

            // Check if both probabilities are less than 80%
            if (blightProbability < 80 && healthyProbability < 80) {
                alert("This might not be a picture of a potato leaf.");
            }

            // Generate recommendations based on probabilities
            recommendationsDiv.innerHTML = generateRecommendations(blightProbability, healthyProbability);
        })
        .catch(error => console.error('Error:', error));
    });
});


// Function to resize image using HTML5 Canvas
function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(function(blob) {
                const resizedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                callback(resizedFile);
            }, 'image/jpeg', 0.9);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Function to generate recommendations based on probabilities and decision rules
function generateRecommendations(blightProbability, healthyProbability) {
    let recommendations = '<h3>Recommendations:</h3>';
    
    // Rule 1: If Blight Probability > 80%
    if (blightProbability >= 80) {
        recommendations += '<p><strong>Immediate Action Required:</strong> Initiate immediate management procedures.</p>';
        recommendations += '<ol>';
        recommendations += '<li><strong>Quarantine:</strong> Isolate the infected plant or area to prevent further spread.</li>';
        recommendations += '<li><strong>Treatment:</strong> Apply appropriate fungicides or other treatments as per agricultural guidelines to control the spread of the disease.</li>';
        recommendations += '<li><strong>Monitoring:</strong> Regularly monitor the affected plants and nearby areas to observe the efficacy of treatments and prevent reoccurrence.</li>';
        recommendations += '<li><strong>Reporting:</strong> Document the occurrence and management actions taken for record-keeping and future reference.</li>';
        recommendations += '</ol>';
    }
    
    // Rule 2: If Healthy Probability > 80%
    else if (healthyProbability >= 80) {
        recommendations += '<p>The leaf is confirmed as healthy.</p>';
        recommendations += '<ol>';
        recommendations += '<li><strong>Monitoring:</strong> Continue regular monitoring to ensure no signs of disease development.</li>';
        recommendations += '<li><strong>Prevention:</strong> Implement preventive measures such as maintaining good field hygiene and appropriate crop rotation to minimize disease risks.</li>';
        recommendations += '<li><strong>Documentation:</strong> Record the status of the leaf as healthy for crop management records.</li>';
        recommendations += '</ol>';
    }
    
    // If probabilities are inconclusive or below the thresholds
    else {
        recommendations += '<p>Consider further assessment or monitoring as probabilities are inconclusive.</p>';
    }
    
    return recommendations;
}

