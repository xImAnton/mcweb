FROM mongo:latest

COPY seed.js /docker-entrypoint-initdb.d/

RUN chmod -R 777 /run/secrets/
