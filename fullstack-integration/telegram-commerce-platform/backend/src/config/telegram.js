export function getTelegramAdminIds() {
  return (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isTelegramAdmin(telegramId) {
  return getTelegramAdminIds().includes(String(telegramId));
}
