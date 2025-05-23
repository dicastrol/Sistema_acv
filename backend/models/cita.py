# backend/models/cita.py
from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Text, Index
from sqlalchemy.orm import relationship
from ..database import Base

class Cita(Base):
    __tablename__ = "citas"
    __table_args__ = (
        Index('ix_citas_fecha_hora', 'fecha_hora'),
    )

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    fecha_hora = Column(DateTime, default=datetime.utcnow, nullable=False)
    servicio = Column(String(100), nullable=False)
    personal_salud = Column(String(100), nullable=True)
    estado = Column(String(20), default="esperado")
    notas = Column(Text)

    # Relación con paciente (lado "muchas")
    paciente = relationship(
        "Paciente",
        back_populates="citas"
    )

    def __repr__(self):
        return f"<Cita id={self.id} paciente={self.paciente_id} fecha={self.fecha_hora}>"
