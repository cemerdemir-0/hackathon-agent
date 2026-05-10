import os
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from tools import (get_orders, get_stock, get_cargo_status,
                   get_critical_stock, draft_supplier_email, cancel_order)

GROQ_LLM = "groq/llama-3.3-70b-versatile"

@tool("Sipariş Listele")
def tool_get_orders(status: str = "") -> str:
    """Siparişleri listeler. Status boş bırakılırsa tümü gelir."""
    return str(get_orders(status if status else None))

@tool("Stok Sorgula")
def tool_get_stock(product_name: str = "") -> str:
    """Stok seviyelerini getirir."""
    return str(get_stock(product_name if product_name else None))

@tool("Kargo Durumu")
def tool_get_cargo(order_id: str) -> str:
    """Sipariş ID'sine göre kargo durumunu getirir."""
    return str(get_cargo_status(order_id))

@tool("Kritik Stok Listele")
def tool_get_critical(filtre: str = "") -> str:
    """Eşik altına düşen kritik stokları listeler. filtre parametresi kullanılmaz."""
    return str(get_critical_stock())

@tool("Tedarikçi Mail Taslağı")
def tool_draft_email(product: str, quantity: int, supplier_email: str) -> str:
    """Tedarikçiye stok yenileme mail taslağı oluşturur."""
    return draft_supplier_email(product, quantity, supplier_email)

@tool("Sipariş İptal")
def tool_cancel_order(order_id: str) -> str:
    """Belirtilen siparişi iptal eder."""
    return str(cancel_order(order_id))


stock_agent = Agent(
    role="Stok Yöneticisi",
    goal="Stok seviyelerini takip et, kritik durumları tespit et, tedarikçi bildirimlerini hazırla",
    backstory="KOBİ stok yönetiminde uzman. Eşik altı stokları anında fark eder, tedarik zincirini yönetir.",
    tools=[tool_get_stock, tool_get_critical, tool_draft_email],
    verbose=True,
    llm=GROQ_LLM,
)

order_agent = Agent(
    role="Sipariş ve Kargo Sorumlusu",
    goal="Siparişleri takip et, kargo durumlarını kontrol et, müşteri sorularını yanıtla",
    backstory="Sipariş yönetimi ve müşteri memnuniyeti konusunda uzman. Geciken kargolar için anında aksiyon alır.",
    tools=[tool_get_orders, tool_get_cargo, tool_cancel_order],
    verbose=True,
    llm=GROQ_LLM,
)


def run_crew_report() -> str:
    """Sabah raporu: iki ajan sıralı çalışır."""
    stock_task = Task(
        description="Tüm stok seviyelerini kontrol et. Kritik olanlar için tedarikçi mail taslağı hazırla. Türkçe özet ver.",
        expected_output="Kritik stokların listesi ve mail taslakları. Türkçe, kısa.",
        agent=stock_agent,
    )
    order_task = Task(
        description=(
            "Siparişleri listele. Önce status='pending' ile bekleyenleri, sonra status='shipped' ile "
            "kargodakileri sorgula (İngilizce status değerleri kullan). Geciken var mı kontrol et. "
            "Önceki stok raporunu da ekleyerek Türkçe özet ver."
        ),
        expected_output="Stok + sipariş durumunun birleşik Türkçe özeti. Kısa.",
        agent=order_agent,
        context=[stock_task],
    )
    crew = Crew(
        agents=[stock_agent, order_agent],
        tasks=[stock_task, order_task],
        process=Process.sequential,
        verbose=True,
    )
    result = crew.kickoff()
    stock_out = stock_task.output.raw if stock_task.output else ""
    order_out = result.raw if hasattr(result, 'raw') else str(result)
    return f"📦 STOK RAPORU:\n{stock_out}\n\n📋 SİPARİŞ RAPORU:\n{order_out}"


def run_crew_query(user_message: str) -> str:
    """Kullanıcı sorusunu uygun ajana yönlendir."""
    is_stock = any(w in user_message.lower() for w in ["stok", "ürün", "tedarik", "malzeme", "domates", "ekmek", "peynir", "zeytin"])

    agent = stock_agent if is_stock else order_agent

    task = Task(
        description=(
            "Aşağıdaki soruyu yanıtla. Mutlaka tool çağır, gerçek veri getir, Türkçe cevap ver.\n\n"
            f"Soru: {user_message}"
        ),
        expected_output="Tool sonucuna dayanan kısa Türkçe cevap. Maksimum 3 cümle.",
        agent=agent,
    )
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential)
    result = crew.kickoff()
    return str(result.raw) if hasattr(result, 'raw') else str(result)
