from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)


# Kiểm tra kết nối
@app.route("/")
def home():
    try:
        db.session.execute(text("SELECT 1"))
        return "Ket noi MySQL thanh cong!"
    except Exception as e:
        return f"Loi: {e}"


# API lấy danh sách Users
@app.route("/users", methods=["GET"])
def get_users():
    try:
        result = db.session.execute(text("""
            SELECT
                user_id,
                full_name,
                gender,
                phone
            FROM Users
        """))

        users = []

        for row in result:
            users.append({
                "user_id": row.user_id,
                "full_name": row.full_name,
                "gender": row.gender,
                "phone": row.phone
            })

        return jsonify(users)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)