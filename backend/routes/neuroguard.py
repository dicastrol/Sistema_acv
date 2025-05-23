# backend/routes/neuroguard.py
from flask import Blueprint, jsonify, current_app
from flask_cors import cross_origin
from sqlalchemy import text
from backend.database import engine

ng_bp = Blueprint('neuroguard', __name__, url_prefix='/neuroguard')

@ng_bp.route('/estadisticas')
@cross_origin()
def stats():
    conn = engine.connect()
    try:
        # — Datos generales —
        total_pacientes = conn.execute(
            text("SELECT COUNT(*) FROM pacientes")
        ).scalar()
        total_acv = conn.execute(
            text("SELECT COUNT(*) FROM historias_clinicas WHERE evento_acv=1")
        ).scalar()
        tasa_acv = total_acv / total_pacientes if total_pacientes else 0

        # — Incidencia mensual (últimos 12 meses) —
        incidencia = [
            {"mes": row["mes"], "acv": row["acv_count"]}
            for row in conn.execute(text("""
              SELECT
                strftime('%Y-%m', fecha_consulta) AS mes,
                SUM(CASE WHEN evento_acv=1 THEN 1 ELSE 0 END) AS acv_count
              FROM historias_clinicas
              WHERE fecha_consulta >= date('now','-12 months')
              GROUP BY mes
              ORDER BY mes DESC
              LIMIT 12
            """))
        ][::-1]

        # — Prevalencia de factores de riesgo —
        factores = {}
        for col in ["hipertension","diabetes","tabaquismo","sedentarismo",
                    "colesterol_alto","antecedentes_familiares_acv"]:
            cnt = conn.execute(text(f"""
                SELECT SUM(CASE WHEN {col}=1 THEN 1 ELSE 0 END) 
                FROM pacientes
            """)).scalar()
            factores[col] = cnt / total_pacientes if total_pacientes else 0

        # — Distribución por sexo —
        sexo_rows = conn.execute(text("""
            SELECT sexo, COUNT(*) AS cnt
            FROM pacientes
            GROUP BY sexo
        """)).fetchall()
        distribucion_sexo = [
            {"sexo": row["sexo"], "count": row["cnt"]}
            for row in sexo_rows
        ]

        # — Distribución por rango de edad —
        # Calculamos edad en SQL y agrupamos en bins de 10 años:
        edad_rows = conn.execute(text("""
            SELECT
              CASE
                WHEN edad BETWEEN 18 AND 29 THEN '18-29'
                WHEN edad BETWEEN 30 AND 39 THEN '30-39'
                WHEN edad BETWEEN 40 AND 49 THEN '40-49'
                WHEN edad BETWEEN 50 AND 59 THEN '50-59'
                WHEN edad BETWEEN 60 AND 69 THEN '60-69'
                WHEN edad BETWEEN 70 AND 79 THEN '70-79'
                ELSE '80+' END AS rango,
              COUNT(*) AS cnt
            FROM (
              SELECT CAST((julianday('now') - julianday(fecha_nacimiento)) / 365.25 AS INTEGER) AS edad
              FROM pacientes
            )
            GROUP BY rango
            ORDER BY rango
        """)).fetchall()
        distribucion_edad = [
            {"rango": row["rango"], "count": row["cnt"]}
            for row in edad_rows
        ]

        return jsonify({
            "total_pacientes": total_pacientes,
            "total_acv":       total_acv,
            "tasa_acv":        tasa_acv,
            "incidencia_mensual": incidencia,
            "prevalencia_factores": factores,
            "distribucion_sexo":    distribucion_sexo,
            "distribucion_edad":    distribucion_edad
        })
    except Exception:
        current_app.logger.exception("Error en neuroguard/estadisticas")
        return jsonify({"error": "No se pudieron calcular estadísticas"}), 500
    finally:
        conn.close()
