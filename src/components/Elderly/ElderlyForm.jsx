// ============================
// Imports
// ============================

import { useState } from "react";
import { Button, Form } from "react-bootstrap";

// Tạo dữ liệu rỗng cho chế độ thêm mới.
const createEmptyFormData = () => ({
  image: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  phone: "",
  medicalConditions: "",
  bloodType: "",
  height: "",
  weight: "",
  relativeName: "",
  relativePhone: "",
  notes: "",
});

function ElderlyForm({ initialData, onSubmit, onCancel, readOnly = false }) {
  // ============================
  // State
  // ============================

  // Modal sẽ gắn key theo hồ sơ nên state được khởi tạo đúng cho thêm hoặc sửa.
  const [formData, setFormData] = useState(initialData || createEmptyFormData());
  const [validated, setValidated] = useState(false);

  // ============================
  // Event Handlers
  // ============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (readOnly) return;

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    onSubmit({ ...formData, fullName: formData.fullName.trim() });
  };

  // ============================
  // Render
  // ============================

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <div className="row g-3">
        <Form.Group className="col-12">
          <Form.Label className="fw-semibold">Ảnh đại diện (đường dẫn ảnh)</Form.Label>
          <Form.Control
            type="url"
            name="image"
            placeholder="https://example.com/avatar.jpg"
            value={formData.image}
            onChange={handleChange}
            disabled={readOnly}
          />
        </Form.Group>

        <Form.Group className="col-md-6">
          <Form.Label className="fw-semibold">Họ và tên *</Form.Label>
          <Form.Control
            required
            type="text"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            disabled={readOnly}
          />
          <Form.Control.Feedback type="invalid">Vui lòng nhập họ và tên.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="col-md-3">
          <Form.Label className="fw-semibold">Ngày sinh *</Form.Label>
          <Form.Control
            required
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={readOnly}
          />
          <Form.Control.Feedback type="invalid">Vui lòng chọn ngày sinh.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="col-md-3">
          <Form.Label className="fw-semibold">Giới tính *</Form.Label>
          <Form.Select required name="gender" value={formData.gender} onChange={handleChange} disabled={readOnly}>
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">Vui lòng chọn giới tính.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="col-md-8">
          <Form.Label className="fw-semibold">Địa chỉ</Form.Label>
          <Form.Control type="text" name="address" placeholder="Nhập địa chỉ" value={formData.address} onChange={handleChange} disabled={readOnly} />
        </Form.Group>

        <Form.Group className="col-md-4">
          <Form.Label className="fw-semibold">Số điện thoại *</Form.Label>
          <Form.Control required type="tel" name="phone" placeholder="Nhập số điện thoại" value={formData.phone} onChange={handleChange} disabled={readOnly} />
          <Form.Control.Feedback type="invalid">Vui lòng nhập số điện thoại.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="col-md-6">
          <Form.Label className="fw-semibold">Bệnh nền</Form.Label>
          <Form.Control type="text" name="medicalConditions" placeholder="Ví dụ: Tiểu đường" value={formData.medicalConditions} onChange={handleChange} disabled={readOnly} />
        </Form.Group>

        <Form.Group className="col-md-2">
          <Form.Label className="fw-semibold">Nhóm máu</Form.Label>
          <Form.Select name="bloodType" value={formData.bloodType} onChange={handleChange} disabled={readOnly}>
            <option value="">Chọn</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="col-md-2">
          <Form.Label className="fw-semibold">Chiều cao</Form.Label>
          <Form.Control type="number" min="0" name="height" placeholder="cm" value={formData.height} onChange={handleChange} disabled={readOnly} />
        </Form.Group>

        <Form.Group className="col-md-2">
          <Form.Label className="fw-semibold">Cân nặng</Form.Label>
          <Form.Control type="number" min="0" step="0.1" name="weight" placeholder="kg" value={formData.weight} onChange={handleChange} disabled={readOnly} />
        </Form.Group>

        <Form.Group className="col-md-6">
          <Form.Label className="fw-semibold">Người thân</Form.Label>
          <Form.Control type="text" name="relativeName" placeholder="Họ tên người thân" value={formData.relativeName} onChange={handleChange} disabled={readOnly} />
        </Form.Group>

        <Form.Group className="col-md-6">
          <Form.Label className="fw-semibold">SĐT người thân</Form.Label>
          <Form.Control type="tel" name="relativePhone" placeholder="Số điện thoại người thân" value={formData.relativePhone} onChange={handleChange} disabled={readOnly} />
        </Form.Group>

        <Form.Group className="col-12">
          <Form.Label className="fw-semibold">Ghi chú</Form.Label>
          <Form.Control as="textarea" rows={3} name="notes" placeholder="Thông tin cần lưu ý" value={formData.notes} onChange={handleChange} disabled={readOnly} />
        </Form.Group>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="light" type="button" onClick={onCancel}>Đóng</Button>
        {!readOnly && <Button variant="primary" type="submit">Lưu thông tin</Button>}
      </div>
    </Form>
  );
}

export default ElderlyForm;
