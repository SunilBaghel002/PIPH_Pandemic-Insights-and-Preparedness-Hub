const express = require("express");
const app = express();
const path = require("path");
const port = 5000;

app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/home.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/log-in.html"))
);
app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/sign-up.html"))
);
app.get("/firstPage", (req, res) =>
  res.sendFile(path.join(__dirname, "/views/firstPage.html"))
);

app.listen(port, () => {
  console.log(`Server starts at port ${port}`);
});
