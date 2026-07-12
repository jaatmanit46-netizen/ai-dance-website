from flask import Flask, render_template, request, jsonify
import os
import requests
import time
from dotenv import load_dotenv

# Secret keys load karne ke liye
load_dotenv()

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

@app.route('/')
def home():
    return render_template('index.html')

# AI Video Generation Route
@app.route('/generate', methods=['POST'])
def generate_video():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Image ko save karna
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Replicate API URL (Hum Luma Dream Machine ya Kling model ka API endpoint use kar rahe hain)
    # Note: Hum example ke liye Luma ka free public image-to-video use karenge
    headers = {
        "Authorization": f"Bearer {REPLICATE_API_TOKEN}",
        "Content-Type": "application/json"
    }

    # Step A: AI ko image URL ya base64 chahiye hota hai. 
    # Testing ke liye hum Replicate ke image-to-video ka generator call kar rahe hain.
    # (Real-world me file ko public URL banana padta hai, par testing ke liye Replicate local files ko handles karta hai)
    
    # Ye temporary mock setup hai free models ke liye jo direct image input lete hain:
    data = {
        "version": "1e7d7244-kling-image-to-video-dance", # Example Dance Model Version
        "input": {
            "image": f"http://localhost:5000/{filepath}", # Local path for now
            "prompt": "A person dancing happily, full body movement, high quality, smooth animation"
        }
    }

    try:
        # AI Generation shuru karne ki request
        response = requests.post("https://api.replicate.com/v1/predictions", json=data, headers=headers)
        prediction = response.json()
        
        # Agar error aaye to
        if "id" not in prediction:
            return jsonify({"error": "AI Service Error", "details": prediction}), 500

        prediction_id = prediction["id"]
        status_url = f"https://api.replicate.com/v1/predictions/{prediction_id}"

        # Step B: AI video banane me 10-20 seconds leta hai, to hum check karenge jab tak ban na jaye
        video_url = None
        for _ in range(30): # Max 30 times check karega (30 seconds)
            status_response = requests.get(status_url, headers=headers).json()
            if status_response["status"] == "succeeded":
                video_url = status_response["output"] # Video link mil gaya!
                break
            elif status_response["status"] == "failed":
                return jsonify({"error": "AI generation failed"}), 500
            time.sleep(2) # 2 second ruko fir check karo

        if video_url:
            return jsonify({"success": True, "video_url": video_url})
        else:
            return jsonify({"error": "Timeout. AI took too long."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
   app.run(debug=True, host='0.0.0.0', port=5000)