# backend/models/historia_clinica.py
from datetime import date
from sqlalchemy import Column, Integer, Date, Float, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id                        = Column(Integer, primary_key=True, index=True)
    paciente_id               = Column(Integer, ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    fecha_consulta            = Column(Date, nullable=False)

    # Signos vitales
    temperatura               = Column(Float, nullable=True)
    presion_sistolica         = Column(Float, nullable=False)
    presion_diastolica        = Column(Float, nullable=False)
    frecuencia_cardiaca       = Column(Integer, nullable=True)
    frecuencia_respiratoria   = Column(Integer, nullable=True)
    arritmia                  = Column(Boolean, default=False)
    notas_signos              = Column(Text, nullable=True)

    # Comorbilidades (heredadas o detectadas en consulta)
    hipertension              = Column(Boolean, default=False)
    diabetes                  = Column(Boolean, default=False)

    # Datos biométricos
    peso                      = Column(Float, nullable=False)
    altura                    = Column(Float, nullable=False)
    imc                       = Column(Float, nullable=True)

    # Factores de riesgo
    obesidad                  = Column(Boolean, default=False)
    tabaquismo                = Column(Boolean, default=False)
    alcohol                   = Column(Boolean, default=False)
    drogas_estimulantes       = Column(Boolean, default=False)
    sedentarismo              = Column(Boolean, default=False)
    enfermedad_cardiaca_previa= Column(Boolean, default=False)
    estres                    = Column(Boolean, default=False)
    antecedentes_familiares_acv = Column(Boolean, default=False)

    # Motivo y antecedentes
    motivo_consulta           = Column(Text, nullable=True)
    fecha_aparicion           = Column(Date, nullable=True)
    condiciones_previas       = Column(Text, nullable=True)

    # Historial y medicación
    historial_familiar        = Column(Text, nullable=True)
    medicamentos              = Column(Text, nullable=True)

    # Diagnóstico del doctor
    diagnostico               = Column(Text, nullable=True)

    # Evento de ACV en esta consulta
    evento_acv                = Column(Boolean, default=False, nullable=False)

    # Relación con paciente
    paciente = relationship("Paciente", back_populates="historias_clinicas")

    def __repr__(self):
        return f"<HistoriaClinica id={self.id} paciente={self.paciente_id} fecha={self.fecha_consulta}>"
