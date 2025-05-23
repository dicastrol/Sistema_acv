from marshmallow import Schema, fields, validates, ValidationError, post_load
from datetime import date

class HistoriaClinicaSchema(Schema):
    id                         = fields.Int(dump_only=True)
    paciente_id                = fields.Int(required=True)
    fecha_consulta             = fields.Date(required=True)

    temperatura                = fields.Float(allow_none=True)
    presion_sistolica          = fields.Float(required=True)
    presion_diastolica         = fields.Float(required=True)
    frecuencia_cardiaca        = fields.Int(allow_none=True)
    frecuencia_respiratoria    = fields.Int(allow_none=True)
    arritmia                   = fields.Bool(load_default=False)
    notas_signos               = fields.Str(allow_none=True)

    peso                       = fields.Float(required=True)
    altura                     = fields.Float(required=True)
    imc                        = fields.Float(dump_only=True)

    obesidad                   = fields.Bool(load_default=False)
    tabaquismo                 = fields.Bool(load_default=False)
    alcohol                    = fields.Bool(load_default=False)
    drogas_estimulantes        = fields.Bool(load_default=False)
    sedentarismo               = fields.Bool(load_default=False)
    enfermedad_cardiaca_previa = fields.Bool(load_default=False)
    estres                     = fields.Bool(load_default=False)

    motivo_consulta            = fields.Str(allow_none=True)
    fecha_aparicion            = fields.Date(allow_none=True)
    condiciones_previas        = fields.Str(allow_none=True)

    historial_familiar         = fields.Str(allow_none=True)
    medicamentos               = fields.Str(allow_none=True)

    diagnostico                = fields.Str(allow_none=True)

    # Nuevo campo: indique si en esta consulta hubo un evento de ACV
    evento_acv                 = fields.Bool(load_default=False)

    @validates("fecha_consulta")
    def check_fecha_pasada(self, value, **kwargs):
        if value > date.today():
            raise ValidationError("La fecha de consulta no puede ser futura.")

    @post_load
    def calc_imc(self, data, **kwargs):
        p = data.get("peso")
        a = data.get("altura")
        if p and a:
            data["imc"] = round(p / (a**2), 2)
        return data
