from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models.paciente import Paciente
from ..schemas.paciente import PacienteSchema

pacientes_bp = Blueprint("pacientes", __name__)
paciente_schema  = PacienteSchema()
pacientes_schema = PacienteSchema(many=True)

def get_db():
    # Context manager para asegurarnos de cerrar la sesión
    with SessionLocal() as db:
        yield db

@pacientes_bp.route("/pacientes", methods=["GET"])
def obtener_todos_los_pacientes():
    db = next(get_db())
    todos = db.query(Paciente).all()
    return jsonify(pacientes_schema.dump(todos)), 200

@pacientes_bp.route("/pacientes/<int:id>", methods=["GET"])
def obtener_paciente(id):
    db = next(get_db())
    paciente = db.query(Paciente).get(id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404
    return jsonify(paciente_schema.dump(paciente)), 200

@pacientes_bp.route("/pacientes", methods=["POST"])
def crear_paciente():
    try:
        data = paciente_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify(err.messages), 400

    db = next(get_db())
    # Validación extra de unicidad
    if db.query(Paciente).filter(Paciente.documento == data["documento"]).first():
        return jsonify({"error": "El documento ya está registrado"}), 400

    nuevo = Paciente(**data)
    db.add(nuevo)
    db.commit()
    return jsonify(paciente_schema.dump(nuevo)), 201

@pacientes_bp.route("/pacientes/<int:id>", methods=["PUT"])
def actualizar_paciente(id):
    try:
        data = paciente_schema.load(request.get_json() or {}, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db = next(get_db())
    paciente = db.query(Paciente).get(id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404

    for campo, valor in data.items():
        setattr(paciente, campo, valor)
    db.commit()
    return jsonify(paciente_schema.dump(paciente)), 200

@pacientes_bp.route("/pacientes/<int:id>", methods=["DELETE"])
def eliminar_paciente(id):
    db = next(get_db())
    paciente = db.query(Paciente).get(id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404
    db.delete(paciente)
    db.commit()
    return jsonify({"mensaje": "Paciente eliminado correctamente"}), 200
