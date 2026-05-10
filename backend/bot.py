import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes
from agent import run_agent
from dotenv import load_dotenv

load_dotenv()

_executor = ThreadPoolExecutor(max_workers=4)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_msg = update.message.text
    customer = update.message.from_user.first_name
    prompt = (
        f"Müşteri adı {customer}. Şu soruyu sor: {user_msg}\n"
        "Kısa ve nazik Türkçe yanıt ver. Soruyu tekrar etme."
    )
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(_executor, run_agent, prompt)
    await update.message.reply_text(response)

def start_bot():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    app = ApplicationBuilder().token(os.getenv("TELEGRAM_BOT_TOKEN")).build()
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.run_polling()
