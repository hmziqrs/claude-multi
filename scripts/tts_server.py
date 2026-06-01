#!/usr/bin/env python3
import io
import sys
import subprocess
import soundfile as sf
import numpy as np
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

device = "mps" if len(sys.argv) < 2 else sys.argv[1]

print(f"Loading Kokoro on {device}...")
from kokoro import KPipeline
pipeline = KPipeline(lang_code="a", device=device)


def wav_to_mp3(pcm: np.ndarray, sr: int) -> bytes:
    wav_buf = io.BytesIO()
    sf.write(wav_buf, pcm, sr, format="WAV")
    proc = subprocess.run(
        ["ffmpeg", "-y", "-i", "pipe:0", "-codec:a", "libmp3lame", "-b:a", "96k", "-f", "mp3", "pipe:1"],
        input=wav_buf.getvalue(),
        capture_output=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode())
    return proc.stdout


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
        elif self.path == "/shutdown":
            import threading
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"shutting down")
            print("Unloading model...")
            global pipeline
            del pipeline
            import gc, torch
            gc.collect()
            if torch.backends.mps.is_available():
                torch.mps.empty_cache()
            print("Model unloaded. Stopping server.")
            threading.Thread(target=httpd.shutdown, daemon=True).start()

    def do_POST(self):
        if self.path != "/v1/audio/speech":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        text = body.get("input", "")
        voice = body.get("voice", "af_heart")

        samples = []
        for _, _, audio in pipeline(text, voice=voice):
            samples.append(audio.numpy() if hasattr(audio, "numpy") else audio)

        mp3 = wav_to_mp3(np.concatenate(samples), 24000)

        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(mp3)))
        self.end_headers()
        self.wfile.write(mp3)


httpd = HTTPServer(("localhost", 8880), Handler)
print("Ready. Listening on http://localhost:8880")
httpd.serve_forever()
httpd.server_close()
print("Server stopped.")
