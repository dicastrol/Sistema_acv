# backend/ml/train_model.py

import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

def main():
    # 1) Carga de datos preprocesados
    csv_path = os.path.join(os.path.dirname(__file__), "features_clinicas.csv")
    df = pd.read_csv(csv_path)

    # 1.1) Codificar variables categóricas
    # Mapea 'M'->0, 'F'->1 en la columna sexo
    df['sexo'] = df['sexo'].map({'M': 0, 'F': 1})

    # 2) Separar X (features) e y (target)
    X = df.drop(columns=["paciente_id", "evento_acv"])
    y = df["evento_acv"]

    # 3) Dividir en entrenamiento/validación
    X_train, X_val, y_train, y_val = train_test_split(
        X, y,
        stratify=y,
        test_size=0.2,
        random_state=42
    )

    # 4) Entrenar RandomForest
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 5) Evaluar en el set de validación
    acc = model.score(X_val, y_val)
    print(f"Validación accuracy: {acc:.3f}")

    # 6) Guardar el modelo
    out_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(out_dir, exist_ok=True)
    model_path = os.path.join(out_dir, "rfc_acv.pkl")
    joblib.dump(model, model_path)
    print(f"✔️ Modelo guardado en {model_path}")

if __name__ == "__main__":
    main()
