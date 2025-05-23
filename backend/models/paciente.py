# backend/models/paciente.py
from sqlalchemy import Column, Integer, String, Date, Boolean, Index
from sqlalchemy.orm import relationship
from ..database import Base
from backend.models.cita import Cita

class Paciente(Base):
    __tablename__ = "pacientes"
    __table_args__ = (
        Index('ix_paciente_documento', 'documento'),
    )

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo_documento = Column(String(2), nullable=False)
    documento = Column(String(20), unique=True, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo = Column(String(10), nullable=False)

    # Datos de contacto
    telefono = Column(String(15), nullable=True)
    direccion = Column(String(200), nullable=True)
    email = Column(String(100), nullable=True)
    estado_civil = Column(String(50), nullable=True)
    ocupacion = Column(String(100), nullable=True)
    grupo_sanguineo = Column(String(5), nullable=True)
    aseguradora = Column(String(100), nullable=True)

    # Contacto de emergencia
    contacto_emergencia = Column(String(100), nullable=True)
    contacto_emergencia_telefono = Column(String(15), nullable=True)
    contacto_emergencia_parentesco = Column(String(50), nullable=True)

    # Factores de riesgo
    hipertension = Column(Boolean, default=False)
    diabetes = Column(Boolean, default=False)
    tabaquismo = Column(Boolean, default=False)
    sedentarismo = Column(Boolean, default=False)
    colesterol_alto = Column(Boolean, default=False)
    antecedentes_familiares_acv = Column(Boolean, default=False)

    # Nuevo campo: si el paciente ya sufrió un ACV
    tuvo_acv = Column(Boolean, default=False, nullable=False)

    # Relaciones
    historias_clinicas = relationship(
        "HistoriaClinica",
        back_populates="paciente",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    citas = relationship(
        "Cita",
        back_populates="paciente",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        return f"<Paciente id={self.id} nombre={self.nombre} documento={self.documento}>"
