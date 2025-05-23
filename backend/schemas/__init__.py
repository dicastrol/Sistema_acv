# backend/schemas/__init__.py
from .cita import CitaSchema
from .historia_clinica import HistoriaClinicaSchema
from .paciente import PacienteSchema
from .usuario import UsuarioSchema

__all__ = [
    "CitaSchema",
    "HistoriaClinicaSchema",
    "PacienteSchema",
    "UsuarioSchema",
]
