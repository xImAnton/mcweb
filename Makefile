.PHONY: server client docker

server:
	sudo docker build --tag mcweb/server ./server

client:
	sudo docker build --tag mcweb/client ./client

mongo:
	sudo docker build --tag mcweb/mongo ./mongodb

docker:
	$(MAKE) server
	$(MAKE) client
	$(MAKE) mongo

start:
	sudo docker-compose up

run:
	sudo docker-compose up -d

stop:
	sudo docker-compose down
