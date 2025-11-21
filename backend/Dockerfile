FROM python:3-slim

WORKDIR app/

RUN mkdir backend

COPY . app/backend

RUN cd backend
RUN pip install -r requirements.txt

RUN pyton -m backend.ml.generate_synthetic_data
RUN pyton -m backend.init_db

CMD ["pyton", "-m", "backend.app"]