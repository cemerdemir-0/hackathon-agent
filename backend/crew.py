import os
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from tools import (get_orders, get_stock, get_cargo_status,
                   get_critical_stock, draft_supplier_email, cancel_order)

GEMINI_LLM = "gemini/gemini-2.5-flash-lite"

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
def tool_get_critical() -> str:
    """Eşik altına düşen kritik stokları listeler."""
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
    llm=GEMINI_LLM,
)

order_agent = Agent(
    role="Sipariş ve Kargo Sorumlusu",
    goal="Siparişleri takip et, kargo durumlarını kontrol et, müşteri sorularını yanıtla",
    backstory="Sipariş yönetimi ve müşteri memnuniyeti konusunda uzman. Geciken kargolar için anında aksiyon alır.",
    tools=[tool_get_orders, tool_get_cargo, tool_cancel_order],
    verbose=True,
    llm=GEMINI_LLM,
)


def run_crew_report() -> str:
    """Sabah raporu: iki ajan sıralı çalışır."""
    stock_task = Task(
        description="Tüm stok seviyelerini kontrol et. Kritik olanlar için tedarikçi mail taslağı hazırla. Türkçe özet ver.",
        expected_output="Kritik stokların listesi ve mail taslakları. Türkçe, kısa.",
        agent=stock_agent,
    )
    order_task = Task(
        description="Bekleyen ve kargodaki siparişleri listele. Geciken var mı kontrol et. Türkçe özet ver.",
        expected_output="Aktif siparişlerin durumu. Türkçe, kısa.",
        agent=order_agent,
    )
    crew = Crew(
        agents=[stock_agent, order_agent],
        tasks=[stock_task, order_task],
        process=Process.sequential,
        verbose=True,
    )
    return str(crew.kickoff())


def run_crew_query(user_message: str) -> str:
    """Kullanıcı sorusunu uygun ajana yönlendir."""
    is_stock = any(w in user_message.lower() for w in ["stok", "ürün", "tedarik", "malzeme"])

    agent = stock_agent if is_stock else order_agent
    tools_used = [tool_get_stock, tool_get_critical, tool_draft_email] if is_stock else \
                 [tool_get_orders, tool_get_cargo, tool_cancel_order]

    task = Task(
        description=(
            f"Kullanıcı sorusu: {user_message}\n"
            "ZORUNLU: Cevap vermeden önce mutlaka ilgili tool'u çağır ve gerçek veriyi al. "
            "Tahmin etme, 'kontrol ediyorum' gibi belirsiz cevap verme. "
            "Tool sonucuna dayanarak kısa, net Türkçe cevap ver."
        ),
        expected_output="Gerçek veriye dayalı kısa Türkçe cevap. Tool çağrılmadan cevap verilmez.",
        agent=agent,
    )
    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential)
    return str(crew.kickoff())
