const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const requestIp = require("request-ip");

mongoose.connect(process.env.MONGOURL);

const schema = new mongoose.Schema({
  endpoint: "string",
  name: "string",
  expirationTime: "string",
  ip: "string",
  keys: {
    p256dh: "string",
    auth: "string",
  },
});
const User = mongoose.model("User", schema);

// serve express server
app.use(cors());
app.use(bodyParser.json());

// server html file
app.use(express.static("public"));

app.use(requestIp.mw());

// server index.html file on root directory
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// post request to save data to mongodb
app.post("/subscribe", (req, res) => {
  const ip = req.clientIp;
  const data = req.body;
  if (!data.endpoint) {
    // show error
    res.status(403).send("Missing endpoint");
    return;
  }
  if (!data.name) {
    // show error
    res.status(403).send("Missing name");
    return;
  }
  const payload = {
    endpoint: data.endpoint,
    name: data.name,
    expirationTime: data.expirationTime,
    ip: ip,
    keys: data.keys,
  };

  // search for data.endpoint in mongoose
  User.findOne({ endpoint: data.endpoint }, (err, user) => {
    if (err) {
      // show error
      res.status(500).send(err);
    } else if (user) {
      // replace user
      User.replaceOne({ endpoint: data.endpoint }, payload, (err, user) => {
        if (err) {
          // show error
          res.status(500).send(err);
        } else {
          // show success
          res.status(200).send("User updated");
        }
      });
    } else {
      // save data to mongoose
      const newUser = new User(payload);
      newUser.save((err) => {
        if (err) {
          // show error
          res.status(500).send(err);
        } else {
          // show success
          res.status(200).send("Success");
        }
      });
    }
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started http://localhost:${port}`);
});

module.exports = {
  app,
  mongoose,
};
