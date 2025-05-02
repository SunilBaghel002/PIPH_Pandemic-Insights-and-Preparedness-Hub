const express = require("express");
const app = express();
const path = require("path")
const port = 5000;

app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/index.html"))
);

app.listen(port, () => {
    console.log(`Server starts at port ${port}`);
});