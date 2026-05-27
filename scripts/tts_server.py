#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["kokoro", "soundfile"]
# ///
import io
import sys
import soundfile as sf
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

device = "mps" if len(sys.argv) < 2 else sys.argv[1]

print(f"Loading Kokoro on {device}...")
from kokoro import KPipeline
pipeline = KPipeline(lang_code="a", device=device)
print("Ready. Listening on http://localhost:8880")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")

    def do_POST(self):
        if self.path != "/v1/audio/speech":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        text = body.get("input", "")
        voice = body.get("voice", "af_heart")

        buf = io.BytesIO()
        samples = []
        sr = 24000
        for _, _, audio in pipeline(text, voice=voice):
            import numpy as np
            samples.append(audio.numpy() if hasattr(audio, "numpy") else audio)

        import numpy as np
        combined = np.concatenate(samples)
        sf.write(buf, combined, sr, format="WAV")

        wav = buf.getvalue()
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(wav)))
        self.end_headers()
        self.wfile.write(wav)


HTTPServer(("localhost", 8880), Handler).serve_forever()
