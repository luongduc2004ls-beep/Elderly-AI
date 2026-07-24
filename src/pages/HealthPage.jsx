// ============================
// Imports
// ============================

import { FaHeartbeat, FaLungs, FaRunning, FaThermometerHalf, FaTint } from "react-icons/fa";
import HealthHistoryTable from "../components/Health/HealthHistoryTable";
import HealthLineChart from "../components/Health/HealthLineChart";
import HealthStatisticCard from "../components/Health/HealthStatisticCard";

// Dữ liệu tạm thời phục vụ giao diện trước khi kết nối Backend.
const healthStatistics = [
  { title: "Nhịp tim", value: 73, unit: "bpm", icon: <FaHeartbeat />, color: "danger", status: "Ổn định" },
  { title: "Huyết áp", value: "120/80", unit: "mmHg", icon: <FaTint />, color: "primary", status: "Bình thường" },
  { title: "SpO2", value: 98, unit: "%", icon: <FaLungs />, color: "success", status: "Tốt" },
  { title: "Nhiệt độ", value: 36.7, unit: "°C", icon: <FaThermometerHalf />, color: "warning", status: "Bình thường" },
  { title: "Bước chân", value: "4.280", unit: "bước", icon: <FaRunning />, color: "info", status: "Hôm nay" },
];

const heartRateHistory = [
  { label: "T2", value: 72 },
  { label: "T3", value: 75 },
  { label: "T4", value: 71 },
  { label: "T5", value: 78 },
  { label: "T6", value: 74 },
  { label: "T7", value: 76 },
  { label: "CN", value: 73 },
];

const healthRecords = [
  { id: 1, recordedAt: "15/07/2026 08:30", heartRate: 73, bloodPressure: "120/80", spo2: 98, temperature: 36.7, steps: 4280 },
  { id: 2, recordedAt: "14/07/2026 08:25", heartRate: 76, bloodPressure: "122/82", spo2: 97, temperature: 36.6, steps: 5120 },
  { id: 3, recordedAt: "13/07/2026 08:40", heartRate: 71, bloodPressure: "118/78", spo2: 98, temperature: 36.8, steps: 3860 },
];

function HealthPage() {
  // ============================
  // Render
  // ============================

  return (
    <section className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex align-items-start gap-3 mb-4">
        <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3">
          <FaHeartbeat className="fs-3" />
        </div>
        <div>
          <p className="text-danger fw-semibold mb-1">Theo dõi chỉ số</p>
          <h1 className="h3 fw-bold mb-2">Sức khỏe người cao tuổi</h1>
          <p className="text-muted mb-0">Theo dõi các chỉ số sức khỏe quan trọng trong ngày.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {healthStatistics.map((statistic) => (
          <div className="col-12 col-sm-6 col-xl" key={statistic.title}>
            <HealthStatisticCard {...statistic} />
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <HealthLineChart title="Lịch sử nhịp tim" data={heartRateHistory} color="#dc3545" unit="bpm" />
        </div>
      </div>

      <HealthHistoryTable records={healthRecords} />
    </section>
  );
}

export default HealthPage;
