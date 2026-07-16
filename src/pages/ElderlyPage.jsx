// ============================
// Imports
// ============================

import { useState } from "react";
import { FaPlus, FaSearch, FaUsers } from "react-icons/fa";
import ElderlyForm from "../components/Elderly/ElderlyForm";
import ElderlyModal from "../components/Elderly/ElderlyModal";
import ElderlyTable from "../components/Elderly/ElderlyTable";

// Dữ liệu giả phục vụ giao diện trước khi kết nối Backend.
const defaultElderlyPeople = [
  {
    id: 1,
    image: "",
    fullName: "Nguyễn Thị Lan",
    dateOfBirth: "1948-10-15",
    gender: "Nữ",
    address: "Quận 3, TP. Hồ Chí Minh",
    phone: "0901234567",
    medicalConditions: "Tăng huyết áp",
    bloodType: "O+",
    height: "155",
    weight: "52",
    relativeName: "Nguyễn Văn Minh",
    relativePhone: "0912345678",
    notes: "Cần nhắc uống thuốc buổi sáng.",
  },
];

function ElderlyPage() {
  // ============================
  // State
  // ============================

  const [elderlyPeople, setElderlyPeople] = useState(defaultElderlyPeople);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  // ============================
  // Modal Handlers
  // ============================

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };

  const handleAdd = () => {
    setSelectedPerson(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleView = (person) => {
    setSelectedPerson(person);
    setModalMode("view");
    setShowModal(true);
  };

  const handleEdit = (person) => {
    setSelectedPerson(person);
    setModalMode("edit");
    setShowModal(true);
  };

  // ============================
  // CRUD Functions
  // ============================

  const handleSave = (personData) => {
    if (modalMode === "edit") {
      setElderlyPeople((previousPeople) =>
        previousPeople.map((person) =>
          person.id === selectedPerson.id ? { ...personData, id: person.id } : person,
        ),
      );
    } else {
      setElderlyPeople((previousPeople) => [
        ...previousPeople,
        { ...personData, id: Date.now() },
      ]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    const personToDelete = elderlyPeople.find((person) => person.id === id);

    if (!personToDelete) return;

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của ${personToDelete.fullName}?`);

    if (confirmDelete) {
      setElderlyPeople((previousPeople) => previousPeople.filter((person) => person.id !== id));
    }
  };

  // ============================
  // Display Data
  // ============================

  const displayedPeople = elderlyPeople.filter((person) =>
    person.fullName.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  const modalTitle = {
    add: "Thêm người cao tuổi",
    edit: "Cập nhật hồ sơ người cao tuổi",
    view: "Thông tin chi tiết",
  }[modalMode];

  // ============================
  // Render
  // ============================

  return (
    <section className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 text-primary mb-2">
            <FaUsers className="fs-4" />
            <span className="fw-semibold">Quản lý hồ sơ</span>
          </div>
          <h1 className="h3 fw-bold mb-2">Người cao tuổi</h1>
          <p className="text-muted mb-0">Theo dõi và quản lý thông tin sức khỏe cơ bản của người cao tuổi.</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <FaPlus className="me-2" />Thêm người cao tuổi
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="input-group" style={{ maxWidth: "420px" }}>
            <span className="input-group-text bg-light border-end-0"><FaSearch /></span>
            <input
              type="search"
              className="form-control bg-light border-start-0"
              placeholder="Tìm theo họ và tên..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>

      <ElderlyTable
        elderlyPeople={displayedPeople}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ElderlyModal show={showModal} onHide={handleCloseModal} title={modalTitle}>
        <ElderlyForm
          key={selectedPerson?.id || modalMode}
          initialData={selectedPerson}
          onSubmit={handleSave}
          onCancel={handleCloseModal}
          readOnly={modalMode === "view"}
        />
      </ElderlyModal>
    </section>
  );
}

export default ElderlyPage;
