# backend/schemas/cita.py
from marshmallow import Schema, fields, validate

class CitaSchema(Schema):
    id               = fields.Int(dump_only=True)
    paciente_id      = fields.Int(required=True)
    paciente_nombre  = fields.Method("get_paciente_nombre", dump_only=True)
    fecha_hora       = fields.DateTime(required=True, format="iso")
    servicio         = fields.Str(required=True, validate=validate.Length(min=1))
    personal_salud   = fields.Str(load_default=None, allow_none=True)
    estado           = fields.Str(
                          load_default="esperado",
                          validate=validate.OneOf(
                            ["esperado", "llegada registrada", "completado", "cancelado"]
                          )
                        )
    notas            = fields.Str(load_default=None, allow_none=True)

    def get_paciente_nombre(self, obj):
        # obj es la instancia de Cita; .paciente viene del relationship
        return obj.paciente.nombre if obj.paciente else None
