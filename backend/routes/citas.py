# backend/routes/citas.py
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models.cita import Cita
from ..schemas.cita import CitaSchema
from sqlalchemy import func
from sqlalchemy.orm import joinedload

# Blueprint con prefijo para citas
citas_bp = Blueprint('citas', __name__, url_prefix='/citas')

# Instancias del schema
cita_schema = CitaSchema()
citas_schema = CitaSchema(many=True)

def get_db():
    """Context manager para sesión de base de datos"""
    with SessionLocal() as db:
        yield db

# 1) Listar citas de hoy
@citas_bp.route('/hoy', methods=['GET'])
def listar_citas_hoy():
    db = next(get_db())
    hoy = func.current_date()
    citas = (
        db.query(Cita)
          .options(joinedload(Cita.paciente))
          .filter(func.date(Cita.fecha_hora) == hoy)
          .order_by(Cita.fecha_hora.asc())
          .all()
    )
    return jsonify(citas_schema.dump(citas)), 200

# 2) Listar todas las citas
@citas_bp.route('', methods=['GET'])
def listar_citas():
    db = next(get_db())
    citas = db.query(Cita).options(joinedload(Cita.paciente)).all()
    return jsonify(citas_schema.dump(citas)), 200

# 3) Crear una nueva cita
@citas_bp.route('', methods=['POST'])
def crear_cita():
    try:
        data = cita_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify(err.messages), 400

    db = next(get_db())
    nueva = Cita(**data)
    db.add(nueva)
    db.commit()
    return jsonify(cita_schema.dump(nueva)), 201

# 4) Obtener una cita por ID
@citas_bp.route('/<int:id>', methods=['GET'])
def obtener_cita(id):
    db = next(get_db())
    cita = db.query(Cita).options(joinedload(Cita.paciente)).get(id)
    if not cita:
        return jsonify({'error': 'Cita no encontrada'}), 404
    return jsonify(cita_schema.dump(cita)), 200

# 5) Actualizar una cita
# En routes/citas.py, en actualizar_cita…
@citas_bp.route('/<int:id>', methods=['PUT'])
def actualizar_cita(id):
    db = next(get_db())
    cita = db.query(Cita).get(id)
    if not cita:
        return jsonify({'error': 'Cita no encontrada'}), 404

    try:
        # partial=True permitirá enviar sólo { estado: "llegada registrada" }
        data = cita_schema.load(request.get_json() or {}, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for field, value in data.items():
        setattr(cita, field, value)
    db.commit()
    return jsonify(cita_schema.dump(cita)), 200


# 6) Eliminar una cita
@citas_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_cita(id):
    db = next(get_db())
    cita = db.query(Cita).get(id)
    if not cita:
        return jsonify({'error': 'Cita no encontrada'}), 404
    db.delete(cita)
    db.commit()
    return jsonify({'mensaje': 'Cita eliminada correctamente'}), 200
