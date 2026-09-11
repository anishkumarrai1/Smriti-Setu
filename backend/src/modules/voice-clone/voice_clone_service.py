"""
voice_clone_service.py
------------------------------------------------------
Backend for Voice-Cloned Reminders.
This runs as a SEPARATE Python microservice (Coqui TTS is
Python-based) that your Node.js backend calls over HTTP.

Setup (backend/AI dev runs this once):
    pip install TTS flask --break-system-packages

Run the service:
    python voice_clone_service.py
    -> starts on http://localhost:5002

Node.js calls this service like any other REST API.
------------------------------------------------------
"""

from flask import Flask, request, jsonify, send_file
from TTS.api import TTS
import os
import uuid

app = Flask(__name__)

# Loads a pretrained multi-speaker/voice-cloning model once at startup.
# xtts_v2 supports cloning from a short reference audio clip.
print("Loading voice cloning model... (this happens once, takes a minute)")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

VOICE_SAMPLES_DIR = "voice_samples"
GENERATED_AUDIO_DIR = "generated_reminders"
os.makedirs(VOICE_SAMPLES_DIR, exist_ok=True)
os.makedirs(GENERATED_AUDIO_DIR, exist_ok=True)


@app.route("/upload-voice-sample", methods=["POST"])
def upload_voice_sample():
    """
    Caregiver uploads a short (10-30 sec) voice recording of a family member.
    This sample is stored and reused for all future reminders for that patient.

    Form-data: audio (file), patientId (string), familyMemberName (string)
    """
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    patient_id = request.form.get("patientId")
    family_member = request.form.get("familyMemberName", "family")

    if not patient_id:
        return jsonify({"error": "Missing patientId"}), 400

    audio_file = request.files["audio"]
    sample_filename = f"{patient_id}_{family_member}_sample.wav"
    sample_path = os.path.join(VOICE_SAMPLES_DIR, sample_filename)
    audio_file.save(sample_path)

    return jsonify({
        "saved": True,
        "voiceSampleId": sample_filename
    })


@app.route("/generate-reminder-audio", methods=["POST"])
def generate_reminder_audio():
    """
    Generates reminder speech in the cloned family voice.

    JSON body: { "voiceSampleId": "...", "text": "Amma, it's time for your medicine", "language": "en" }
    Returns: audio file (WAV)
    """
    data = request.get_json()
    voice_sample_id = data.get("voiceSampleId")
    text = data.get("text")
    language = data.get("language", "en")

    if not voice_sample_id or not text:
        return jsonify({"error": "Missing voiceSampleId or text"}), 400

    sample_path = os.path.join(VOICE_SAMPLES_DIR, voice_sample_id)
    if not os.path.exists(sample_path):
        return jsonify({"error": "Voice sample not found — upload one first"}), 404

    output_filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(GENERATED_AUDIO_DIR, output_filename)

    # This is the actual voice cloning step:
    # xtts_v2 takes the reference sample + target text, and speaks
    # the text in a voice that mimics the reference sample.
    tts.tts_to_file(
        text=text,
        speaker_wav=sample_path,
        language=language,
        file_path=output_path
    )

    return send_file(output_path, mimetype="audio/wav")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
