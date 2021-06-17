// insert a default user
db.user.insertOne({
    name: "root",
    email: "test@example.com",
    // "password" hashed
    password: "$argon2id$v=19$m=102400,t=2,p=8$ItTrFEviauIQP+x1WrX8Fw$TgsCsmjfF1EGGIG5LDhYKw",
    permissions: [],
    salt: "20 random salt bytes"
});
