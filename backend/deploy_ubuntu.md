# Инструкция по деплою веб-приложения "Умный органайзер для самозанятых" на VPS (Ubuntu 22.04 + Nginx + Gunicorn + Python Flask)

## 1. Подготовка сервера VPS
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых системных пакетов
sudo apt install -y python3 python3-pip python3-venv nginx git curl
```

## 2. Клонирование и настройка приложения
```bash
# Переход в директорию приложений
cd /var/www
sudo git clone https://github.com/username/smart-organizer.git
cd smart-organizer/backend

# Создание и активация виртуального окружения Python
python3 -m venv venv
source venv/bin/venv/activate

# Установка зависимостей
pip install -r requirements.txt
```

## 3. Настройка переменных окружения
Создайте файл `.env` в директории `/var/www/smart-organizer/backend/.env`:
```env
SECRET_KEY="your-super-secret-key-change-this"
DATABASE_URL="sqlite:////var/www/smart-organizer/backend/organizer.db"
FLASK_ENV="production"
```

## 4. Настройка Systemd сервиса для Gunicorn
Создайте файл конфигурации сервиса `sudo nano /etc/systemd/system/organizer.service`:
```ini
[Unit]
Description=Gunicorn instance to serve Smart Organizer Flask App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/smart-organizer/backend
Environment="PATH=/var/www/smart-organizer/backend/venv/bin"
ExecStart=/var/www/smart-organizer/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Запустите и включите автозапуск службы:
```bash
sudo systemctl daemon-reload
sudo systemctl start organizer
sudo systemctl enable organizer
```

## 5. Настройка Nginx
Отредактируйте конфигурацию Nginx `sudo nano /etc/nginx/sites-available/умный-органайзер.рф`:
```nginx
server {
    listen 80;
    server_name умный-органайзер.рф www.умный-органайзер.рф;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/smart-organizer/backend/static;
        expires 30d;
    }
}
```

Активируйте виртуальный хост и перезапустите Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/умный-органайзер.рф /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL сертификат Certbot (HTTPS)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d умный-органайзер.рф -d www.умный-органайзер.рф
```

Готово! Ваш сайт доступен по адресу https://умный-органайзер.рф
