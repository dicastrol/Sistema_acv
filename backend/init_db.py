# backend/init_db.py
from backend.database      import engine, Base, SessionLocal
from backend.models.usuario import Usuario
from werkzeug.security import generate_password_hash

# Crea todas las tablas (si no existen)
Base.metadata.create_all(bind=engine)

# Inicializa la sesión
db = SessionLocal()
try:
    # Verifica si el usuario admin ya existe
    if not db.query(Usuario).filter(Usuario.usuario == "admin").first():
        # Hashea la contraseña con PBKDF2 (igual que login)
        hashed_pw = generate_password_hash("Admin123")
        admin = Usuario(
            nombre="Administrador",
            usuario="admin",
            password=hashed_pw
        )
        db.add(admin)
        db.commit()
        print("Usuario admin creado: admin / Admin123")
    else:
        print("Usuario admin ya existe")
finally:
    db.close()
