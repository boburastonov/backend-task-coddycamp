import { Markup, Scenes, Telegraf, session } from "telegraf";

import BotSubscriber from "../models/BotSubscriber.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { isTelegramAdmin } from "../config/telegram.js";
import { broadcastToSubscribers, setTelegramBot } from "../services/telegramNotifier.js";
import { setTelegramWebhookHandler } from "./webhookHandler.js";

function mainKeyboard(isAdmin = false) {
  const rows = [
    ["Products", "Profile"],
    ["Help"],
  ];

  if (isAdmin) {
    rows.unshift(["Admin", "Stats"]);
  }

  return Markup.keyboard(rows).resize();
}

async function upsertSubscriber(ctx) {
  const from = ctx.from;
  if (!from) {
    return null;
  }

  return BotSubscriber.findOneAndUpdate(
    { telegramId: String(from.id) },
    {
      telegramId: String(from.id),
      username: from.username || "",
      firstName: from.first_name || "",
      lastName: from.last_name || "",
      role: isTelegramAdmin(from.id) ? "admin" : "subscriber",
      isBlocked: false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

function requireTelegramAdmin(ctx, next) {
  if (!isTelegramAdmin(ctx.from?.id)) {
    return ctx.reply("Admin command is not available for this account.");
  }

  return next();
}

const broadcastWizard = new Scenes.WizardScene(
  "broadcast-wizard",
  async (ctx) => {
    await ctx.reply("Broadcast message matnini yuboring. Bekor qilish uchun /cancel.");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message?.text === "/cancel") {
      await ctx.reply("Broadcast bekor qilindi.");
      return ctx.scene.leave();
    }

    const message = ctx.message?.text;
    if (!message) {
      await ctx.reply("Faqat text xabar yuboring.");
      return;
    }

    const subscribers = await BotSubscriber.find({ isBlocked: false });
    const result = await broadcastToSubscribers(subscribers, message);
    await ctx.reply(`Broadcast tugadi. Sent: ${result.sent}, failed: ${result.failed}`);
    return ctx.scene.leave();
  },
);

export async function startTelegramBot(app) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log("Telegram bot disabled: TELEGRAM_BOT_TOKEN is empty");
    return null;
  }

  const bot = new Telegraf(token);
  const stage = new Scenes.Stage([broadcastWizard]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    const subscriber = await upsertSubscriber(ctx);
    await ctx.reply(
      "Xush kelibsiz! Products ro'yxatini ko'ring yoki admin paneldan statistikani boshqaring.",
      mainKeyboard(subscriber?.role === "admin"),
    );
  });

  bot.help((ctx) =>
    ctx.reply(
      [
        "/start - botni ishga tushirish",
        "/help - buyruqlar ro'yxati",
        "/info - profil ma'lumotlari",
        "/products yoki /items - mahsulotlar ro'yxati",
        "/admin - admin panel",
        "/stats - umumiy statistika",
        "/users - foydalanuvchilar ro'yxati",
        "/broadcast - barcha bot foydalanuvchilariga xabar",
      ].join("\\n"),
    ),
  );

  bot.command("info", async (ctx) => {
    const subscriber = await upsertSubscriber(ctx);
    const linkedUser = await User.findOne({ telegramId: subscriber.telegramId }).select(
      "-password",
    );

    await ctx.reply(
      [
        `Telegram ID: ${subscriber.telegramId}`,
        `Username: @${subscriber.username || "-"}`,
        `Role: ${subscriber.role}`,
        linkedUser ? `Linked account: ${linkedUser.email}` : "Linked account: not connected",
      ].join("\\n"),
    );
  });

  async function showProducts(ctx) {
    await upsertSubscriber(ctx);
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8);

    if (!products.length) {
      return ctx.reply("Hozircha mahsulotlar yo'q.");
    }

    for (const product of products) {
      await ctx.reply(
        `${product.title}\\n$${product.price} | Stock: ${product.stock}\\n${product.description || ""}`,
        Markup.inlineKeyboard([
          Markup.button.callback("Details", `product:${product._id}`),
          Markup.button.url(
            "Open website",
            process.env.CLIENT_URL || "http://localhost:5173",
          ),
        ]),
      );
    }
  }

  bot.command("products", showProducts);
  bot.command("items", showProducts);
  bot.hears("Products", showProducts);

  bot.action(/^product:(.+)$/, async (ctx) => {
    const product = await Product.findById(ctx.match[1]);
    await ctx.answerCbQuery();

    if (!product) {
      return ctx.reply("Mahsulot topilmadi.");
    }

    return ctx.reply(
      `${product.title}\\nCategory: ${product.category}\\nPrice: $${product.price}\\nStock: ${product.stock}`,
    );
  });

  bot.command("admin", requireTelegramAdmin, async (ctx) => {
    await ctx.reply(
      "Admin panel",
      Markup.inlineKeyboard([
        [Markup.button.callback("Stats", "admin:stats")],
        [Markup.button.callback("Users", "admin:users")],
        [Markup.button.callback("Orders", "admin:orders")],
        [Markup.button.callback("Products", "admin:products")],
        [Markup.button.callback("Broadcast", "admin:broadcast")],
      ]),
    );
  });

  async function sendStats(ctx) {
    const [users, products, orders, subscribers] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      BotSubscriber.countDocuments({ isBlocked: false }),
    ]);

    await ctx.reply(
      [`Users: ${users}`, `Products: ${products}`, `Orders: ${orders}`, `Bot subscribers: ${subscribers}`].join("\\n"),
    );
  }

  bot.command("stats", requireTelegramAdmin, sendStats);
  bot.hears("Stats", requireTelegramAdmin, sendStats);
  bot.action("admin:stats", requireTelegramAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await sendStats(ctx);
  });

  bot.command("users", requireTelegramAdmin, async (ctx) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(10);
    const text = users.length
      ? users.map((user) => `${user.name} - ${user.email} - ${user.role}`).join("\\n")
      : "Foydalanuvchilar yo'q.";
    await ctx.reply(text);
  });

  bot.action("admin:users", requireTelegramAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const users = await User.find().sort({ createdAt: -1 }).limit(10);
    await ctx.reply(
      users.length
        ? users.map((user) => `${user.name} - ${user.email} - ${user.role}`).join("\\n")
        : "Foydalanuvchilar yo'q.",
    );
  });

  bot.action("admin:orders", requireTelegramAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(8);

    await ctx.reply(
      orders.length
        ? orders
            .map((order) => {
              const customer = order.customer?.name || order.customer?.email || "Unknown";
              return `#${String(order._id).slice(-8)} - ${customer} - $${order.total.toFixed(2)} - ${order.status}`;
            })
            .join("\n")
        : "Buyurtmalar yo'q.",
    );
  });

  bot.action("admin:products", requireTelegramAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const products = await Product.find().sort({ createdAt: -1 }).limit(8);

    await ctx.reply(
      products.length
        ? products
            .map((product) => `${product.title} - $${product.price} - stock: ${product.stock}`)
            .join("\n")
        : "Mahsulotlar yo'q.",
    );
  });

  bot.command("broadcast", requireTelegramAdmin, (ctx) => ctx.scene.enter("broadcast-wizard"));
  bot.action("admin:broadcast", requireTelegramAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.scene.enter("broadcast-wizard");
  });

  bot.hears("Admin", requireTelegramAdmin, (ctx) => ctx.reply("Admin panel uchun /admin yuboring."));
  bot.hears("Profile", (ctx) => ctx.reply("Profil uchun /info yuboring."));
  bot.hears("Help", (ctx) => ctx.reply("Yordam uchun /help yuboring."));

  bot.catch((error) => {
    console.error("Telegram bot error:", error);
  });

  setTelegramBot(bot);

  if (process.env.TELEGRAM_MODE === "webhook") {
    const webhookPath = process.env.TELEGRAM_WEBHOOK_PATH || "/api/telegram/webhook";
    const publicUrl = process.env.PUBLIC_URL;

    if (!publicUrl) {
      throw new Error("PUBLIC_URL is required when TELEGRAM_MODE=webhook");
    }

    await bot.telegram.setWebhook(`${publicUrl}${webhookPath}`);
    setTelegramWebhookHandler(bot.webhookCallback(webhookPath));
    console.log(`Telegram webhook enabled at ${webhookPath}`);
  } else {
    await bot.launch();
    console.log("Telegram bot polling enabled");
  }

  return bot;
}
