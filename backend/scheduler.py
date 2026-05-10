from apscheduler.schedulers.background import BackgroundScheduler
from crew import run_crew_report
from tools import get_critical_stock

notifications = []

def morning_report():
    result = run_crew_report()
    notifications.append({"type": "morning_report", "message": result})

def stock_check():
    critical = get_critical_stock()
    if critical:
        from crew import run_crew_query
        result = run_crew_query("Kritik stok seviyesindeki ürünler için tedarikçi mail taslağı hazırla.")
        notifications.append({"type": "stock_alert", "message": result})

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(morning_report, "cron", hour=8, minute=0)
    scheduler.add_job(stock_check, "interval", minutes=30)
    scheduler.start()
    return scheduler
