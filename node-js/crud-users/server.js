import http from "http";
import { URL } from "url";

let users = [
    { id: 1, name: "Ali", age: 15 },
    { id: 2, name: "Vali", age: 16 },
    { id: 3, name: "Abbos", age: 14 },
];

let idCounter = 4;

function sendJSON(res, status, data) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (req.method === "GET" && pathname === "/users") {
        let result = [...users];

        const minAge = parsedUrl.searchParams.get("minAge");
        const maxAge = parsedUrl.searchParams.get("maxAge");

        if (minAge) {
            result = result.filter((u) => u.age >= Number(minAge));
        }

        if (maxAge) {
            result = result.filter((u) => u.age <= Number(maxAge));
        }

        return sendJSON(res, 200, result);
    }

    if (req.method === "GET" && pathname.startsWith("/users/")) {
        const id = Number(pathname.split("/")[2]);
        const user = users.find((u) => u.id === id);

        if (!user) {
            return sendJSON(res, 404, { error: "User not found" });
        }

        return sendJSON(res, 200, user);
    }

    if (req.method === "POST" && pathname === "/users") {
        let body = "";

        req.on("data", (chunk) => (body += chunk));

        req.on("end", () => {
            try {
                const { name, age } = JSON.parse(body);

                if (!name) {
                    return sendJSON(res, 400, { error: "Name required" });
                }

                if (!age || age < 1) {
                    return sendJSON(res, 400, { error: "Invalid age" });
                }

                const newUser = {
                    id: idCounter++,
                    name,
                    age,
                };

                users.push(newUser);
                return sendJSON(res, 201, newUser);
            } catch {
                return sendJSON(res, 400, { error: "Invalid JSON" });
            }
        });
    }

    if (req.method === "PUT" && pathname.startsWith("/users/")) {
        const id = Number(pathname.split("/")[2]);
        const user = users.find((u) => u.id === id);

        if (!user) {
            return sendJSON(res, 404, { error: "User not found" });
        }

        let body = "";

        req.on("data", (chunk) => (body += chunk));

        req.on("end", () => {
            try {
                const { name, age } = JSON.parse(body);

                if (!name || name.length < 3) {
                    return sendJSON(res, 400, { error: "Name min 3 chars" });
                }

                if (!age || age < 1) {
                    return sendJSON(res, 400, { error: "Invalid age" });
                }

                user.name = name;
                user.age = age;

                return sendJSON(res, 200, user);
            } catch {
                return sendJSON(res, 400, { error: "Invalid JSON" });
            }
        });
    }

    if (req.method === "DELETE" && pathname.startsWith("/users/")) {
        const id = Number(pathname.split("/")[2]);
        const index = users.findIndex((u) => u.id === id);

        if (index === -1) {
            return sendJSON(res, 404, { error: "User not found" });
        }

        users.splice(index, 1);
        return sendJSON(res, 200, { message: "User deleted" });
    }

    sendJSON(res, 404, { error: "Not found" });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
