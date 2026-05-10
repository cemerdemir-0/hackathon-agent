from apscheduler.schedulers.background import BackgroundScheduler
from crew import run_crew_report
from tools import get_critical_stock, draft_supplier_email, send_supplier_email

notifications = []

def morning_report():
    result = run_crew_report()
    notifications.append({"type": "morning_report", "message": result})

def stock_check():
    critical = get_critical_stock()
    if critical:
        sent = []
        for item in critical:
            body = draft_supplier_email(item["product"], item["threshold"] - item["quantity"], item["supplier_email"])
            result = send_supplier_email(
                to_email=item["supplier_email"],
                subject=f"Acil Stok Yenileme — {item['product']}",
                body=body,
            )
            sent.append(f"{item['product']}: {'✓' if result['success'] else '✗ ' + result.get('error','')}")
        msg = "Kritik stok maili gönderildi:\n" + "\n".join(sent)
        notifications.append({"type": "stock_alert", "message": msg})

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(morning_report, "cron", hour=8, minute=0)
    scheduler.add_job(stock_check, "interval", minutes=30)
    scheduler.start()
    return scheduler
