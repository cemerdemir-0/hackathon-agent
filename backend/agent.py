import os
import json
import google.generativeai as genai
from tools import (get_orders, get_stock, get_cargo_status,
                   get_critical_stock, draft_supplier_email, cancel_order)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

TOOL_MAP = {
    "get_orders": get_orders,
    "get_stock": get_stock,
    "get_cargo_status": get_cargo_status,
    "get_critical_stock": get_critical_stock,
    "draft_supplier_email": draft_supplier_email,
    "cancel_order": cancel_order,
}

TOOL_DECLARATIONS = [
    genai.protos.Tool(function_declarations=[
        genai.protos.FunctionDeclaration(
            name="get_orders",
            description="Siparişleri listeler. Status: pending, shipped, delivered, cancelled",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "status": genai.protos.Schema(type=genai.protos.Type.STRING,
                                                   description="Sipariş durumu filtresi (opsiyonel)")
                }
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_stock",
            description="Stok seviyelerini getirir.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "product_name": genai.protos.Schema(type=genai.protos.Type.STRING,
                                                         description="Ürün adı (opsiyonel)")
                }
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_cargo_status",
            description="Sipariş ID'sine göre kargo durumunu getirir.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "order_id": genai.protos.Schema(type=genai.protos.Type.STRING)
                },
                required=["order_id"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="get_critical_stock",
            description="Eşik altına düşen kritik stokları listeler.",
            parameters=genai.protos.Schema(type=genai.protos.Type.OBJECT, properties={})
        ),
        genai.protos.FunctionDeclaration(
            name="draft_supplier_email",
            description="Tedarikçiye stok yenileme mail taslağı oluşturur.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "product": genai.protos.Schema(type=genai.protos.Type.STRING),
                    "quantity": genai.protos.Schema(type=genai.protos.Type.INTEGER),
                    "supplier_email": genai.protos.Schema(type=genai.protos.Type.STRING),
                },
                required=["product", "quantity", "supplier_email"]
            )
        ),
        genai.protos.FunctionDeclaration(
            name="cancel_order",
            description="Belirtilen siparişi iptal eder.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "order_id": genai.protos.Schema(type=genai.protos.Type.STRING)
                },
                required=["order_id"]
            )
        ),
    ])
]

SYSTEM_PROMPT = (
    "Sen bir KOBİ işletme yöneticisinin yapay zeka asistanısın. "
    "Türkçe soruları anlayarak ilgili araçları çağır ve kısa, net Türkçe cevaplar ver. "
    "Stok, sipariş ve kargo konularında uzmanısın. Her zaman gerçek verilere dayalı cevap ver."
)

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    tools=TOOL_DECLARATIONS,
    system_instruction=SYSTEM_PROMPT,
)

def run_agent(user_message: str) -> str:
    chat = model.start_chat()
    response = chat.send_message(user_message)

    while True:
        fn_calls = [p.function_call for p in response.parts if hasattr(p, "function_call") and p.function_call.name]
        if not fn_calls:
            break

        fn_responses = []
        for fn_call in fn_calls:
            fn = TOOL_MAP.get(fn_call.name)
            if fn:
                args = dict(fn_call.args)
                result = fn(**args)
            else:
                result = {"error": "Tool bulunamadı"}
            fn_responses.append(
                genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=fn_call.name,
                        response={"result": json.dumps(result, ensure_ascii=False)}
                    )
                )
            )

        response = chat.send_message(fn_responses)

    return response.text
