import os
import json
from google import genai
from google.genai import types
from tools import (get_orders, get_stock, get_cargo_status,
                   get_critical_stock, draft_supplier_email, cancel_order)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

TOOL_MAP = {
    "get_orders": get_orders,
    "get_stock": get_stock,
    "get_cargo_status": get_cargo_status,
    "get_critical_stock": get_critical_stock,
    "draft_supplier_email": draft_supplier_email,
    "cancel_order": cancel_order,
}

TOOLS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="get_orders",
        description="Siparişleri listeler. Status: pending, shipped, delivered, cancelled",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "status": types.Schema(type=types.Type.STRING, description="Sipariş durumu filtresi (opsiyonel)")
            }
        )
    ),
    types.FunctionDeclaration(
        name="get_stock",
        description="Stok seviyelerini getirir.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "product_name": types.Schema(type=types.Type.STRING, description="Ürün adı (opsiyonel)")
            }
        )
    ),
    types.FunctionDeclaration(
        name="get_cargo_status",
        description="Sipariş ID'sine göre kargo durumunu getirir.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={"order_id": types.Schema(type=types.Type.STRING)},
            required=["order_id"]
        )
    ),
    types.FunctionDeclaration(
        name="get_critical_stock",
        description="Eşik altına düşen kritik stokları listeler.",
        parameters=types.Schema(type=types.Type.OBJECT, properties={})
    ),
    types.FunctionDeclaration(
        name="draft_supplier_email",
        description="Tedarikçiye stok yenileme mail taslağı oluşturur.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "product": types.Schema(type=types.Type.STRING),
                "quantity": types.Schema(type=types.Type.INTEGER),
                "supplier_email": types.Schema(type=types.Type.STRING),
            },
            required=["product", "quantity", "supplier_email"]
        )
    ),
    types.FunctionDeclaration(
        name="cancel_order",
        description="Belirtilen siparişi iptal eder.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={"order_id": types.Schema(type=types.Type.STRING)},
            required=["order_id"]
        )
    ),
])

SYSTEM_PROMPT = (
    "Sen bir KOBİ işletme yöneticisinin yapay zeka asistanısın. "
    "Türkçe soruları anlayarak ilgili araçları çağır ve kısa, net Türkçe cevaplar ver. "
    "Stok, sipariş ve kargo konularında uzmanısın. Her zaman gerçek verilere dayalı cevap ver."
)

def run_agent(user_message: str) -> str:
    contents = [types.Content(role="user", parts=[types.Part(text=user_message)])]
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[TOOLS],
    )

    while True:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=contents,
            config=config,
        )

        fn_calls = [p.function_call for p in response.candidates[0].content.parts
                    if hasattr(p, "function_call") and p.function_call]

        if not fn_calls:
            return response.text

        contents.append(response.candidates[0].content)

        fn_response_parts = []
        for fn_call in fn_calls:
            fn = TOOL_MAP.get(fn_call.name)
            args = dict(fn_call.args) if fn_call.args else {}
            result = fn(**args) if fn else {"error": "Tool bulunamadı"}
            fn_response_parts.append(types.Part(
                function_response=types.FunctionResponse(
                    name=fn_call.name,
                    response={"result": json.dumps(result, ensure_ascii=False)}
                )
            ))

        contents.append(types.Content(role="user", parts=fn_response_parts))
