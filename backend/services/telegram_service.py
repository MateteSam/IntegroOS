import os
import requests
from logging_config import get_logger

logger = get_logger(__name__)

class TelegramService:
    def __init__(self):
        self.bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.environ.get("TELEGRAM_CHAT_ID")
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"

    def send_message(self, text, parse_mode="HTML"):
        """Sends a text message via Telegram."""
        if not self.bot_token or not self.chat_id:
            logger.warning("Telegram credentials not configured. Skipping message.")
            return False

        url = f"{self.base_url}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            logger.info("Telegram message sent successfully.")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

    def send_alert(self, title, message):
        """Standardized critical alert format."""
        text = f"🚨 <b>{title}</b>\n\n{message}"
        return self.send_message(text)

    def send_briefing(self, date, metrics_summary):
        """Standardized daily briefing format."""
        text = f"📊 <b>Daily Briefing: {date}</b>\n\n{metrics_summary}"
        return self.send_message(text)

    def request_approval(self, action_id, description):
        """Interactive approval message."""
        # This can be expanded with Telegram Inline Keyboards
        text = f"⚠️ <b>Approval Required</b>\n\n{description}\n\n<i>Reply with 'YES {action_id}' to approve.</i>"
        return self.send_message(text)

telegram_service = TelegramService()
