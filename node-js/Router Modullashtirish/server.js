import express from "express";

const app = express();
app.use(express.json());

let users = [
    { id: 1, name: "Ali", age: 12 },
    { id: 2, name: "Vali", age: 15 },
];

let userId = 3;

app.get("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
});

app.post("/users", (req, res) => {
    const { name, age } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name required" });
    }

    if (!age || age < 1) {
        return res.status(400).json({ error: "Invalid age" });
    }

    const newUser = { id: userId++, name, age };
    users.push(newUser);

    res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { name, age } = req.body;

    if (!name || name.length < 3) {
        return res.status(400).json({ error: "Name min 3 chars" });
    }

    if (!age || age < 1) {
        return res.status(400).json({ error: "Invalid age" });
    }

    user.name = name;
    user.age = age;

    res.json(user);
});

app.delete("/users/:id", (req, res) => {
    const id = Number(req.params.id);
    users = users.filter((u) => u.id !== id);

    res.json({ message: "User deleted" });
});

app.get("/users/error", (req, res, next) => {
    next(new Error("Users error example"));
});

let products = [
    { id: 1, title: "Mouse", price: 100 },
    { id: 2, title: "Keyboard", price: 200 },
];

let productId = 3;

app.get("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((p) => p.id === id);

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
});

app.post("/products", (req, res) => {
    const { title, price } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title required" });
    }

    if (!price || price <= 0) {
        return res.status(400).json({ error: "Invalid price" });
    }

    const newProduct = { id: productId++, title, price };
    products.push(newProduct);

    res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((p) => p.id === id);

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const { title, price } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title required" });
    }

    if (!price || price <= 0) {
        return res.status(400).json({ error: "Invalid price" });
    }

    product.title = title;
    product.price = price;

    res.json(product);
});

app.delete("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    products = products.filter((p) => p.id !== id);

    res.json({ message: "Product deleted" });
});

app.get("/products/error", (req, res, next) => {
    next(new Error("Products error example"));
});

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
