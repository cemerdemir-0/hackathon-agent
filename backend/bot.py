import os
import threading
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes
from crew import run_crew_query
from dotenv import load_dotenv

load_dotenv()

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_msg = update.message.text
    customer = update.message.from_user.first_name
    prompt = f"Müşteri adı: {customer}. Müşteri mesajı: {user_msg}. Kısa ve nazik Türkçe yanıt ver."
    response = run_crew_query(prompt)
    await update.message.reply_text(response)

def start_bot():
    app = ApplicationBuilder().token(os.getenv("TELEGRAM_BOT_TOKEN")).build()
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.run_polling()
