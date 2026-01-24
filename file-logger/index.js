import { log, readLogs } from "./logger.js";

log("App started");

setTimeout(() => {
  log("First timeout event");
}, 2000);

let count = 0;

const intervalId = setInterval(() => {
  log("Interval tick");
  count++;

  if (count === 3) {
    clearInterval(intervalId);
  }
}, 1000);

setTimeout(() => {
  const logs = readLogs();
  console.log("\n===== LOGS =====\n");
  console.log(logs);
}, 6000);
