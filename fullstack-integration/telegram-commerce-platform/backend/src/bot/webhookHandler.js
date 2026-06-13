let telegramWebhookHandler = null;

export function setTelegramWebhookHandler(handler) {
  telegramWebhookHandler = handler;
}

export function handleTelegramWebhook(req, res, next) {
  if (!telegramWebhookHandler) {
    return res.status(503).json({ message: "Telegram webhook is not ready" });
  }

  return telegramWebhookHandler(req, res, next);
}
