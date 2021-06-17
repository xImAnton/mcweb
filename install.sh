#!/bin/bash

sudo -v

if [ -z ${PYTHON_CMD+x}]
then
  PYTHON_CMD=python3
fi

set -e

$PYTHON_CMD -m pip install argon2-cffi

# Prompt for username
echo "Whats your root username?"
read -r MCWEB_ROOT_UN

# Prompt for password
echo "Whats your root password?"
read -r -s MCWEB_ROOT_PW_FIRST

# Password repetition
echo "Please confirm your root password!"
read -r -s MCWEB_ROOT_PW_SEC

# Password check
echo "Checking Passwords"
if [ "$MCWEB_ROOT_PW_FIRST" != "$MCWEB_ROOT_PW_SEC" ]
then
  # Exit if not matching
  echo "The two passwords don't match!"
  $MCWEB_ROOT_PW_FIRST=""
  $MCWEB_ROOT_PW_SEC=""
  $MCWEB_ROOT_UN=""
  exit
fi

# Generate Server Wide Pepper
echo "Generating Pepper"
MCWEB_PEPPER=$($PYTHON_CMD -c "import os, base64; print(base64.b64encode(os.urandom(20))[:20].decode())")

# Generate User Salt using Python
echo "Generating Salt"
MCWEB_ROOT_SALT=$($PYTHON_CMD -c "import os, base64; print(base64.b64encode(os.urandom(20))[:20].decode())")

# Generate Password hash using python
echo "Hashing Password using Argon2"
MCWEB_PW_HASH=$($PYTHON_CMD -c "from argon2 import PasswordHasher; print(PasswordHasher().hash(b'$MCWEB_ROOT_SALT' + '$MCWEB_ROOT_PW_FIRST'.encode() + b'$MCWEB_PEPPER'))")

# Clear seed.js
> mongodb/seed.js
# write root user to seed.js
echo "Writing Database Initialisation Script"
echo -e "db.user.insertOne({\nname: '$MCWEB_ROOT_UN',\nemail: 'test@example.com',\npassword: '$MCWEB_PW_HASH',\npermissions: [],\nsalt: '$MCWEB_ROOT_SALT'});" >> mongodb/seed.js

# generate random password for mongodb
echo "Generating MongoDB root password"
MCWEB_MONGO_PW=$($PYTHON_CMD -c "import os, base64; print(base64.b64encode(os.urandom(16)).decode())")

# rename config
mv defaultConfig.json config.json

# insert mongo password and pepper in config
echo "Patch Config File"
echo -e "import json\nwith open(\"config.json\") as f:\n    data = json.loads(f.read())\ndata[\"mongoDB\"][\"password\"] = \"$MCWEB_MONGO_PW\"\ndata[\"pepper\"] = \"$MCWEB_PEPPER\"\nwith open(\"config.json\", \"w\") as f:\n    f.write(json.dumps(data, indent=4))" | $PYTHON_CMD -

# write secrets to files
echo "Creating docker-compose Secrets"
mkdir "secrets"

> secrets/mongo_root_user.txt
echo -e -n "admin" >> secrets/mongo_root_user.txt

> secrets/mongo_root_password.txt
echo -e -n "$MCWEB_MONGO_PW" >> secrets/mongo_root_password.txt

> secrets/pepper.txt
echo -e -n "$MCWEB_PEPPER" >> secrets/pepper.txt

# change access to secrets so that the container can access it without any permissions
chmod -R 777 ./secrets

echo "Do you want to remove previous MCWeb Data? [y/n]"
read -r CLEAR_VOLUMES

if [ "$CLEAR_VOLUMES" == "y" ]
then
  # clear previous mcweb data
  echo "Removing old Docker Volumes"
  docker volume rm mcweb-data
  docker volume rm mcweb-servers
fi

# build containers
echo "Building Backend"
make server

echo "Building Frontend"
make client

echo "Building Database"
make mongo

echo -e "Everything is set up! Run \"docker-compose up -d\" to start MCWeb."

MCWEB_ROOT_PW_FIRST=""
MCWEB_ROOT_PW_SEC=""
MCWEB_ROOT_UN=""
MCWEB_PW_HASH=""
MCWEB_MONGO_PW=""
MCWEB_PEPPER=""
MCWEB_ROOT_SALT=""

exit
