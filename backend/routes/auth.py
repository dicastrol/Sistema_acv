# backend/routes/auth.py
from flask import Blueprint, request, jsonify, current_app, g
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models.usuario import Usuario
from ..schemas.usuario import UsuarioSchema
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps

# Blueprint con prefijo para agrupar rutas de autenticación
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
usuario_schema = UsuarioSchema()

def get_db():
    """Context manager para sesiones de BD"""
    with SessionLocal() as db:
        yield db

# Decorador para rutas protegidas
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Intentar extraer el token del header Authorization: Bearer <token>
        auth_header = request.headers.get('Authorization', None)
        if auth_header:
            parts = auth_header.split()
            if parts[0].lower() == 'bearer' and len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            # Guardar user_id en g para uso posterior
            g.user_id = payload.get('user_id')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401

        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register_usuario():
    """Registra un nuevo usuario: valida, hace hash y emite JWT"""
    json_data = request.get_json() or {}
    try:
        data = usuario_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db = next(get_db())
    # Verificar unicidad de usuario
    if db.query(Usuario).filter(Usuario.usuario == data['usuario']).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 400

    # Hashear contraseña
    hashed_pw = generate_password_hash(data['password'])
    nuevo = Usuario(
        nombre=data['nombre'],
        usuario=data['usuario'],
        password=hashed_pw
    )
    db.add(nuevo)
    db.commit()

    # Generar token JWT
    payload = {
        'user_id': nuevo.id,
        'exp': datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    result = usuario_schema.dump(nuevo)
    return jsonify({'token': token, 'user': result}), 201

@auth_bp.route('/login', methods=['POST'])
def login_usuario():
    """Valida credenciales y emite JWT"""
    json_data = request.get_json() or {}
    usuario_input = json_data.get('usuario')
    password_input = json_data.get('password')

    if not usuario_input or not password_input:
        return jsonify({'error': 'Faltan campos de usuario o contraseña'}), 400

    db = next(get_db())
    usuario = db.query(Usuario).filter(Usuario.usuario == usuario_input).first()
    if not usuario or not check_password_hash(usuario.password, password_input):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    # Generar token JWT
    payload = {
        'user_id': usuario.id,
        'exp': datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({'mensaje': 'Inicio de sesión exitoso', 'token': token}), 200

# Ejemplo de ruta protegida usando el decorador
@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile():
    """Ruta de ejemplo que devuelve información del usuario autenticado"""
    db = next(get_db())
    usuario = db.query(Usuario).get(g.user_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    result = usuario_schema.dump(usuario)
    return jsonify(result), 200
