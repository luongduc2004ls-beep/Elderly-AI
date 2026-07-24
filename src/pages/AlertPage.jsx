// ============================
// Imports
// ============================

import { useState } from "react";
import { FaBell } from "react-icons/fa";
import NotificationFilter from "../components/Notification/NotificationFilter";
import NotificationList from "../components/Notification/NotificationList";
import FallDetectionCamera from "../../FallDetectionCamera";

// Dữ liệu tạm thời phục vụ giao diện trước khi kết nối Backend.
const defaultAlerts = [
  {
    id: 1,
    type: "medicine",
    title: "Đến giờ uống thuốc",
    content: "Bà Nguyễn Thị Lan cần uống Paracetamol lúc 08:00.",
    time: "Hôm nay, 08:00",
    isRead: false,
  },
  {
    id: 2,
    type: "health",
    title: "Nhịp tim bất thường",
    content: "Nhịp tim đo được là 105 bpm, cao hơn ngưỡng theo dõi.",
    time: "Hôm nay, 07:45",
    isRead: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Thuốc sắp hết",
    content: "Vitamin C chỉ còn đủ dùng trong 2 ngày tới.",
    time: "Hôm qua, 18:30",
    isRead: true,
  },
  {
    id: 4,
    type: "fall",
    title: "Phát hiện té ngã",
    content: "Thiết bị cảm biến ghi nhận tín hiệu té ngã cần được kiểm tra.",
    time: "Hôm qua, 15:20",
    isRead: true,
  },
];

function AlertPage() {
  // ============================
  // State
  // ============================

  const [alerts, setAlerts] = useState(defaultAlerts);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // ============================
  // Event Handlers
  // ============================

  const handleMarkAsRead = (id) => {
    setAlerts((previousAlerts) =>
      previousAlerts.map((alert) =>
        alert.id === id ? { ...alert, isRead: true } : alert,
      ),
    );
  };

  const handleDelete = (id) => {
    setAlerts((previousAlerts) => previousAlerts.filter((alert) => alert.id !== id));
  };

  // ============================
  // Display Data
  // ============================

  const filteredAlerts = alerts.filter((alert) => {
    const matchesType = selectedType === "all" || alert.type === selectedType;
    const matchesStatus = selectedStatus === "all"
      || (selectedStatus === "read" && alert.isRead)
      || (selectedStatus === "unread" && !alert.isRead);

    return matchesType && matchesStatus;
  });

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  // ============================
  // Render
  // ============================

  const handleAlertCreated = (alert) => {
    setAlerts((previousAlerts) => [alert, ...previousAlerts]);
  };

  return (
    <section className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div className="d-flex align-items-start gap-3">
          <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3">
            <FaBell className="fs-3" />
          </div>
          <div>
            <p className="text-warning-emphasis fw-semibold mb-1">Trung tâm cảnh báo</p>
            <h1 className="h3 fw-bold mb-2">Cảnh báo sức khỏe</h1>
            <p className="text-muted mb-0">Theo dõi các cảnh báo thuốc, sức khỏe và an toàn.</p>
          </div>
        </div>

        <span className="badge text-bg-warning px-3 py-2">{unreadCount} cảnh báo chưa đọc</span>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <FallDetectionCamera onAlertCreated={handleAlertCreated} />
        </div>
      </div>

      <div className="mb-4">
        <NotificationFilter
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onTypeChange={setSelectedType}
        />
      </div>

      <NotificationList
        alerts={filteredAlerts}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </section>
  );
}

export default AlertPage;
