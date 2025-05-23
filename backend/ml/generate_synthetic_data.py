
# Archivo: backend/ml/generate_synthetic_data.py
from backend.database import Base, engine
# Limpiar metadata previa
Base.metadata.clear()

import random
from datetime import date, datetime, timedelta, time
from faker import Faker
from sqlalchemy.orm import sessionmaker

from backend.models.paciente import Paciente
from backend.models.historia_clinica import HistoriaClinica
from backend.models.cita import Cita

fake = Faker()
Session = sessionmaker(bind=engine)
session = Session()

# Servicios disponibles
SERVICIOS = [
    'Medicina General', 'Cardiología', 'Neurología', 'Psicología',
    'Fisioterapia', 'Dermatología', 'Pediatría'
]

# Configuración
NUM_PACIENTES = 200
HIST_START    = date(1980, 1, 1)
HIST_END      = date(2025, 12, 31)


def random_birthdate(min_age=18, max_age=90):
    today = date.today()
    return fake.date_between(
        start_date=today.replace(year=today.year - max_age),
        end_date  =today.replace(year=today.year - min_age)
    )


def seed():
    # 1) Reiniciar esquema de BD
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 2) Crear y guardar pacientes
    pacientes = []
    for _ in range(NUM_PACIENTES):
        nac       = random_birthdate()
        edad      = (date.today() - nac).days // 365
        base_peso = round(random.uniform(50, 90), 1)
        base_alt  = round(random.uniform(1.5, 1.8), 2)
        base_pa_s = round(random.uniform(110, 130), 1)
        base_pa_d = round(random.uniform(70, 85), 1)
        base_fc   = random.randint(60, 75)
        flag_arr  = random.random() < 0.05

        base_imc  = base_peso / (base_alt ** 2)
        flag_obes = base_imc >= 30

        # Reglas de coherencia
        flag_sedentarismo            = random.random() < (0.7 if flag_obes else 0.3)
        flag_hipertension            = random.random() < (0.3 if flag_obes or edad > 50 else 0.1)
        flag_diabetes                = random.random() < (0.2 if flag_obes or edad > 60 else 0.05)
        flag_colesterol_alto         = random.random() < (0.2 if flag_obes else 0.1)
        flag_antecedentes_familiares = random.random() < 0.05
        flag_alcohol                 = random.random() < 0.1
        flag_drogas                  = random.random() < 0.05
        flag_enf_cardiaca_previa     = random.random() < (0.3 if flag_hipertension else 0.1)
        flag_estres                  = random.random() < 0.15
        flag_acv                     = random.random() < 0.02

        # Documento y teléfono
        documento = fake.unique.numerify(text='##########')
        telefono  = fake.numerify(text='3#########')

        p = Paciente(
            nombre                         = fake.name(),
            tipo_documento                 = random.choice(['CC','TI','CE']),
            documento                      = documento,
            fecha_nacimiento               = nac,
            sexo                           = random.choice(['M','F']),
            telefono                       = telefono,
            direccion                      = fake.address(),
            email                          = fake.email(),
            estado_civil                   = random.choice(['Soltero','Casado','Otro']),
            ocupacion                      = fake.job(),
            grupo_sanguineo                = random.choice(['O+','O-','A+','A-','B+','B-','AB+','AB-']),
            aseguradora                    = fake.company(),
            contacto_emergencia            = fake.name(),
            contacto_emergencia_telefono   = telefono,
            contacto_emergencia_parentesco = random.choice(['Padre','Madre','Hermano','Cónyuge']),

            hipertension                   = flag_hipertension,
            diabetes                       = flag_diabetes,
            tabaquismo                     = random.random() < 0.15,
            sedentarismo                   = flag_sedentarismo,
            colesterol_alto                = flag_colesterol_alto,
            antecedentes_familiares_acv    = flag_antecedentes_familiares,
        )
        # Atributos internos para historias
        p._base_peso                 = base_peso
        p._base_altura               = base_alt
        p._base_pa_sistolica         = base_pa_s
        p._base_pa_diastolica        = base_pa_d
        p._base_fc                   = base_fc
        p._flag_arritmia             = flag_arr
        p._flag_alcohol              = flag_alcohol
        p._flag_drogas_estimulantes  = flag_drogas
        p._flag_enf_cardiaca_previa  = flag_enf_cardiaca_previa
        p._flag_estres               = flag_estres
        p._flag_evento_acv           = flag_acv

        pacientes.append(p)

    session.add_all(pacientes)
    session.commit()

    # 3) Generar historias clínicas dinámicas
    historias = []
    for p in pacientes:
        # Generamos fechas de consulta ordenadas
        fechas_consulta = sorted(
            fake.date_between(start_date=HIST_START, end_date=HIST_END)
            for _ in range((date.today() - p.fecha_nacimiento).days // 365 * random.randint(2, 6))
        )

        last_date = fechas_consulta[0]
        # variables de estado que evolucionan
        curr_ht = p.hipertension
        curr_diab = p.diabetes

        for f in fechas_consulta:
            delta_years = (f - last_date).days / 365
            last_date = f

            # Evolución de factores con el tiempo
            if not curr_ht and random.random() < 0.02 * delta_years:
                curr_ht = True
            if not curr_diab and random.random() < 0.015 * delta_years:
                curr_diab = True

            peso_calc = p._base_peso + 0.2 * ((f - fechas_consulta[0]).days / 365) + random.uniform(-0.5,0.5)
            imc_calc = peso_calc / (p._base_altura ** 2)
            flag_obs = imc_calc >= 30

            riesgos = []
            if flag_obs: riesgos.append('Obesidad')
            if p.tabaquismo: riesgos.append('Tabaquismo')
            if p._flag_alcohol: riesgos.append('Alcohol')
            if p._flag_drogas_estimulantes: riesgos.append('Drogas estimulantes')
            if p.sedentarismo: riesgos.append('Sedentarismo')
            if p._flag_enf_cardiaca_previa: riesgos.append('Enfermedad cardíaca previa')
            if p._flag_estres: riesgos.append('Estrés')
            if p.antecedentes_familiares_acv: riesgos.append('Antecedentes familiares ACV')
            resumen = ", ".join(riesgos) if riesgos else None

            hc = HistoriaClinica(
                paciente_id                 = p.id,
                fecha_consulta              = f,
                temperatura                 = round(random.uniform(36.0, 37.5), 1),
                presion_sistolica           = round(p._base_pa_sistolica + random.uniform(-8, 8), 1),
                presion_diastolica          = round(p._base_pa_diastolica + random.uniform(-5, 5), 1),
                frecuencia_cardiaca         = int(p._base_fc + random.uniform(-5, 5)),
                frecuencia_respiratoria     = random.randint(12, 20),
                arritmia                    = p._flag_arritmia,

                obesidad                    = flag_obs,
                tabaquismo                  = p.tabaquismo,
                alcohol                     = p._flag_alcohol,
                drogas_estimulantes         = p._flag_drogas_estimulantes,
                sedentarismo                = p.sedentarismo,
                enfermedad_cardiaca_previa  = p._flag_enf_cardiaca_previa,
                estres                      = p._flag_estres,
                antecedentes_familiares_acv = p.antecedentes_familiares_acv,
                hipertension                = curr_ht,
                diabetes                    = curr_diab,
                evento_acv                  = p._flag_evento_acv,

                peso                        = round(peso_calc, 1),
                altura                      = p._base_altura,
                imc                         = round(imc_calc, 2),

                motivo_consulta             = None,
                fecha_aparicion             = None,
                condiciones_previas         = resumen,
                notas_signos                = None,
                historial_familiar          = None,
                medicamentos                = None,
                diagnostico                 = None,
            )
            historias.append(hc)

    # Guardar historias para luego crear citas
    session.add_all(historias)
    session.commit()

    # 4) Generar citas coherentes con las historias
    citas = []
    today = date.today()
    for hc in historias:
        # cita 1-5 días antes de la consulta
        cita_fecha_date = hc.fecha_consulta - timedelta(days=random.randint(1, 5))
        cita_fecha_hora = datetime.combine(cita_fecha_date, time(hour=random.randint(8, 16), minute=random.choice([0,15,30,45])))
        estado = 'completado' if cita_fecha_date < today else 'esperado'
        servicio = random.choice(SERVICIOS)
        citas.append(Cita(
            paciente_id   = hc.paciente_id,
            fecha_hora    = cita_fecha_hora,
            servicio      = servicio,
            personal_salud= fake.name(),
            estado        = estado,
            notas         = None
        ))

    session.bulk_save_objects(citas)
    session.commit()
    session.close()

    print(f"Simulados {len(pacientes)} pacientes, {len(historias)} historias y {len(citas)} citas.")

if __name__ == "__main__":
    seed()
