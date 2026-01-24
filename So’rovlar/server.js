import http from "http";
import querystring from "querystring";

let users = ["Ali", "Vali", "Abbos"];

function renderHTML(message = "") {
  const listItems = users.map((u) => `<li>${u}</li>`).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mini CRUD Users</title>
    </head>
    <body>
      <h1>Users list</h1>

      <ul>
        ${listItems}
      </ul>

      ${message ? `<p style="color: green;">${message}</p>` : ""}

      <h2>Add user</h2>
      <form method="POST" action="/users">
        <input type="text" name="name" placeholder="Enter name" />
        <button type="submit">Add</button>
      </form>

      <br>
      <button onclick="location.reload()">Refresh</button>
    </body>
    </html>
  `;
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(renderHTML());
  } else if (req.method === "POST" && req.url === "/users") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const parsed = querystring.parse(body);
      const name = parsed.name?.trim();

      if (!name) {
        res.writeHead(400);
        return res.end("Name required");
      }

      if (name.length < 3) {
        res.writeHead(400);
        return res.end("Min 3 chars");
      }

      if (users.includes(name)) {
        res.writeHead(400);
        return res.end("Already exists");
      }

      users.push(name);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(renderHTML("✅ Qo‘shildi"));
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("Server running: http://localhost:3000/users");
});
