import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def get_orders(status: str = None) -> list:
    """Siparişleri döndürür. Status filtresi: pending, shipped, delivered, cancelled"""
    query = supabase.table("orders").select("*")
    if status:
        query = query.eq("status", status)
    return query.execute().data

def get_stock(product_name: str = None) -> list:
    """Stok bilgilerini döndürür."""
    query = supabase.table("stock").select("*")
    if product_name:
        query = query.ilike("product", f"%{product_name}%")
    return query.execute().data

def get_cargo_status(order_id: str) -> dict:
    """Sipariş ID'sine göre kargo durumunu döndürür."""
    order = supabase.table("orders").select("*").eq("id", order_id).execute().data
    if not order or not order[0].get("cargo_code"):
        return {"error": "Kargo bulunamadı"}
    cargo = supabase.table("cargo").select("*").eq("code", order[0]["cargo_code"]).execute().data
    return cargo[0] if cargo else {"error": "Kargo kaydı yok"}

def get_critical_stock() -> list:
    """Eşik altına düşen ürünleri döndürür."""
    all_stock = supabase.table("stock").select("*").execute().data
    return [s for s in all_stock if s["quantity"] <= s["threshold"]]

def draft_supplier_email(product: str, quantity: int, supplier_email: str) -> str:
    """Tedarikçiye sipariş mail taslağı oluşturur."""
    return f"""Konu: Acil Stok Yenileme — {product}

Sayın Tedarikçimiz,

{product} stoğumuz kritik seviyeye düşmüştür.
Lütfen en kısa sürede {quantity} adet/kg temin edilmesini sağlar mısınız?

Saygılarımızla,
İşletme Yönetimi
E-posta: {supplier_email}"""

def cancel_order(order_id: str) -> dict:
    """Siparişi iptal eder."""
    supabase.table("orders").update({"status": "cancelled"}).eq("id", order_id).execute()
    return {"success": True, "message": f"{order_id} no'lu sipariş iptal edildi"}

def send_supplier_email(to_email: str, subject: str, body: str) -> dict:
    """Tedarikçiye Gmail SMTP ile mail gönderir."""
    gmail_user = os.getenv("GMAIL_USER")
    gmail_pass = os.getenv("GMAIL_APP_PASSWORD")
    if not gmail_user or not gmail_pass:
        return {"success": False, "error": "Gmail credentials eksik"}
    try:
        msg = MIMEMultipart()
        msg["From"]    = gmail_user
        msg["To"]      = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_pass)
            server.sendmail(gmail_user, to_email, msg.as_string())
        return {"success": True, "message": f"Mail gönderildi: {to_email}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
