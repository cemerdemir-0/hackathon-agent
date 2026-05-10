import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def seed():
    print("Veriler ekleniyor...")

    # Mevcut verileri temizle
    supabase.table("orders").delete().neq("id", "").execute()
    supabase.table("stock").delete().neq("product", "").execute()
    supabase.table("cargo").delete().neq("code", "").execute()

    supabase.table("orders").insert([
        {"id": "128", "customer": "Ahmet Yılmaz", "product": "Domates 5kg",    "status": "shipped",   "cargo_code": "TRK001", "created_at": "2025-01-10"},
        {"id": "129", "customer": "Ayşe Kaya",    "product": "Zeytin Yağı 1L", "status": "pending",   "cargo_code": None,      "created_at": "2025-01-11"},
        {"id": "130", "customer": "Mehmet Demir", "product": "Peynir 2kg",     "status": "delivered", "cargo_code": "TRK002", "created_at": "2025-01-09"},
        {"id": "131", "customer": "Fatma Şahin",  "product": "Domates 5kg",    "status": "pending",   "cargo_code": None,      "created_at": "2025-01-12"},
    ]).execute()
    print("✓ orders")

    supabase.table("stock").insert([
        {"product": "Domates",    "unit": "kg",   "quantity": 48,  "threshold": 50, "supplier_email": "tedarikci@ciftlik.com"},
        {"product": "Zeytin Yağı","unit": "adet", "quantity": 120, "threshold": 30, "supplier_email": "satis@zeytinyagi.com"},
        {"product": "Peynir",     "unit": "kg",   "quantity": 25,  "threshold": 20, "supplier_email": "info@mandira.com"},
        {"product": "Ekmek",      "unit": "adet", "quantity": 10,  "threshold": 15, "supplier_email": "firin@ekmek.com"},
    ]).execute()
    print("✓ stock")

    supabase.table("cargo").insert([
        {"code": "TRK001", "order_id": "128", "status": "in_transit", "estimated_delivery": "2025-01-12", "delayed": False, "last_location": "İzmir Dağıtım Merkezi"},
        {"code": "TRK002", "order_id": "130", "status": "delivered",  "estimated_delivery": "2025-01-10", "delayed": False, "last_location": "Teslim Edildi"},
    ]).execute()
    print("✓ cargo")

    print("\nTüm veriler eklendi!")
    print("Kritik stoklar: Domates (48/50) ve Ekmek (10/15) — demo için ideal.")

if __name__ == "__main__":
    seed()
