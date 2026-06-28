"""
app.py — Flask entry point for the TABLEYE detection backend.

Run with:
    python app.py

All API routes are registered as Blueprints from the routes/ folder.
Detection logic lives in the detection/ folder.
"""

from flask import Flask
from flask_cors import CORS

# Route blueprints (uncomment as you build each module)
# from routes.tables    import tables_bp
# from routes.detection import detection_bp


def create_app():
    app = Flask(__name__)

    # Allow requests from the React dev server (Vite runs on port 5173).
    CORS(app, origins=["http://localhost:5173"])

    # Register blueprints
    # app.register_blueprint(tables_bp,    url_prefix="/api/tables")
    # app.register_blueprint(detection_bp, url_prefix="/api/detection")

    @app.get("/api/health")
    def health():
        """Simple health-check endpoint."""
        return {"status": "ok", "service": "tableye-backend"}

    return app


if __name__ == "__main__":
    app = create_app()
    # debug=True enables auto-reload during development.
    app.run(host="0.0.0.0", port=5000, debug=True)
