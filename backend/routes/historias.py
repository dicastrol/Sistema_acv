# backend/routes/historias.py
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload
from ..database import SessionLocal
from ..models.historia_clinica import HistoriaClinica
from ..schemas.historia_clinica import HistoriaClinicaSchema

# Blueprint con prefijo para historias clínicas
historias_bp = Blueprint('historias', __name__, url_prefix='/historias')

# Instancias del schema
historia_schema  = HistoriaClinicaSchema()
historias_schema = HistoriaClinicaSchema(many=True)

def get_db():
    """Context manager para sesión de DB"""
    with SessionLocal() as db:
        yield db

# 1) Listar todas las historias (opcional por rango de fechas)
@historias_bp.route('', methods=['GET'])
def listar_historias():
    db = next(get_db())
    desde = request.args.get('desde')  # YYYY-MM-DD
    hasta = request.args.get('hasta')
    query = db.query(HistoriaClinica)
    if desde:
        try:
            query = query.filter(HistoriaClinica.fecha_consulta >= desde)
        except Exception:
            return jsonify({'error': "Fecha 'desde' inválida (YYYY-MM-DD)"}), 400
    if hasta:
        try:
            query = query.filter(HistoriaClinica.fecha_consulta <= hasta)
        except Exception:
            return jsonify({'error': "Fecha 'hasta' inválida (YYYY-MM-DD)"}), 400
    historias = query.order_by(HistoriaClinica.fecha_consulta.desc()).all()
    return jsonify(historias_schema.dump(historias)), 200

# 2) Obtener una historia por ID
def obtener_historia(id):
    db = next(get_db())
    historia = db.query(HistoriaClinica).options(joinedload(HistoriaClinica.paciente)).get(id)
    if not historia:
        return jsonify({'error': 'Historia no encontrada'}), 404
    return jsonify(historia_schema.dump(historia)), 200

historias_bp.add_url_rule('/<int:id>', 'obtener_historia', obtener_historia, methods=['GET'])

# 3) Crear una nueva historia clínica
@historias_bp.route('', methods=['POST'])
def crear_historia():
    json_data = request.get_json() or {}
    try:
        data = historia_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db = next(get_db())
    from ..models.paciente import Paciente
    if not db.query(Paciente).get(data['paciente_id']):
        return jsonify({'error': 'Paciente no encontrado'}), 404

    nueva = HistoriaClinica(
        paciente_id               = data['paciente_id'],
        fecha_consulta            = data['fecha_consulta'],
        temperatura               = data.get('temperatura'),
        presion_sistolica         = data.get('presion_sistolica'),
        presion_diastolica        = data.get('presion_diastolica'),
        frecuencia_cardiaca       = data.get('frecuencia_cardiaca'),
        frecuencia_respiratoria   = data.get('frecuencia_respiratoria'),
        arritmia                  = data.get('arritmia'),
        notas_signos              = data.get('notas_signos'),
        peso                      = data['peso'],
        altura                    = data['altura'],
        imc                       = data.get('imc'),
        obesidad                  = data.get('obesidad'),
        tabaquismo                = data.get('tabaquismo'),
        alcohol                   = data.get('alcohol'),
        drogas_estimulantes       = data.get('drogas_estimulantes'),
        sedentarismo              = data.get('sedentarismo'),
        enfermedad_cardiaca_previa= data.get('enfermedad_cardiaca_previa'),
        estres                    = data.get('estres'),
        motivo_consulta           = data.get('motivo_consulta'),
        fecha_aparicion           = data.get('fecha_aparicion'),
        condiciones_previas       = data.get('condiciones_previas'),
        historial_familiar        = data.get('historial_familiar'),
        medicamentos              = data.get('medicamentos'),
        diagnostico               = data.get('diagnostico'),
    )
    db.add(nueva)
    db.commit()
    return jsonify(historia_schema.dump(nueva)), 201

# 4) Actualizar historia clínica
@historias_bp.route('/<int:id>', methods=['PUT'])
def actualizar_historia(id):
    json_data = request.get_json() or {}
    try:
        data = historia_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db = next(get_db())
    historia = db.query(HistoriaClinica).get(id)
    if not historia:
        return jsonify({'error': 'Historia no encontrada'}), 404

    for field, value in data.items():
        setattr(historia, field, value)
    if historia.peso and historia.altura:
        historia.imc = round(historia.peso / (historia.altura**2), 2)

    db.commit()
    return jsonify(historia_schema.dump(historia)), 200

# 5) Eliminar historia clínica
@historias_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_historia(id):
    db = next(get_db())
    historia = db.query(HistoriaClinica).get(id)
    if not historia:
        return jsonify({'error': 'Historia no encontrada'}), 404
    db.delete(historia)
    db.commit()
    return jsonify({'mensaje': 'Historia eliminada correctamente'}), 200

# 6) Listar historias de un paciente (resumen ligero)
@historias_bp.route('/paciente/<int:paciente_id>', methods=['GET'])
def historias_por_paciente(paciente_id):
    db = next(get_db())
    historias = (
        db.query(HistoriaClinica)
          .filter(HistoriaClinica.paciente_id == paciente_id)
          # primero por fecha desc, y dentro de la misma fecha por id desc
          .order_by(
              HistoriaClinica.fecha_consulta.desc(),
              HistoriaClinica.id.desc()
          )
          .all()
    )
    resumen = [{
        'id': h.id,
        'fecha_consulta': h.fecha_consulta.isoformat(),
        'motivo_consulta': h.motivo_consulta,
        'imc': h.imc
    } for h in historias]
    return jsonify(resumen), 200

# 7) Resumen estadístico de un paciente
@historias_bp.route('/paciente/<int:paciente_id>/resumen', methods=['GET'])
def resumen_historial(paciente_id):
    db = next(get_db())
    historias = (
        db.query(HistoriaClinica)
          .filter(HistoriaClinica.paciente_id == paciente_id)
          .order_by(HistoriaClinica.fecha_consulta.asc())
          .all()
    )
    if not historias:
        return jsonify({'error': 'Sin historias para este paciente'}), 404

    total = len(historias)
    suma_temp = suma_fc = suma_fr = suma_imc = 0
    condiciones = []
    motivos     = []
    detalle     = []

    from collections import Counter
    for h in historias:
        detalle.append(historia_schema.dump(h))
        suma_temp += h.temperatura or 0
        suma_fc   += h.frecuencia_cardiaca or 0
        suma_fr   += h.frecuencia_respiratoria or 0
        suma_imc  += h.imc or 0
        if h.condiciones_previas:
            condiciones += [c.strip().lower() for c in h.condiciones_previas.split(',')]
        if h.motivo_consulta:
            motivos.append(h.motivo_consulta.strip().lower())

    analisis = {
        'total_consultas': total,
        'promedio_temperatura':        round(suma_temp/total, 2),
        'promedio_frecuencia_cardiaca': round(suma_fc/total, 2),
        'promedio_frecuencia_respiratoria': round(suma_fr/total, 2),
        'promedio_imc':                round(suma_imc/total, 2),
        'condiciones_frecuentes':      Counter(condiciones).most_common(3),
        'motivos_frecuentes':          Counter(motivos).most_common(3)
    }

    return jsonify({'resumen_clinico': detalle, 'analisis_resumen': analisis}), 200
