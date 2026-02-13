const express = require("express");
const app = express();

app.use(express.json());

let users = [
  { id: 1, name: "Ali", age: 12 },
  { id: 2, name: "Vali", age: 15 },
];

let products = [
  { id: 1, title: "Mouse", price: 100 },
  { id: 2, title: "Keyboard", price: 200 },
];

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.get("/users/error", (req, res, next) => {
  next(new Error("Ataylab xato chiqarildi: Users"));
});

app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json(user);
});

app.post("/users", (req, res) => {
  const { name, age } = req.body;
  if (!name || !age)
    return res.status(400).json({ error: "Validatsiya xatosi" });

  const newUser = { id: Date.now(), name, age };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User topilmadi" });

  const { name, age } = req.body;
  if (name) user.name = name;
  if (age) user.age = age;
  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  users = users.filter((u) => u.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.get("/products/error", (req, res, next) => {
  next(new Error("Ataylab xato chiqarildi: Products"));
});

app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product topilmadi" });
  res.json(product);
});

app.post("/products", (req, res) => {
  const { title, price } = req.body;
  if (!title || !price)
    return res.status(400).json({ error: "Validatsiya xatosi" });

  const newProduct = { id: Date.now(), title, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product topilmadi" });

  const { title, price } = req.body;
  if (title) product.title = title;
  if (price) product.price = price;
  res.json(product);
});

app.delete("/products/:id", (req, res) => {
  products = products.filter((p) => p.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
