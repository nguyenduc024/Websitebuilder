import { useState, useEffect } from "react";
import { Search, Plus, Filter, User, Phone, Calendar, X, Loader2, Stethoscope, MapPin, ShieldCheck } from "lucide-react";
import { fetchApi, API_BASE, registerRefreshOnFocus } from "../lib/api";

interface DoctorOption {
  doctorId: number;
  fullName: string;
}

interface RoomOption {
  roomId: number;
  roomName: string;
  roomNumber: string;
}

interface PatientData {
  patientId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  sex: string;
  phone: string;
  address: string;
  insurance: string | null;
  birthday: string | null;
}

export function PatientsHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSex, setSelectedSex] = useState("all");
  const [selectedInsurance, setSelectedInsurance] = useState("all");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Patient modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const EMPTY_FORM = { firstName: "", middleName: "", lastName: "", sex: "Nam", phone: "", address: "", insurance: "", birthday: "" };
  const [addForm, setAddForm] = useState(EMPTY_FORM);

  // Profile modal state
  const [profilePatient, setProfilePatient] = useState<PatientData | null>(null);

  // Appointment booking state
  const [apptPatient, setApptPatient] = useState<PatientData | null>(null);
  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [apptForm, setApptForm] = useState({ doctorId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
  const [apptLoading, setApptLoading] = useState(false);
  const [apptMsg, setApptMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadPatients = async () => {
    try {
      const data = await fetchApi<PatientData[]>("/patients");
      setPatients(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const data = await fetchApi<PatientData[]>("/patients");
        if (isActive) {
          setPatients(data);
        }
      } catch {
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void load();
    const cleanupRefresh = registerRefreshOnFocus(() => {
      void load();
    });

    return () => {
      isActive = false;
      cleanupRefresh();
    };
  }, []);

  const openAddModal = () => {
    setAddForm(EMPTY_FORM);
    setAddMsg(null);
    setShowAddModal(true);
  };

  const submitAddPatient = async () => {
    const trim = (s: string) => s.replace(/\s+/g, ' ').trim();
    const trimmed = { ...addForm, firstName: trim(addForm.firstName), middleName: trim(addForm.middleName), lastName: trim(addForm.lastName), phone: trim(addForm.phone), address: trim(addForm.address), insurance: trim(addForm.insurance) };
    if (!trimmed.firstName || !trimmed.lastName) {
      setAddMsg({ type: "error", text: "Họ và tên không được để trống." });
      return;
    }
    setAddForm(trimmed);
    setAddLoading(true);
    setAddMsg(null);
    try {
      const res = await fetch(`${API_BASE}/add-patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed),
      });
      const json = (await res.json()) as { status: string; message: string };
      if (json.status === "success") {
        setAddMsg({ type: "success", text: json.message });
        void loadPatients();
        setTimeout(() => setShowAddModal(false), 1000);
      } else {
        setAddMsg({ type: "error", text: json.message });
      }
    } catch {
      setAddMsg({ type: "error", text: "Không thể kết nối server." });
    } finally {
      setAddLoading(false);
    }
  };

  const openApptModal = async (patient: PatientData) => {
    setApptPatient(patient);
    setApptForm({ doctorId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
    setApptMsg(null);
    try {
      const [d, r] = await Promise.all([
        fetchApi<DoctorOption[]>("/doctors"),
        fetchApi<RoomOption[]>("/clinic-rooms"),
      ]);
      setDoctorOptions(d);
      setRoomOptions(r);
    } catch {
      setApptMsg({ type: "error", text: "Không thể tải danh sách. Kiểm tra kết nối backend." });
    }
  };

  const submitAppt = async () => {
    if (!apptPatient) return;
    if (!apptForm.doctorId || !apptForm.clinicRoomId || !apptForm.dateTime) {
      setApptMsg({ type: "error", text: "Vui lòng điền đầy đủ thông tin bắt buộc." });
      return;
    }
    if (new Date(apptForm.dateTime) <= new Date()) {
      setApptMsg({ type: "error", text: "Không thể đặt lịch trong quá khứ." });
      return;
    }
    setApptLoading(true);
    setApptMsg(null);
    try {
      const formatted = apptForm.dateTime.replace("T", " ") + ":00";
      const res = await fetch(`${API_BASE}/book-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: apptPatient.patientId,
          doctorId: apptForm.doctorId,
          clinicRoomId: apptForm.clinicRoomId,
          reason: apptForm.reason || null,
          dateTime: formatted,
        }),
      });
      const data = await res.json() as { status: string; message: string };
      if (data.status === "success") {
        setApptMsg({ type: "success", text: data.message });
        setTimeout(() => setApptPatient(null), 1200);
      } else {
        setApptMsg({ type: "error", text: data.message });
      }
    } catch {
      setApptMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setApptLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      patient.fullName.toLowerCase().includes(normalizedSearch) ||
      String(patient.patientId).includes(normalizedSearch);
    const matchesSex = selectedSex === "all" || patient.sex === selectedSex;
    const matchesInsurance =
      selectedInsurance === "all" ||
      (selectedInsurance === "co" && Boolean(patient.insurance)) ||
      (selectedInsurance === "khong" && !patient.insurance);
    return matchesSearch && matchesSex && matchesInsurance;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ bệnh nhân</h1>
          <p className="text-sm text-slate-500 mt-1">Xem và quản lý hồ sơ bệnh nhân một cách an toàn.</p>
        </div>
        <button onClick={() => openAddModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          <Plus className="w-4 h-4" />
          Thêm bệnh nhân
        </button>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Thêm bệnh nhân mới</h2>

            {addMsg && (
              <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${addMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{addMsg.text}</div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ *</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên đệm</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.middleName} onChange={e => setAddForm(f => ({ ...f, middleName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên *</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Giới tính</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.sex} onChange={e => setAddForm(f => ({ ...f, sex: e.target.value }))}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ngày sinh</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.birthday} onChange={e => setAddForm(f => ({ ...f, birthday: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">BHYT</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Số thẻ BHYT" value={addForm.insurance} onChange={e => setAddForm(f => ({ ...f, insurance: e.target.value }))} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Địa chỉ</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.address} onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hủy</button>
              <button onClick={() => void submitAddPatient()} disabled={addLoading} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Thêm bệnh nhân
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã bệnh nhân..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </div>
            <select
              className="w-full lg:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={selectedSex}
              onChange={(e) => setSelectedSex(e.target.value)}
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <select
              className="w-full lg:w-52 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
            >
              <option value="all">Tất cả BHYT</option>
              <option value="co">Có BHYT</option>
              <option value="khong">Không có BHYT</option>
            </select>
            <button
              onClick={() => { setSelectedSex("all"); setSelectedInsurance("all"); }}
              className="w-full lg:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
          ) : filteredPatients.map((patient) => (
            <div key={patient.patientId} className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                  {patient.sex || '—'}
                </span>
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                  {patient.lastName?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{patient.fullName}</h3>
                  <p className="text-xs text-slate-500 font-medium">BN-{String(patient.patientId).padStart(3, '0')} • {patient.birthday || '—'}</p>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{patient.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{patient.address || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>BHYT: {patient.insurance || 'Không có'}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setProfilePatient(patient)}
                  className="flex-1 bg-emerald-50 text-emerald-700 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  Xem hồ sơ
                </button>
                <button
                  onClick={() => void openApptModal(patient)}
                  className="flex-1 bg-slate-50 text-slate-700 py-1.5 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Đặt lịch
                </button>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-900">Không tìm thấy bệnh nhân</h3>
              <p className="text-sm text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm bệnh nhân mới.</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {profilePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setProfilePatient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Hồ sơ bệnh nhân</h2>
              <button onClick={() => setProfilePatient(null)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl flex-shrink-0">
                  {profilePatient.lastName?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{profilePatient.fullName}</h3>
                  <p className="text-sm text-slate-500 font-medium">BN-{String(profilePatient.patientId).padStart(3, "0")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Giới tính</p>
                  <p className="text-sm font-semibold text-slate-800">{profilePatient.sex || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Ngày sinh</p>
                  <p className="text-sm font-semibold text-slate-800">{profilePatient.birthday || "—"}</p>
                </div>
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Số điện thoại</p>
                    <p className="text-sm font-medium text-slate-800">{profilePatient.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Địa chỉ</p>
                    <p className="text-sm font-medium text-slate-800">{profilePatient.address || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Bảo hiểm y tế (BHYT)</p>
                    <p className="text-sm font-medium text-slate-800">{profilePatient.insurance || "Không có"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => { setProfilePatient(null); void openApptModal(profilePatient); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Đặt lịch khám
              </button>
              <button
                onClick={() => setProfilePatient(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {apptPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setApptPatient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Đặt lịch khám</h2>
                <p className="text-sm text-slate-500 mt-0.5">Bệnh nhân: <span className="font-medium text-slate-700">{apptPatient.fullName}</span></p>
              </div>
              <button onClick={() => setApptPatient(null)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {apptMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${apptMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {apptMsg.text}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bác sĩ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none"
                    value={apptForm.doctorId}
                    onChange={(e) => setApptForm((f) => ({ ...f, doctorId: Number(e.target.value) }))}
                  >
                    <option value={0}>-- Chọn bác sĩ --</option>
                    {doctorOptions.map((d) => <option key={d.doctorId} value={d.doctorId}>{d.fullName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phòng khám <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={apptForm.clinicRoomId}
                  onChange={(e) => setApptForm((f) => ({ ...f, clinicRoomId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn phòng khám --</option>
                  {roomOptions.map((r) => <option key={r.roomId} value={r.roomId}>{r.roomName} ({r.roomNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày giờ khám <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={apptForm.dateTime}
                  onChange={(e) => setApptForm((f) => ({ ...f, dateTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lý do khám</label>
                <input
                  type="text"
                  placeholder="Đau đầu, kiểm tra sức khỏe định kỳ, ..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={apptForm.reason}
                  onChange={(e) => setApptForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setApptPatient(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => void submitAppt()}
                disabled={apptLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {apptLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {apptLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
