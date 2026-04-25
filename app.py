from flask import Flask, request, jsonify, render_template
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)

# ── Load ML model files ──────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, 'rf_crop_model.pkl'), 'rb') as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

with open(os.path.join(BASE_DIR, 'label_encoder.pkl'), 'rb') as f:
    le = pickle.load(f)

FEATURE_COLS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

print("✅ Model loaded successfully!")
print(f"   Crops: {list(le.classes_)}")


# ── Routes ───────────────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Validate all required fields
        missing = [f for f in FEATURE_COLS if f not in data]
        if missing:
            return jsonify({'error': f'Missing fields: {missing}'}), 400

        # Build input dataframe
        input_df = pd.DataFrame(
            [[data[f] for f in FEATURE_COLS]],
            columns=FEATURE_COLS
        )

        # Scale and predict
        input_scaled = scaler.transform(input_df)
        prediction   = model.predict(input_scaled)[0]
        crop_name    = le.inverse_transform([prediction])[0]

        # Top 3 probabilities
        probs    = model.predict_proba(input_scaled)[0]
        top3_idx = probs.argsort()[-3:][::-1]
        top3     = [
            {
                'crop':        le.classes_[i],
                'probability': round(float(probs[i]) * 100, 1)
            }
            for i in top3_idx
        ]

        return jsonify({
            'crop': crop_name,
            'top3': top3
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Run ──────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, port=5000)
