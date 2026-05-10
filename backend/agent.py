import os
import json
from groq import Groq
from tools import (get_orders, get_stock, get_cargo_status,
                   get_critical_stock, draft_supplier_email, cancel_order, send_supplier_email)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

TOOL_MAP = {
    "get_orders": get_orders,
    "get_stock": get_stock,
    "get_cargo_status": get_cargo_status,
    "get_critical_stock": get_critical_stock,
    "draft_supplier_email": draft_supplier_email,
    "cancel_order": cancel_order,
    "send_supplier_email": send_supplier_email,
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_orders",
            "description": "Siparişleri listeler. Status: pending, shipped, delivered, cancelled",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Sipariş durumu filtresi (opsiyonel)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_stock",
            "description": "Stok seviyelerini getirir.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Ürün adı (opsiyonel)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_cargo_status",
            "description": "Sipariş ID'sine göre kargo durumunu getirir.",
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string"}},
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_critical_stock",
            "description": "Eşik altına düşen kritik stokları listeler.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "draft_supplier_email",
            "description": "Tedarikçiye stok yenileme mail taslağı oluşturur.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product": {"type": "string"},
                    "quantity": {"type": "integer"},
                    "supplier_email": {"type": "string"},
                },
                "required": ["product", "quantity", "supplier_email"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_order",
            "description": "Belirtilen siparişi iptal eder.",
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string"}},
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_supplier_email",
            "description": "Belirtilen e-posta adresine Gmail ile mail gönderir. Kullanıcı farklı bir adres verirse onu kullan.",
            "parameters": {
                "type": "object",
                "properties": {
                    "to_email":  {"type": "string", "description": "Alıcı e-posta adresi"},
                    "subject":   {"type": "string", "description": "Mail konusu"},
                    "body":      {"type": "string", "description": "Mail içeriği"},
                },
                "required": ["to_email", "subject", "body"]
            }
        }
    },
]

SYSTEM_PROMPT = (
    "Sen bir KOBİ işletme yöneticisinin yapay zeka asistanısın. "
    "Türkçe soruları anlayarak ilgili araçları çağır ve kısa, net Türkçe cevaplar ver. "
    "Stok, sipariş ve kargo konularında uzmanısın. Her zaman gerçek verilere dayalı cevap ver. "
    "Selamlama, teşekkür, küçük konuşma gibi durumlarda tool çağırma, doğrudan nazikçe cevap ver."
)

BUSINESS_KEYWORDS = ["stok", "sipariş", "kargo", "ürün", "tedarik", "domates", "ekmek",
                     "peynir", "zeytin", "teslimat", "iptal", "bekliyor", "nerede", "kaç",
                     "mail", "e-posta", "gönder", "@"]

def _needs_tools(message: str) -> bool:
    return any(w in message.lower() for w in BUSINESS_KEYWORDS)

def run_agent(user_message: str) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]
    tools = TOOLS if _needs_tools(user_message) else None

    while True:
        kwargs = {"model": MODEL, "messages": messages}
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"
        response = client.chat.completions.create(**kwargs)

        msg = response.choices[0].message
        tool_calls = msg.tool_calls

        if not tool_calls:
            return msg.content

        messages.append({"role": "assistant", "content": msg.content, "tool_calls": tool_calls})

        for tc in tool_calls:
            fn = TOOL_MAP.get(tc.function.name)
            args = json.loads(tc.function.arguments) if tc.function.arguments else {}
            result = fn(**args) if fn else {"error": "Tool bulunamadı"}
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, ensure_ascii=False),
            })
