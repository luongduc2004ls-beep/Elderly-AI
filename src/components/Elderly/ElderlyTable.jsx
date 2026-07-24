// ============================
// Imports
// ============================

import { Button, Table } from "react-bootstrap";
import { FaEdit, FaEye, FaPhoneAlt, FaTrash } from "react-icons/fa";

function ElderlyTable({ elderlyPeople = [], onView, onEdit, onDelete }) {
  // ============================
  // Render
  // ============================

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-0">
        <div className="d-flex align-items-center justify-content-between gap-3 p-4 pb-3 flex-wrap">
          <div>
            <h2 className="h5 fw-bold mb-1">Danh sách người cao tuổi</h2>
            <p className="text-muted small mb-0">Tổng số hồ sơ: {elderlyPeople.length}</p>
          </div>
        </div>

        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Họ và tên</th>
              <th>Ngày sinh</th>
              <th>Giới tính</th>
              <th>Số điện thoại</th>
              <th>Bệnh nền</th>
              <th className="text-end pe-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {elderlyPeople.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-5">
                  Chưa có hồ sơ người cao tuổi.
                </td>
              </tr>
            ) : (
              elderlyPeople.map((person) => (
                <tr key={person.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={person.fullName}
                          width="42"
                          height="42"
                          className="rounded-circle object-fit-cover"
                        />
                      ) : (
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center fw-bold" style={{ width: "42px", height: "42px" }}>
                          {person.fullName?.charAt(0)?.toUpperCase() || "N"}
                        </div>
                      )}
                      <span className="fw-semibold">{person.fullName}</span>
                    </div>
                  </td>
                  <td>{person.dateOfBirth}</td>
                  <td>{person.gender}</td>
                  <td><FaPhoneAlt className="text-muted me-2" />{person.phone}</td>
                  <td>{person.medicalConditions || "Không có"}</td>
                  <td className="text-end pe-4">
                    <div className="d-inline-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => onView?.(person)} aria-label={`Xem ${person.fullName}`}>
                        <FaEye />
                      </Button>
                      <Button variant="outline-warning" size="sm" onClick={() => onEdit?.(person)} aria-label={`Sửa ${person.fullName}`}>
                        <FaEdit />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => onDelete?.(person.id)} aria-label={`Xóa ${person.fullName}`}>
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default ElderlyTable;
