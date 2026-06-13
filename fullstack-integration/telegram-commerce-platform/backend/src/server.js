import app from "./app.js";
import { startTelegramBot } from "./bot/index.js";

const port = Number(process.env.PORT) || 5000;

app.listen(port, async () => {
  console.log(`Backend listening on http://localhost:${port}`);
  await startTelegramBot(app);
});
