FROM python:3-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR app/backend

COPY . .

RUN echo "================================"
RUN pwd
RUN echo "================================"
RUN ls -la
RUN echo "================================"

RUN pip install -r requirements.txt
RUN cd ..
RUN python -m backend.ml.generate_synthetic_data
RUN python -m backend.init_db

CMD ["python", "-m", "backend.app"]