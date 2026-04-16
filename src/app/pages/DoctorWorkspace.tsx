import { useState, useEffect } from "react";
import {
  FileText,
  Pill,
  Search,
  Plus,
  Save,
  ChevronRight,
  Clock,
  AlertCircle,
  X,
  Trash2,
  Stethoscope,
  FlaskConical,
  ClipboardList,
  CheckCircle2,
  Loader2,
  Receipt,
} from "lucide-react";
import { fetchApi, API_BASE, registerRefreshOnFocus } from "../lib/api";

interface QueueItem {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  clinicRoomName: string | null;
  status: string;
  reason: string | null;
  dateTime: string;
}

interface MedicineInfo {
  medicineId: number;
  name: string;
  stockQuantity: number;
  price: number;
  note: string | null;
}

interface PrescriptionItem {
  medicineId: number;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  duration: number;
  guide: string;
}

export function DoctorWorkspace() {
  const [activeTab, setActiveTab] = useState("ehr");
  const [selectedPatientIdx, setSelectedPatientIdx] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Medical Record fields (matches MEDICAL_RECORD table)
  const [diagnosis, setDiagnosis] = useState("");
  const [method, setMethod] = useState("");
  const [testResult, setTestResult] = useState("");

  // Prescription fields
  const [doctorNote, setDoctorNote] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineInfo[]>([]);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [medSearch, setMedSearch] = useState("");

  // Toast message
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Invoice result after successful save
  const [invoiceResult, setInvoiceResult] = useState<{
    mrId: number;
    prId: number;
    invoiceId: number;
    totalPrice: number;
    patientName: string;
    doctorName: string;
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [appointments, meds] = await Promise.all([
          fetchApi<QueueItem[]>("/appointments"),
          fetchApi<MedicineInfo[]>("/medicines"),
        ]);
        if (isActive) {
          setQueue(appointments);
          setMedicines(meds);
        }
      } catch {
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadData();
    const cleanupRefresh = registerRefreshOnFocus(() => void loadData());

    return () => {
      isActive = false;
      cleanupRefresh();
    };
  }, []);

  // Chỉ hiển thị lịch hẹn "Đã xác nhận" (sẵn sàng khám)
  const examQueue = queue.filter((p) => p.status === "Đã xác nhận");
  const selectedPatient = examQueue[selectedPatientIdx] || null;

  // Reset form when switching patient
  useEffect(() => {
    setDiagnosis("");
    setMethod("");
    setTestResult("");
    setDoctorNote("");
    setPrescriptionItems([]);
  }, [selectedPatientIdx]);

  const formatTime = (dateTimeStr: string) => {
    try {
      return new Date(dateTimeStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  // Chỉ hiển thị lịch hẹn "Đã xác nhận" (sẵn sàng khám) — đã lọc
  const filteredQueue = examQueue.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(medSearch.toLowerCase()) &&
      !prescriptionItems.some((p) => p.medicineId === m.medicineId)
  );

  const addMedicine = (med: MedicineInfo) => {
    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineId: med.medicineId,
        medicineName: med.name,
        unitPrice: med.price,
        quantity: 1,
        duration: 1,
        guide: "",
      },
    ]);
    setShowAddMedicine(false);
    setMedSearch("");
  };

  const removeMedicine = (idx: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePrescriptionItem = (idx: number, field: keyof PrescriptionItem, value: string | number) => {
    setPrescriptionItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    if (!diagnosis.trim()) {
      showToast("error", "Vui lòng nhập chẩn đoán.");
      return;
    }
    if (prescriptionItems.length === 0) {
      showToast("error", "Vui lòng thêm ít nhất một loại thuốc vào đơn.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        doctorId: selectedPatient.doctorId,
        patientId: selectedPatient.patientId,
        appointmentId: selectedPatient.appointmentId,
        diagnosis,
        method,
        testResult,
        doctorNote,
        prescriptionDetails: prescriptionItems.map((item) => ({
          medicineId: item.medicineId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          duration: item.duration,
          guide: item.guide,
        })),
      };

      const res = await fetch(`${API_BASE}/medical-record/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("success", data.message || "Đã lưu hồ sơ bệnh án thành công!");
        // Show invoice result modal
        setInvoiceResult({
          mrId: data.mrId,
          prId: data.prId,
          invoiceId: data.invoiceId,
          totalPrice: data.totalPrice,
          patientName: selectedPatient.patientName,
          doctorName: selectedPatient.doctorName,
        });
        // Refresh queue
        const updated = await fetchApi<QueueItem[]>("/appointments");
        setQueue(updated);
        // Reset form
        setDiagnosis("");
        setMethod("");
        setTestResult("");
        setDoctorNote("");
        setPrescriptionItems([]);
      } else {
        showToast("error", data.message || "Lỗi khi lưu hồ sơ.");
      }
    } catch (err: any) {
      showToast("error", "Lỗi kết nối: " + (err.message || "Không thể kết nối server."));
    } finally {
      setSaving(false);
    }
  };

  const totalPrescriptionPrice = prescriptionItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Phòng khám</h1>
          <p className="text-sm text-slate-500 mt-1">Ghi hồ sơ bệnh án và kê đơn thuốc cho bệnh nhân.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving || !selectedPatient || selectedPatient.status !== "Đã xác nhận"}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Hoàn tất khám
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Queue List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-[500px] lg:h-auto overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Danh sách chờ khám
              <span className="ml-auto text-xs font-normal text-slate-400">{examQueue.length} lượt</span>
            </h2>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
            ) : filteredQueue.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">Không có lịch hẹn nào.</div>
            ) : (
              filteredQueue.map((patient, idx) => {
                const realIdx = examQueue.indexOf(patient);
                return (
                  <div
                    key={patient.appointmentId}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors border ${
                      selectedPatientIdx === realIdx
                        ? "bg-emerald-50 border-emerald-200 shadow-sm"
                        : "bg-white border-transparent hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedPatientIdx(realIdx)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-slate-900">{formatTime(patient.dateTime)}</span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ${
                          patient.status === "Đã xác nhận"
                            ? "bg-amber-100 text-amber-700"
                            : patient.status === "Hoàn thành"
                            ? "bg-emerald-100 text-emerald-700"
                            : patient.status === "Đang khám"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>
                    <h3 className={`text-sm font-medium ${selectedPatientIdx === realIdx ? "text-emerald-700" : "text-slate-700"}`}>
                      {patient.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {patient.reason || "Khám bệnh"} • {patient.doctorName}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Workspace Main Area */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden h-[600px] lg:h-auto">
          {/* Patient Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start sm:items-center justify-between bg-slate-50/50">
            {selectedPatient ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                  {selectedPatient.patientName?.charAt(0) || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPatient.patientName}</h2>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium flex-wrap">
                    <span>Mã hẹn: #{selectedPatient.appointmentId}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>BS: {selectedPatient.doctorName}</span>
                    {selectedPatient.clinicRoomName && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{selectedPatient.clinicRoomName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Chọn bệnh nhân từ danh sách chờ</div>
            )}
            {selectedPatient?.status === "Hoàn thành" && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Đã khám xong
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-4 sm:px-6">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "ehr"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
              onClick={() => setActiveTab("ehr")}
            >
              <FileText className="w-4 h-4" /> Hồ sơ bệnh án
            </button>
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "rx"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
              onClick={() => setActiveTab("rx")}
            >
              <Pill className="w-4 h-4" /> Đơn thuốc
              {prescriptionItems.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {prescriptionItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
            {!selectedPatient ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Stethoscope className="w-12 h-12 text-slate-300" />
                <p className="text-sm">Chọn bệnh nhân từ danh sách chờ để bắt đầu khám.</p>
              </div>
            ) : activeTab === "ehr" ? (
              /* ====== TAB: HỒ SƠ BỆNH ÁN (MEDICAL RECORD) ====== */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Chẩn đoán - MRDiagnosis */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    Chẩn đoán <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                    placeholder="Nhập chẩn đoán bệnh của bệnh nhân..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                {/* Phương pháp điều trị - MRMethod */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    Phương pháp điều trị
                  </label>
                  <textarea
                    className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                    placeholder="Nhập phương pháp điều trị, hướng dẫn chăm sóc..."
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                </div>

                {/* Kết quả xét nghiệm - MRTestResult */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    Kết quả xét nghiệm
                  </label>
                  <textarea
                    className="w-full h-28 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                    placeholder="Nhập kết quả xét nghiệm, chỉ số cận lâm sàng..."
                    value={testResult}
                    onChange={(e) => setTestResult(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              /* ====== TAB: ĐƠN THUỐC (PRESCRIPTION) ====== */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Doctor Note */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ghi chú của bác sĩ</label>
                  <textarea
                    className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                    placeholder="Lời dặn dò, ghi chú thêm cho bệnh nhân..."
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                  />
                </div>

                {/* Medicine list header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-slate-900">
                    Danh sách thuốc ({prescriptionItems.length})
                  </h3>
                  <button
                    onClick={() => setShowAddMedicine(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Thêm thuốc
                  </button>
                </div>

                {/* Prescription Items */}
                {prescriptionItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Chưa có thuốc nào trong đơn. Nhấn "Thêm thuốc" để bắt đầu kê đơn.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptionItems.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                              <Pill className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{item.medicineName}</h4>
                              <p className="text-xs text-slate-500">
                                {item.unitPrice.toLocaleString("vi-VN")}đ/đơn vị
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeMedicine(idx)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-slate-500 font-medium">Số lượng</label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updatePrescriptionItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 font-medium">Số ngày dùng</label>
                            <input
                              type="number"
                              min={1}
                              value={item.duration}
                              onChange={(e) => updatePrescriptionItem(idx, "duration", Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-xs text-slate-500 font-medium">Hướng dẫn sử dụng</label>
                            <input
                              type="text"
                              value={item.guide}
                              onChange={(e) => updatePrescriptionItem(idx, "guide", e.target.value)}
                              placeholder="VD: Uống sau ăn"
                              className="w-full mt-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
                      <span className="text-sm text-slate-500">Tổng tiền thuốc:</span>
                      <span className="text-lg font-bold text-emerald-700">
                        {totalPrescriptionPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Thêm thuốc vào đơn
              </h3>
              <button
                onClick={() => { setShowAddMedicine(false); setMedSearch(""); }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm thuốc theo tên..."
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filteredMedicines.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">Không tìm thấy thuốc phù hợp.</div>
                ) : (
                  filteredMedicines.map((med) => (
                    <button
                      key={med.medicineId}
                      onClick={() => addMedicine(med)}
                      className="w-full text-left p-3 rounded-lg hover:bg-emerald-50 transition-colors flex justify-between items-center group"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-emerald-700">{med.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tồn kho: {med.stockQuantity} • {med.price.toLocaleString("vi-VN")}đ
                          {med.note && ` • ${med.note}`}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Result Modal */}
      {invoiceResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-slate-100 bg-emerald-50">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Khám bệnh hoàn tất!</h3>
              <p className="text-sm text-slate-500 mt-1">Hồ sơ bệnh án, đơn thuốc và hóa đơn đã được tạo.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Bệnh nhân</p>
                  <p className="text-sm font-semibold text-slate-900">{invoiceResult.patientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Bác sĩ</p>
                  <p className="text-sm font-semibold text-slate-900">{invoiceResult.doctorName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 font-medium">Mã hồ sơ</p>
                  <p className="text-lg font-bold text-blue-700 mt-1">#{invoiceResult.mrId}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-[10px] uppercase tracking-wider text-purple-600 font-medium">Mã đơn thuốc</p>
                  <p className="text-lg font-bold text-purple-700 mt-1">#{invoiceResult.prId}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">Mã hóa đơn</p>
                  <p className="text-lg font-bold text-amber-700 mt-1">#{invoiceResult.invoiceId}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Tổng tiền hóa đơn</span>
                </div>
                <span className="text-xl font-bold text-emerald-700">
                  {invoiceResult.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Trạng thái: <span className="font-medium text-amber-600">Chưa thanh toán</span> — Xem chi tiết tại trang Hóa đơn.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setInvoiceResult(null)}
                className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
