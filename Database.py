from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# 1. Khởi tạo Engine và Base
# Tạo file database dạng SQLite cục bộ
DATABASE_URL = "sqlite:///elderly_care.db"
engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()

# ==========================================
# 2. Định nghĩa các Bảng Dữ Liệu (Models)
# ==========================================

class User(Base):
    """Bảng lưu thông tin người cao tuổi"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    address = Column(String(255))
    emergency_contact = Column(String(50))  # Số điện thoại người nhà
    created_at = Column(DateTime, default=datetime.utcnow)

    # Mối quan hệ (Relationships) để dễ dàng truy vấn
    medications = relationship("Medication", back_populates="user")
    medication_logs = relationship("MedicationLog", back_populates="user")
    fall_logs = relationship("FallLog", back_populates="user")
    alerts = relationship("Alert", back_populates="user")


class Medication(Base):
    """Bảng lưu lịch uống thuốc (Cung cấp dữ liệu cho hệ thống nhắc nhở)"""
    __tablename__ = 'medications'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    medicine_name = Column(String(100), nullable=False)
    dosage = Column(String(50))              # Liều lượng (Ví dụ: 1 viên, 10ml)
    scheduled_time = Column(String(20))       # Giờ uống thuốc (Ví dụ: "08:00", "20:00")
    notes = Column(Text)                      # Ghi chú (Ví dụ: Uống sau khi ăn)
    is_active = Column(Boolean, default=True) # Trạng thái lịch thuốc còn dùng không

    user = relationship("User", back_populates="medications")


class MedicationLog(Base):
    """Bảng lưu lịch sử uống thuốc thực tế"""
    __tablename__ = 'medication_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    medicine_name = Column(String(100), nullable=False)
    taken_time = Column(DateTime, default=datetime.utcnow) # Thời gian uống thực tế
    status = Column(String(20), default="Taken")         # Trạng thái: Taken (Đã uống), Skipped (Bỏ lỡ)

    user = relationship("User", back_populates="medication_logs")


class FallLog(Base):
    """Bảng lưu lịch sử té ngã (Dữ liệu do AI Vision ghi nhận)"""
    __tablename__ = 'fall_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    fall_time = Column(DateTime, default=datetime.utcnow)
    location = Column(String(100))          # Vị trí ngã (Ví dụ: Phòng khách, Nhà tắm)
    video_snapshot_url = Column(String(255)) # Đường dẫn đến ảnh/video cắt ra từ camera lúc ngã để kiểm tra

    user = relationship("User", back_populates="fall_logs")


class Alert(Base):
    """Bảng lưu thông tin cảnh báo phục vụ Dashboard và thông báo khẩn cấp"""
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    alert_type = Column(String(50), nullable=False) # Loại cảnh báo: Fall (Té ngã), MissedMed (Quên uống thuốc)
    severity = Column(String(20))                    # Mức độ: Danger (Nguy hiểm), Warning (Cảnh báo)
    message = Column(Text)                           # Nội dung hiển thị trên Dashboard
    is_resolved = Column(Boolean, default=False)     # Người nhà/Hệ thống đã xử lý chưa
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")


# ==========================================
# 3. Tạo cấu trúc và Khởi tạo Session mẫu
# ==========================================
if __name__ == "__main__":
    # Tạo tất cả các bảng trong database
    Base.metadata.create_all(engine)
    print(">>> Đã khởi tạo thành công hệ thống Cơ sở dữ liệu AI Hỗ trợ người cao tuổi!")

    # Tạo Session để sẵn sàng ghi/đọc dữ liệu
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Bạn có thể viết thêm code test chèn dữ liệu (Insert) tại đây nếu muốn.