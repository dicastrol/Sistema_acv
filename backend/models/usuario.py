# backend/models/usuario.py
from sqlalchemy import Column, Integer, String, Index
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (
        Index('ix_usuario_usuario', 'usuario'),
    )

    id       = Column(Integer, primary_key=True, index=True)
    nombre   = Column(String(100), nullable=False)
    usuario  = Column(String(50), unique=True, nullable=False)
    password = Column(String(128), nullable=False)

    def __repr__(self):
        return f"<Usuario id={self.id} usuario={self.usuario}>"
