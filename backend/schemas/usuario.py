# backend/schemas/usuario.py
from marshmallow import Schema, fields, validate

class UsuarioSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El nombre es obligatorio")
    )
    usuario = fields.Str(
        required=True,
        validate=validate.Length(min=3, error="El usuario debe tener al menos 3 caracteres")
    )
    password = fields.Str(
        required=True,
        load_only=True,
        validate=[
            validate.Length(min=6, error="La contraseña debe tener al menos 6 caracteres"),
            validate.Regexp(
                r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
                error="La contraseña debe incluir al menos una mayúscula, una minúscula y un dígito"
            )
        ]
    )
