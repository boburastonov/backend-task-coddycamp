const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

let users = ['Ali', 'Vali', 'Abbos'];

app.get('/users', (req, res) => {
    const listItems = users.map(user => `<li>${user}</li>`).join('');
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>User List</title>
            <style>
                body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
                form { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 20px; }
                input, button { padding: 8px; }
            </style>
        </head>
        <body>
            <ul>${listItems}</ul>
            <form action="/users" method="POST">
                <input type="text" name="name" required placeholder="Ism...">
                <button type="submit">Qo'shish</button>
            </form>
            <script>
                const params = new URLSearchParams(window.location.search);
                if (params.has('msg')) alert(params.get('msg'));
            </script>
        </body>
        </html>
    `);
});

app.post('/users', (req, res) => {
    const name = req.body.name ? req.body.name.trim() : "";

    if (!name) return res.status(400).send("Name required. <a href='/users'>Back</a>");
    if (name.length < 3) return res.status(400).send("Min 3 chars. <a href='/users'>Back</a>");
    if (users.includes(name)) return res.status(400).send("Already exists. <a href='/users'>Back</a>");

    users.push(name);
    res.redirect('/users?msg=✅ Qo’shildi');
});

app.listen(3000, () => {
    console.log('Server started: http://localhost:3000/users');
});