import "dotenv/config";
import { Telegraf } from "telegraf";

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error("❌ BOT_TOKEN topilmadi!");
    process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => {
    ctx.reply(
        `Assalomu alaykum! Men Mini Menu botman 🤖

Quyidagi buyruqlardan foydalaning:
👉 /about
👉 /help`,
    );
});

bot.command("help", (ctx) => {
    ctx.reply(
        `/start - Botni ishga tushirish
/help - Buyruqlar ro‘yxati
/about - Bot haqida ma'lumot`,
    );
});

bot.command("about", (ctx) => {
    ctx.reply(
        `Bu bot Node.js va Telegraf yordamida yozilgan.
Muallif: Sen 😎`,
    );
});

bot.launch().then(() => {
    console.log("🤖 Bot ishga tushdi");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
