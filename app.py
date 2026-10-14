from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/health")
def health():
    """Simple endpoint useful for container and deployment health checks."""
    return jsonify(status="ok", app="Brew & Beyond"), 200

if __name__ == "__main__":
    # Listen on all interfaces so Docker can expose the app outside the container.
    app.run(host="0.0.0.0", port=5000, debug=False)
