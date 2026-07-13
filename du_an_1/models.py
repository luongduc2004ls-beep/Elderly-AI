from app import db

class Users(db.Model):

    __tablename__ = "Users"

    user_id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(100))

    gender = db.Column(db.String(20))

    date_of_birth = db.Column(db.Date)

    phone = db.Column(db.String(20))

    address = db.Column(db.Text)

    emergency_contact = db.Column(db.String(100))