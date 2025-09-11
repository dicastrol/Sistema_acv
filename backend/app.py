# backend/app.py
from flask import Flask
from flask_cors import CORS
from flask_caching import Cache

from backend.database import Base, engine
from backend.routes.auth       import auth_bp
from backend.routes.pacientes  import pacientes_bp
from backend.routes.historias  import historias_bp
from backend.routes.citas      import citas_bp
from backend.routes.prediccion import pred_bp
from backend.routes.neuroguard import ng_bp



def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'MiClaveSuperSecreta123!'
    
    # ——— Configura Flask-Caching ———
    app.config['CACHE_TYPE'] = 'simple'            # en prod: 'redis' o 'filesystem'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300      # 5 minutos
    cache = Cache(app)
    # ——————————————————————————————

    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # registra blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(pacientes_bp)
    app.register_blueprint(historias_bp)
    app.register_blueprint(citas_bp)
    app.register_blueprint(pred_bp)
    app.register_blueprint(ng_bp)

    return app

app = create_app()
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
