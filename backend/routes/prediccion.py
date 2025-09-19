import os
import pandas as pd
import joblib
from flask import Blueprint, jsonify, current_app
from flask_cors import cross_origin
from sqlalchemy import create_engine

pred_bp = Blueprint('pred', __name__, url_prefix='/prediccion')

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../ml/models/rfc_acv.pkl')
_model     = joblib.load(MODEL_PATH)

DB_PATH = os.path.join(os.path.dirname(__file__), '../acv.db')
ENGINE  = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})

ACV_FACTORES = {
    "edad",
    "sexo",
    "presion_sistolica",
    "presion_diastolica",
    "frecuencia_cardiaca",
    "arritmia",
    "obesidad",
    "tabaquismo",
    "alcohol",
    "drogas_estimulantes",
    "sedentarismo",
    "enfermedad_cardiaca_previa",
    "estres",
    "imc",
}

RISK_THRESHOLD = 0.7

def _calcular_prediccion(paciente_id: int):
    sql = """
      SELECT
        h.paciente_id,
        p.sexo,
        p.fecha_nacimiento,
        h.fecha_consulta,
        h.temperatura,
        h.presion_sistolica,
        h.presion_diastolica,
        h.frecuencia_cardiaca,
        h.frecuencia_respiratoria,
        h.peso,
        h.altura,
        h.imc,
        h.arritmia,
        h.obesidad,
        h.tabaquismo,
        h.alcohol,
        h.drogas_estimulantes,
        h.sedentarismo,
        h.enfermedad_cardiaca_previa,
        h.estres,
        h.evento_acv
      FROM historias_clinicas h
      JOIN pacientes p ON p.id = h.paciente_id
      WHERE h.paciente_id = :pid
      ORDER BY h.fecha_consulta DESC
      LIMIT 1
    """
    conn = ENGINE.raw_connection()
    try:
        df = pd.read_sql_query(
            sql,
            con=conn,
            params={"pid": paciente_id},
            parse_dates=["fecha_nacimiento", "fecha_consulta"],
        )
    finally:
        conn.close()

    if df.empty:
        raise ValueError("Sin historia clínica")

    df['edad'] = ((df['fecha_consulta'] - df['fecha_nacimiento']).dt.days / 365.25).round(1)
    df['delta_pa'] = 0.0
    df['consultas_ultimo_ano'] = 1
    df['std_fc_ultimo_ano'] = 0.0

    df['sexo'] = df['sexo'].map({'M': 0, 'F': 1})

    feature_cols = [
        "edad", "sexo", "temperatura", "presion_sistolica", "presion_diastolica",
        "frecuencia_cardiaca", "frecuencia_respiratoria", "peso", "altura", "imc",
        "arritmia", "obesidad", "tabaquismo", "alcohol", "drogas_estimulantes",
        "sedentarismo", "enfermedad_cardiaca_previa", "estres",
        "delta_pa", "consultas_ultimo_ano", "std_fc_ultimo_ano",
    ]
    X = df[feature_cols]

    prob = float(_model.predict_proba(X)[0, 1])
    riesgo = "alto" if prob >= RISK_THRESHOLD else "bajo"
    contexto = (
        "La probabilidad de ACV es muy alta" if riesgo == "alto"
        else "La probabilidad de ACV es muy baja"
    )

    importancias = getattr(_model, "feature_importances_", None)
    explicacion = []
    if riesgo == "alto" and importancias is not None:
        pares = [
            (f, X.iloc[0, i], importancias[i])
            for i, f in enumerate(feature_cols)
            if f in ACV_FACTORES
        ]
        top = sorted(pares, key=lambda x: x[2], reverse=True)[:5]
        explicacion = [
            {"feature": f, "valor": float(v), "peso": float(p)}
            for f, v, p in top
        ]

    if riesgo == "alto":
        recomendaciones = [
            "Consulte a un profesional de la salud.",
            "Controle su presión arterial y glucosa.",
            "Evite el tabaco y reduzca el consumo de alcohol.",
            "Mantenga una dieta equilibrada y baja en sal.",
            "Realice actividad física moderada con regularidad.",
        ]
    else:
        recomendaciones = [
            "Mantenga hábitos de vida saludables.",
            "Realice chequeos médicos periódicos.",
            "Controle su peso y presión arterial.",
            "Evite el consumo de tabaco.",
            "Consulte a un profesional ante cualquier síntoma.",
        ]

    return {
        "paciente_id": paciente_id,
        "probabilidad_acv": prob,
        "contexto": contexto,
        "factores_influyentes": explicacion,
        "recomendaciones": recomendaciones,
        "riesgo": riesgo,
    }

@pred_bp.route('/<int:paciente_id>')
@cross_origin()
def predecir_acv(paciente_id):
    try:
        return jsonify(_calcular_prediccion(paciente_id))
    except ValueError:
        return jsonify({"error": "Sin historia clínica"}), 404
    except Exception:
        current_app.logger.exception("Error en predecir_acv")
        return jsonify({"error": "No se pudo calcular la predicción"}), 500

@pred_bp.route('/')
@cross_origin()
def listar_predicciones():
    try:
        return jsonify(_listado_predicciones())
    except Exception:
        current_app.logger.exception("Error en listar_predicciones")
        return jsonify({"error": "No se pudo obtener el listado"}), 500


def _listado_predicciones():
    conn = ENGINE.raw_connection()
    try:
        ids = pd.read_sql_query(
            "SELECT id, nombre FROM pacientes",
            con=conn,
        )
    finally:
        conn.close()

    if ids.empty:
        return {"riesgo_alto": [], "riesgo_bajo": []}

    resultados = {"riesgo_alto": [], "riesgo_bajo": []}
    for row in ids.itertuples():
        try:
            pred = _calcular_prediccion(row.id)
        except ValueError:
            continue
        entrada = {
            "paciente_id": int(row.id),
            "nombre": row.nombre,
            "probabilidad_acv": pred["probabilidad_acv"],
        }
        clave = "riesgo_alto" if pred["riesgo"] == "alto" else "riesgo_bajo"
        resultados[clave].append(entrada)

    resultados["riesgo_alto"].sort(
        key=lambda x: x["probabilidad_acv"], reverse=True
    )
    resultados["riesgo_bajo"].sort(key=lambda x: x["probabilidad_acv"])

    return resultados
