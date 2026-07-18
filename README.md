# Elderly AI Backend

Backend sử dụng Flask + SQLAlchemy + MySQL.

---

## Cài thư viện

```bash
pip install -r requirements.txt
```

---

## Tạo Database

Mở MySQL Workbench

Import

sql/elderly_ai.sql

Nếu đang có database cũ, chạy migration một lần:

sql/migrate_medicine_schedule.sql

---

## Cấu hình

config.py

```python
SQLALCHEMY_DATABASE_URI="mysql+pymysql://root:password@localhost/ElderlyCareAI"
```

Hoặc tạo file `.env` từ `.env.example` và điền mật khẩu MySQL:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_NAME=ElderlyCareAI
BACKEND_HOST=localhost
BACKEND_PORT=5000
```

---

## Chạy Backend

```bash
python app.py
```

Cần chạy backend ở terminal riêng với frontend. Frontend Vite dùng port `5173`, backend Flask dùng port `5000`.

Server

```
http://localhost:5000
```

Frontend Vite dev server:

```
http://localhost:5173
```

---

# Medicine API

GET /medicines

GET /medicines/<id>

POST /medicines

PUT /medicines/<id>

PATCH /medicines/<id>/status

DELETE /medicines/<id>

GET /medicines/search

GET /medicines/expired

GET /medicines/low-stock

---

# Medicine Schedule API

GET /medicine-schedules

GET /medicine-schedules?medicine_id=1

GET /medicine-schedules?scheduled_date=2026-07-14

GET /medicine-schedules?status=Chưa uống

GET /medicine-schedules/<id>

GET /medicines/<id>/schedules

POST /medicine-schedules

PUT /medicine-schedules/<id>

PATCH /medicine-schedules/<id>/status

DELETE /medicine-schedules/<id>

---

# Dashboard API

GET /dashboard

GET /dashboard/chart

GET /dashboard/charts

GET /dashboard/charts/bar

GET /dashboard/charts/pie

GET /dashboard/charts/line

GET /dashboard/statistics
