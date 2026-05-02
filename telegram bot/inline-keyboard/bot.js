import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.BOT_TOKEN) {
    console.error("BOT_TOKEN yo‘q");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const quiz = [
    {
        question: "1. JavaScript qaysi til?",
        options: ["Backend", "Frontend", "Database", "OS"],
        correct: "B",
    },
    {
        question: "2. Node.js nima?",
        options: ["Browser", "Runtime", "Database", "Framework"],
        correct: "B",
    },
    {
        question: "3. HTML nima?",
        options: ["Programming language", "Markup language", "DB", "OS"],
        correct: "B",
    },
];

const userState = {};

function getOptions(qIndex) {
    return Markup.inlineKeyboard(
        ["A", "B", "C", "D"].map((letter, i) =>
            Markup.button.callback(
                `${letter}) ${quiz[qIndex].options[i]}`,
                `q${qIndex}:${letter}`,
            ),
        ),
        { columns: 2 },
    );
}

bot.start((ctx) => {
    userState[ctx.from.id] = {
        score: 0,
        current: 0,
    };

    ctx.reply(quiz[0].question, getOptions(0));
});

bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    if (data === "restart") {
        userState[userId] = { score: 0, current: 0 };
        await ctx.editMessageText(quiz[0].question, getOptions(0));
        return ctx.answerCbQuery("Qaytadan boshlandi 🔄");
    }

    if (data.startsWith("next:")) {
        const nextIndex = Number(data.split(":")[1]);

        userState[userId].current = nextIndex;

        return ctx.editMessageText(
            quiz[nextIndex].question,
            getOptions(nextIndex),
        );
    }

    const [qIndexStr, answer] = data.split(":");
    const qIndex = Number(qIndexStr.replace("q", ""));

    const correct = quiz[qIndex].correct;

    let resultText = "";

    if (answer === correct) {
        userState[userId].score++;
        resultText = "Qabul qilindi ✅";
    } else {
        resultText = "Xato ❌";
    }

    await ctx.answerCbQuery(resultText);

    const nextIndex = qIndex + 1;

    if (nextIndex >= quiz.length) {
        return ctx.editMessageText(
            `${quiz[qIndex].question}

Natija: ${userState[userId].score}/${quiz.length}`,
            Markup.inlineKeyboard([
                [Markup.button.callback("🔄 Qayta boshlash", "restart")],
            ]),
        );
    }

    return ctx.editMessageText(
        `${quiz[qIndex].question}

${resultText}`,
        Markup.inlineKeyboard([
            [Markup.button.callback("➡️ Keyingi savol", `next:${nextIndex}`)],
        ]),
    );
});

bot.launch().then(() => console.log("Quiz bot ishga tushdi"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
