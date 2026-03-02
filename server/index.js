const express = require("express");
const app = express();
const cors = require("cors");
const { keccak256 } = require("ethereum-cryptography/keccak.js");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "034c9c3883f1622b95726fc3dbc1c8b73b3f44ae8d35c8945e7e2f5c8ceeec44cf": 100,
  "031a62a5bf4941332e8b33f788432b4b5269be2102bad63b2f1a6c8cd7fd794915": 50,
  "020effd00d2ac4ad2084d9db5353fbaf2b74220b23ebc205d0b03c45b76f2d6f21": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;
  const transactionMessage = `${sender}${amount}${recipient}`;
  const senderHash = keccak256(Uint8Array.from(transactionMessage));
  const isSigned = secp256k1.verify(hexSign, senderHash, sender);
  console.log("Is signed: ", isSigned);
  if (isSigned) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Not signed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
