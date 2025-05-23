# backend/ml/preprocess.py

import pandas as pd
from datetime import date
from sqlalchemy import create_engine
import os

# 1) Conexión a la base de datos
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH  = os.path.join(BASE_DIR, 'acv.db')
ENGINE   = create_engine(f"sqlite:///{DB_PATH}", echo=False)

def run():
    sql = """
        SELECT
        h.paciente_id,
        p.sexo,
        p.fecha_nacimiento,
        h.fecha_consulta,

        -- signos vitales
        h.temperatura,
        h.presion_sistolica,
        h.presion_diastolica,
        h.frecuencia_cardiaca,
        h.frecuencia_respiratoria,

        -- datos biométricos
        h.peso,
        h.altura,
        h.imc,

        -- flags que vienen de la propia historia
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
        """

       # --- Lectura de datos desde SQLite ---
    raw_conn = ENGINE.raw_connection()
    try:
        df = pd.read_sql_query(
            sql,
            con=raw_conn,
            parse_dates=["fecha_nacimiento", "fecha_consulta"]
        )
    finally:
        raw_conn.close()



    # 3) Edad en fecha de consulta
    df['edad'] = ((df['fecha_consulta'] - df['fecha_nacimiento'])
                  .dt.days / 365.25).round(1)

    # 4) Orden cronológico
    df = df.sort_values(['paciente_id', 'fecha_consulta'])

    # 5) Métricas de tendencia por paciente
    def compute_group_features(group):
        one_year_ago = group['fecha_consulta'].max() - pd.Timedelta(days=365)
        delta_pa = group['presion_sistolica'].diff().fillna(0).iloc[-1]
        consultas_ultimo_ano = int(group[group['fecha_consulta'] >= one_year_ago].shape[0])
        last_year = group.loc[group['fecha_consulta'] >= one_year_ago, 'frecuencia_cardiaca'].dropna()
        std_fc = float(last_year.std()) if len(last_year) >= 2 else 0.0
        return pd.Series({
            'delta_pa': delta_pa,
            'consultas_ultimo_ano': consultas_ultimo_ano,
            'std_fc_ultimo_ano': std_fc
        })

    trends = df.groupby('paciente_id').apply(compute_group_features).reset_index()

    # 6) Última consulta de cada paciente
    last = df.groupby('paciente_id').tail(1).reset_index(drop=True)

    # 7) Merge
    feat = last.merge(trends, on='paciente_id')

    # 8) Columnas finales
    features = [
      'paciente_id', 'edad', 'sexo',
      'temperatura','presion_sistolica','presion_diastolica',
      'frecuencia_cardiaca','frecuencia_respiratoria',
      'peso','altura','imc','arritmia','obesidad',
      'tabaquismo','alcohol','drogas_estimulantes','sedentarismo',
      'enfermedad_cardiaca_previa','estres',
      'delta_pa','consultas_ultimo_ano','std_fc_ultimo_ano',
      'evento_acv'
    ]
    df_final = feat[features]

    # 9) Guardar CSV
    out_path = os.path.join(os.path.dirname(__file__), 'features_clinicas.csv')
    df_final.to_csv(out_path, index=False)
    print(f"✅ Preprocesamiento listo: {out_path}")
    return df_final

if __name__ == '__main__':
    run()
