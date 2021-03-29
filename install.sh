echo "Whats your root username?"
read -r MCWEB_ROOT_UN

echo "Whats your root password?"
read -r -s MCWEB_ROOT_PW_FIRST

echo "Please confirm your root password!"
read -r -s MCWEB_ROOT_PW_SEC

if [ "$MCWEB_ROOT_PW_FIRST" != "$MCWEB_ROOT_PW_SEC" ]
then
  echo "The two passwords don't match!"
  exit
fi

MCWEB_PW_HASH=$(python3 -c "import hashlib; print(hashlib.sha256('$MCWEB_ROOT_PW_FIRST'.encode()).hexdigest())")

echo -e "db.user.insertOne({\nname: '$MCWEB_ROOT_UN',\nemail: 'test@example.com',\npassword: '$MCWEB_PW_HASH',\npermissions: []\n});" >> ./mcweb-mongo/seed.js

MCWEB_MONGO_PW=$(python3 -c "import os, base64; print(base64.b64encode(os.urandom(16)).decode())")

mv defaultConfig.json config.json

# insert mongo password in config
echo -e "import json
with open(\"config.json\") as f:
    data = json.loads(f.read())
data[\"mongoDB\"][\"password\"] = $MCWEB_MONGO_PW
with open(\"config.json\", \"w\") as f:
    f.write(json.dumps(data))" | python3 -


mkdir "secrets"

touch secrets/mongo_root_user.txt
echo -e "admin" >> secrets/mongo_root_user.txt

touch secrets/mongo_root_password.txt
echo "$MCWEB_MONGO_PW" >> secrets/mongo_root_password.txt

sudo docker build --tag mcweb-backend .
sudo docker build --tag mcweb-client mcweb-client
sudo docker build --tag mcweb-mongo mcweb-mongo

echo -e "Everything is set up! Run \"docker-compose up\" to start MCWeb."