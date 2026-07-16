import { getData, saveData } from "./localStorageService";

// ============================
// Storage Configuration
// ============================

const MEDICINES_STORAGE_KEY = "ai-care-medicines";

const defaultMedicines = [
  { id: 1, name: "Paracetamol", dosage: "500mg", time: "08:00", status: "Đã uống" },
  { id: 2, name: "Vitamin C", dosage: "1 viên", time: "13:00", status: "Chưa uống" },
];

// ============================
// Read Functions
// ============================

const getMedicines = () => {
  const storedMedicines = getData(MEDICINES_STORAGE_KEY);

  return Array.isArray(storedMedicines) ? storedMedicines : defaultMedicines;
};

// ============================
// CRUD Functions
// ============================

const addMedicine = (medicine) => {
  const newMedicine = {
    ...medicine,
    id: medicine.id || Date.now(),
    status: medicine.status || "Chưa uống",
  };
  const updatedMedicines = [...getMedicines(), newMedicine];

  saveData(MEDICINES_STORAGE_KEY, updatedMedicines);
  return updatedMedicines;
};

const updateMedicine = (updatedMedicine) => {
  const updatedMedicines = getMedicines().map((medicine) =>
    medicine.id === updatedMedicine.id ? updatedMedicine : medicine,
  );

  saveData(MEDICINES_STORAGE_KEY, updatedMedicines);
  return updatedMedicines;
};

const deleteMedicine = (id) => {
  const updatedMedicines = getMedicines().filter((medicine) => medicine.id !== id);

  saveData(MEDICINES_STORAGE_KEY, updatedMedicines);
  return updatedMedicines;
};

const updateMedicineStatus = (id, status) => {
  const updatedMedicines = getMedicines().map((medicine) =>
    medicine.id === id ? { ...medicine, status } : medicine,
  );

  saveData(MEDICINES_STORAGE_KEY, updatedMedicines);
  return updatedMedicines;
};

export {
  addMedicine,
  deleteMedicine,
  getMedicines,
  updateMedicine,
  updateMedicineStatus,
};
