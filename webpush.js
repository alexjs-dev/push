const webpush = require("web-push");

const mongoose = require("mongoose");
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

// VAPID keys should only be generated only once.
const vapidKeys = {
  publicKey:
    "BAEoJOUQgFKyJM2jwI580zjkTlkboAiyXc7mwmuciLbT1RuiiGIBF4DnRQD2moY_NGJyeQ9vGc9dvAGxyBXKoAw",
  privateKey: "ixLFVxhiVt-Npbmtxc8xzzYLQ2AmN0WrdgIb2rxKYcI",
};

webpush.setVapidDetails(
  "mailto:aleksei.dmitrijev@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/fL1Sbpcf4s0:APA91bGWOHgGVcKHgeyBGTT-qRBGx8Oo5pZv6E_Mv1Vgkp5tyxgaptEQrxClNTWbsg5CVRvqazRrShE9LiWFbjTsmSjqbpB3M5GvahBe1mRUReUTPCwVrJ8SK9Ygd5b-eRcFQ5_FqnjG",
  expirationTime: null,
  keys: {
    p256dh:
      "BIP-sZ7BN9hG9Do4tNcKojTSqiUxjHfmHqMi7yT0NF4-ER5AuDIuT4qX8DxVSoQLjtZtzqxAV9p64TClhmXE0Yk",
    auth: "nX6M_iEAASa3CioW3NGe-w",
  },
};

// find all users

const init = () => {
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
    } else {
      users.forEach((user) => {
        const config = {
          endpoint: user.endpoint,
          keys: user.keys,
          expirationTime: user.expirationTime,
        };
        console.log(config);
        // webpush.sendNotification(config, `Hello ${user.name}!`);
        webpush.sendNotification(config, `Hello ${user.name}!`);
        console.log(`Sent to ${user.name}`);
      });
      console.log("Done!");
      mongoose.disconnect();
      process.exit(0);
    }
  });
};

try {
  init();
} catch (err) {
  console.log(err);
}
