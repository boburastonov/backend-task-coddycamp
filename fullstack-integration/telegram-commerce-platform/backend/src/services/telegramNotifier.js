let botInstance = null;

export function setTelegramBot(bot) {
  botInstance = bot;
}

export async function notifyTelegramAdmins(message, extra = {}) {
  if (!botInstance) {
    return { sent: 0, failed: 0 };
  }

  const adminIds = (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const results = await Promise.allSettled(
    adminIds.map((chatId) => botInstance.telegram.sendMessage(chatId, message, extra)),
  );

  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
}

export async function notifyTelegramUser(telegramId, message, extra = {}) {
  if (!botInstance || !telegramId) {
    return false;
  }

  try {
    await botInstance.telegram.sendMessage(telegramId, message, extra);
    return true;
  } catch (error) {
    console.warn(`Telegram user notification failed for ${telegramId}:`, error.message);
    return false;
  }
}

export async function broadcastToSubscribers(subscribers, message) {
  if (!botInstance) {
    return { sent: 0, failed: subscribers.length };
  }

  const results = await Promise.allSettled(
    subscribers.map((subscriber) =>
      botInstance.telegram.sendMessage(subscriber.telegramId, message),
    ),
  );

  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
}
