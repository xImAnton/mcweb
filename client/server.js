const express = require("express");
const path = require("path");
const app = express();
const setupProxy = require("./src/setupProxy");

setupProxy(app);
app.use(express.static(path.join(__dirname, "build")));
app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

console.log("MCWeb Client Server Started!")
app.listen(process.env.CLIENT_PORT || 80);
