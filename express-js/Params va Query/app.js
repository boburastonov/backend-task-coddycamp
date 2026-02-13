const express = require("express");
const app = express();

app.use(express.json());

let users = [
  { id: 1, name: "Ali", age: 12 },
  { id: 2, name: "Vali", age: 15 },
  { id: 3, name: "Olim", age: 25 },
];

app.get("/users", (req, res) => {
  let result = [...users];
  const { minAge, maxAge } = req.query;

  if (minAge) {
    result = result.filter((u) => u.age >= parseInt(minAge));
  }
  if (maxAge) {
    result = result.filter((u) => u.age <= parseInt(maxAge));
  }

  res.json(result);
});

app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json(user);
});

app.post("/users", (req, res) => {
  const { name, age } = req.body;

  if (!name || !age || typeof age !== "number") {
    return res
      .status(400)
      .json({ error: "Name va age to'g'ri kiritilishi shart" });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    age,
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User topilmadi" });

  const { name, age } = req.body;

  if (name) user.name = name;
  if (age) {
    if (typeof age !== "number")
      return res.status(400).json({ error: "Age raqam bo'lishi kerak" });
    user.age = age;
  }

  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "User topilmadi" });

  users.splice(index, 1);
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
