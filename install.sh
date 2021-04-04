if [ -z ${PYTHON_CMD+x}]
then
  PYTHON_CMD=python3
fi

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
  exit
fi

# Generate Password hash using python
echo "Hashing Password"
MCWEB_PW_HASH=$($PYTHON_CMD -c "import hashlib; print(hashlib.sha256('$MCWEB_ROOT_PW_FIRST'.encode()).hexdigest())")

# Clear seed.js
> ./mcweb-mongo/seed.js
# write root user to seed.js
echo "Writing Database initialisation script"
echo -e "db.user.insertOne({\nname: '$MCWEB_ROOT_UN',\nemail: 'test@example.com',\npassword: '$MCWEB_PW_HASH',\npermissions: []\n});" >> ./mcweb-mongo/seed.js

# generate random password for mongodb
echo "Generating MongoDB root password"
MCWEB_MONGO_PW=$($PYTHON_CMD -c "import os, base64; print(base64.b64encode(os.urandom(16)).decode())")

# rename config
mv defaultConfig.json config.json

# insert mongo password in config
echo "Patch Config File"
echo -e "import json\nwith open(\"config.json\") as f:\n    data = json.loads(f.read())\ndata[\"mongoDB\"][\"password\"] = \"$MCWEB_MONGO_PW\"\nwith open(\"config.json\", \"w\") as f:\n    f.write(json.dumps(data, indent=4))" | $PYTHON_CMD -

# write secrets to files
echo "Creating docker-compose Secrets"
mkdir "secrets"

touch secrets/mongo_root_user.txt
echo -e -n "admin" >> secrets/mongo_root_user.txt

touch secrets/mongo_root_password.txt
echo -e -n "$MCWEB_MONGO_PW" >> secrets/mongo_root_password.txt

# change access to secrets so that the container can access it without any permissions
sudo chmod -R 777 ./secrets

# clear previous mcweb data
sudo docker volume rm mcweb-data
sudo docker volume rm mcweb-servers

# build container
echo "Building Backend"
sudo docker build --tag mcweb-backend .
echo "Building Frontend"
sudo docker build --tag mcweb-client mcweb-client
echo "Building Database"
sudo docker build --tag mcweb-mongo mcweb-mongo

echo -e "Everything is set up! Run \"sudo docker-compose up\" to start MCWeb."
exit
