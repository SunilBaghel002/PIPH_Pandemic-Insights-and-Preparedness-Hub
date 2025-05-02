const express = require("express");
const app = express();
const path = require("path");
const port = 5000;

app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/home.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/log-in.html"))
);

app.listen(port, () => {
  console.log(`Server starts at port ${port}`);
});
