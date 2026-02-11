import http from "http";

let students = [
  { id: 1, name: "Bilol", age: 15 },
  { id: 2, name: "Umar", age: 14 },
];

let idCounter = 3;

let totalRequests = 0;
let lastRequestTime = null;

const server = http.createServer((req, res) => {
  totalRequests++;
  lastRequestTime = new Date().toISOString();

  console.log(`[REQUEST] ${req.method} ${req.url}`);

  if (req.method === "GET" && req.url === "/students") {
    console.log("[GET /students] handler start");

    setTimeout(() => {
      console.log("[GET /students] timeout callback");

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify({ students }));
    }, 500);
  } else if (req.method === "POST" && req.url === "/students") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        const newStudent = {
          id: idCounter++,
          name: data.name,
          age: data.age,
        };

        students.push(newStudent);

        setImmediate(() => {
          console.log("[POST /students] after parsing body (setImmediate)");
        });

        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify(students));
      } catch (err) {
        res.writeHead(400, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (req.method === "GET" && req.url === "/stats") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        totalRequests,
        studentsCount: students.length,
        lastRequestTime,
      })
    );
  } else {
    res.writeHead(404, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
