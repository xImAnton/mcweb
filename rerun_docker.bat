docker-compose down

docker build --tag mcweb-backend .
docker build --tag mcweb-client mcweb-client
docker build --tag mcweb-mongo mcweb-mongo

docker-compose up -d
