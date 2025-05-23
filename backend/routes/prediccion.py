# backend/routes/prediccion.py

import os
import pandas as pd
import joblib
from flask import Blueprint, jsonify, current_app
from flask_cors import cross_origin
from sqlalchemy import create_engine

pred_bp = Blueprint('pred', __name__, url_prefix='/prediccion')

# 1) Carga del modelo
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../ml/models/rfc_acv.pkl')
_model     = joblib.load(MODEL_PATH)

# 2) Conexión a la base de datos
DB_PATH = os.path.join(os.path.dirname(__file__), '../acv.db')
ENGINE  = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


@pred_bp.route('/<int:paciente_id>')
@cross_origin()
def predecir_acv(paciente_id):
    try:
        # 3) Traer la última historia clínica completa
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

        # usar raw_connection para compatibilidad con pandas
        conn = ENGINE.raw_connection()
        try:
            df = pd.read_sql_query(
                sql,
                con=conn,
                params={"pid": paciente_id},
                parse_dates=["fecha_nacimiento", "fecha_consulta"]
            )
        finally:
            conn.close()

        if df.empty:
            return jsonify({"error": "Sin historia clínica"}), 404

        # 4) Feature engineering idéntico a preprocessing.py
        df['edad'] = ((df['fecha_consulta'] - df['fecha_nacimiento'])
                      .dt.days / 365.25).round(1)
        df['delta_pa'] = 0.0
        df['consultas_ultimo_ano'] = 1
        df['std_fc_ultimo_ano'] = 0.0

        # 5) Codificar sexo
        df['sexo'] = df['sexo'].map({'M': 0, 'F': 1})

        # 6) Selección de las 21 columnas en mismo orden
        feature_cols = [
            "edad","sexo","temperatura","presion_sistolica","presion_diastolica",
            "frecuencia_cardiaca","frecuencia_respiratoria","peso","altura","imc",
            "arritmia","obesidad","tabaquismo","alcohol","drogas_estimulantes",
            "sedentarismo","enfermedad_cardiaca_previa","estres",
            "delta_pa","consultas_ultimo_ano","std_fc_ultimo_ano"
        ]
        X = df[feature_cols].values

        # 7) Predicción
        prob = float(_model.predict_proba(X)[0, 1])

        return jsonify({
            "paciente_id": paciente_id,
            "probabilidad_acv": prob
        })

    except Exception:
        current_app.logger.exception("Error en predecir_acv")
        return jsonify({"error": "No se pudo calcular la predicción"}), 500
