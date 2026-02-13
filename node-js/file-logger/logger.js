import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, "logs.txt");

export function log(message) {
    const time = new Date().toISOString();
    const line = `${time} - ${message}\n`;

    fs.appendFile(logFilePath, line, (err) => {
        if (err) {
            console.error("Ошибка записи лога:", err.message);
        }
    });
}

export function readLogs() {
    try {
        const data = fs.readFileSync(logFilePath, "utf-8");
        return data;
    } catch (err) {
        console.error("Ошибка чтения логов:", err.message);
        return "";
    }
}
