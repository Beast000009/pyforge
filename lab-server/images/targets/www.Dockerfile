# Deterministic practice target. Was static nginx; now a tiny stdlib HTTP
# server so POST /echo is real and request-varying hidden cases are possible.
FROM python:3.12-slim

WORKDIR /srv
COPY app.py /srv/app.py
COPY fixtures/ /srv/fixtures/

EXPOSE 80
CMD ["python3", "/srv/app.py"]
