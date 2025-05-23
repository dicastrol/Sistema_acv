# backend/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # IMPORTA y registra tus blueprints con rutas relativas
    from .routes.auth      import auth_bp
    from .routes.pacientes import pacientes_bp
    from .routes.historias import historias_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(pacientes_bp)
    app.register_blueprint(historias_bp)

    return app
