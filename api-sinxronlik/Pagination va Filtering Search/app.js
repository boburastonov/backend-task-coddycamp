const express = require("express");
const app = express();
app.use(express.json());

let products = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 10,
  category: i % 2 === 0 ? "Electronics" : "Home",
  inStock: Math.random() > 0.2,
}));

app.get("/products", (req, res) => {
  let result = [...products];

  if (req.query.search) {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(req.query.search.toLowerCase()),
    );
  }

  if (req.query.category) {
    result = result.filter((p) => p.category === req.query.category);
  }
  if (req.query.minPrice) {
    result = result.filter((p) => p.price >= parseInt(req.query.minPrice));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResult = result.slice(startIndex, endIndex);

  res.status(200).json({
    total: result.length,
    page,
    limit,
    data: paginatedResult,
  });
});

app.post("/products", (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Noto'g'ri body" });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    price,
    category,
    inStock: req.body.inStock ?? true,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Topilmadi" });

  Object.assign(product, req.body);
  res.status(200).json(product);
});

app.delete("/products/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Topilmadi" });

  products.splice(index, 1);
  res.status(204).send();
});

app.listen(3000, () => console.log("API running on port 3000"));
