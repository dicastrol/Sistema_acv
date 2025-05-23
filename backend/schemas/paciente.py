from marshmallow import Schema, fields, validates, ValidationError, validate
from datetime import date

class PacienteSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El nombre es obligatorio")
    )
    tipo_documento = fields.Str(
        required=True,
        validate=validate.OneOf(["CC", "TI", "CE"], error="Tipo de documento inválido")
    )
    documento = fields.Str(
        required=True,
        validate=validate.Regexp(r"^\d+$", error="El documento debe contener sólo dígitos")
    )
    fecha_nacimiento = fields.Date(required=True)
    sexo = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El sexo es obligatorio")
    )

    telefono = fields.Str(
        load_default=None,
        allow_none=True,
        validate=validate.Regexp(r"^\+?\d{7,15}$", error="Teléfono inválido, debe tener entre 7 y 15 dígitos")
    )
    direccion = fields.Str(load_default=None, allow_none=True)
    email = fields.Email(load_default=None, allow_none=True)
    estado_civil = fields.Str(load_default=None, allow_none=True)
    ocupacion = fields.Str(load_default=None, allow_none=True)
    grupo_sanguineo = fields.Str(load_default=None, allow_none=True)
    aseguradora = fields.Str(load_default=None, allow_none=True)

    contacto_emergencia = fields.Str(load_default=None, allow_none=True)
    contacto_emergencia_telefono = fields.Str(
        load_default=None,
        allow_none=True,
        validate=validate.Regexp(r"^\+?\d{7,15}$", error="Teléfono de emergencia inválido")
    )
    contacto_emergencia_parentesco = fields.Str(load_default=None, allow_none=True)

    hipertension = fields.Bool(load_default=False)
    diabetes = fields.Bool(load_default=False)
    tabaquismo = fields.Bool(load_default=False)
    sedentarismo = fields.Bool(load_default=False)
    colesterol_alto = fields.Bool(load_default=False)
    antecedentes_familiares_acv = fields.Bool(load_default=False)

    # Aquí es solo el flag de ACV previo al paciente
    tuvo_acv = fields.Bool(load_default=False)

    @validates("fecha_nacimiento")
    def validate_fecha_nacimiento(self, value, **kwargs):
        if value > date.today():
            raise ValidationError("La fecha de nacimiento no puede ser futura.")
