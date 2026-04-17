import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, X, Loader2, Calendar, Clock, Users } from "lucide-react";
import { fetchApi, API_BASE, registerRefreshOnFocus } from "../lib/api";

interface DoctorData {
  doctorId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  sex: string;
  phone: string;
  address: string;
  specialty: string;
  departmentName: string | null;
  birthday: string | null;
}

interface DepartmentOption {
  dId: number;
  dName: string;
}

interface ClinicRoomOption {
  roomId: number;
  roomName: string;
  roomNumber: string;
}

interface WorkScheduleData {
  wsId: number;
  drId: number;
  doctorName: string;
  crId: number;
  clinicRoomName: string;
  wsDay: string;
  wsStartTime: string;
  wsEndTime: string;
  wsMaxPatientSlot: number;
}

const EMPTY_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  sex: "Nam",
  phone: "",
  address: "",
  specialty: "",
  birthday: "",
  departmentId: 0,
};

export function DoctorsDirectory() {
  const [activeTab, setActiveTab] = useState<"doctors" | "schedule">("doctors");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSex, setSelectedSex] = useState("all");
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add doctor modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Work schedule state
  const [schedules, setSchedules] = useState<WorkScheduleData[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [clinicRooms, setClinicRooms] = useState<ClinicRoomOption[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ drId: 0, crId: 0, wsDay: "", wsStartTime: "", wsEndTime: "" });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [scheduleDeleteLoading, setScheduleDeleteLoading] = useState<number | null>(null);

  const loadDoctors = async () => {
    try {
      const data = await fetchApi<DoctorData[]>("/doctors");
      setDoctors(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await fetchApi<WorkScheduleData[]>("/work-schedules");
      setSchedules(data);
    } catch {
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const data = await fetchApi<DoctorData[]>("/doctors");
        if (isActive) {
          setDoctors(data);
        }
      } catch {
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    const loadSch = async () => {
      try {
        const data = await fetchApi<WorkScheduleData[]>("/work-schedules");
        if (isActive) setSchedules(data);
      } catch {
      } finally {
        if (isActive) setSchedulesLoading(false);
      }
    };

    void load();
    void loadSch();
    const cleanupRefresh = registerRefreshOnFocus(() => {
      void load();
      void loadSch();
    });

    return () => {
      isActive = false;
      cleanupRefresh();
    };
  }, []);

  const openAddModal = async () => {
    setShowAddModal(true);
    setAddMsg(null);
    setAddForm({ ...EMPTY_FORM });
    try {
      const depts = await fetchApi<DepartmentOption[]>("/departments");
      setDepartments(depts);
    } catch {
      setAddMsg({ type: "error", text: "Không thể tải danh sách khoa." });
    }
  };

  const submitAddDoctor = async () => {
    const trim = (s: string) => s.replace(/\s+/g, ' ').trim();
    const trimmed = { ...addForm, firstName: trim(addForm.firstName), middleName: trim(addForm.middleName), lastName: trim(addForm.lastName), phone: trim(addForm.phone), address: trim(addForm.address), specialty: trim(addForm.specialty) };
    if (!trimmed.firstName || !trimmed.lastName) {
      setAddMsg({ type: "error", text: "Họ và tên không được để trống." });
      return;
    }
    setAddForm(trimmed);
    setAddLoading(true);
    setAddMsg(null);
    try {
      const res = await fetch(`${API_BASE}/add-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimmed.firstName,
          middleName: trimmed.middleName || null,
          lastName: trimmed.lastName,
          sex: trimmed.sex || null,
          phone: trimmed.phone || null,
          address: trimmed.address || null,
          specialty: addForm.specialty || null,
          birthday: addForm.birthday || null,
          departmentId: addForm.departmentId || null,
        }),
      });
      const data = await res.json() as { status: string; message: string };
      if (data.status === "success") {
        setAddMsg({ type: "success", text: data.message });
        setAddForm({ ...EMPTY_FORM });
        // Reload danh sách bác sĩ
        void loadDoctors();
      } else {
        setAddMsg({ type: "error", text: data.message });
      }
    } catch {
      setAddMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setAddLoading(false);
    }
  };

  const openScheduleModal = async () => {
    setShowScheduleModal(true);
    setScheduleMsg(null);
    setScheduleForm({ drId: 0, crId: 0, wsDay: "", wsStartTime: "", wsEndTime: "" });
    try {
      const [rooms, depts] = await Promise.all([
        fetchApi<ClinicRoomOption[]>("/clinic-rooms"),
        fetchApi<DepartmentOption[]>("/departments"),
      ]);
      setClinicRooms(rooms);
      if (departments.length === 0) setDepartments(depts);
    } catch {
      setScheduleMsg({ type: "error", text: "Không thể tải dữ liệu." });
    }
  };

  const submitSchedule = async () => {
    if (!scheduleForm.drId || !scheduleForm.crId || !scheduleForm.wsDay || !scheduleForm.wsStartTime || !scheduleForm.wsEndTime) {
      setScheduleMsg({ type: "error", text: "Vui lòng điền đầy đủ thông tin." });
      return;
    }
    if (scheduleForm.wsStartTime >= scheduleForm.wsEndTime) {
      setScheduleMsg({ type: "error", text: "Giờ kết thúc phải sau giờ bắt đầu." });
      return;
    }
    setScheduleLoading(true);
    setScheduleMsg(null);
    try {
      const res = await fetch(`${API_BASE}/work-schedule/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });
      const data = await res.json() as { status: string; message: string };
      if (data.status === "success") {
        setScheduleMsg({ type: "success", text: data.message });
        setScheduleForm({ drId: 0, crId: 0, wsDay: "", wsStartTime: "", wsEndTime: "" });
        void loadSchedules();
      } else {
        setScheduleMsg({ type: "error", text: data.message });
      }
    } catch {
      setScheduleMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setScheduleLoading(false);
    }
  };

  const deleteSchedule = async (wsId: number) => {
    setScheduleDeleteLoading(wsId);
    try {
      const res = await fetch(`${API_BASE}/work-schedules/${wsId}`, { method: "DELETE" });
      const data = await res.json() as { status: string; message: string };
      if (data.status === "success") {
        void loadSchedules();
      }
    } catch {
    } finally {
      setScheduleDeleteLoading(null);
    }
  };

  const departmentOptions = Array.from(
    new Set(doctors.map((doc) => doc.departmentName).filter((departmentName): departmentName is string => Boolean(departmentName)))
  ).sort((a, b) => a.localeCompare(b, "vi"));

  const filteredDoctors = doctors.filter((doc) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      doc.fullName.toLowerCase().includes(normalizedSearch) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(normalizedSearch));

    const matchesDepartment = selectedDepartment === "all" || doc.departmentName === selectedDepartment;
    const matchesSex = selectedSex === "all" || doc.sex === selectedSex;

    return matchesSearch && matchesDepartment && matchesSex;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý bác sĩ</h1>
            <p className="text-sm text-slate-500 mt-1">Danh sách bác sĩ và lịch làm việc.</p>
          </div>
          {activeTab === "doctors" ? (
            <button
              onClick={() => void openAddModal()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Thêm bác sĩ
            </button>
          ) : (
            <button
              onClick={() => void openScheduleModal()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Đặt lịch làm
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "doctors"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Danh sách bác sĩ
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "schedule"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lịch làm việc
            {schedules.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">{schedules.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Doctors Tab */}
      {activeTab === "doctors" && (
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
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
              className="w-full lg:w-64 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">Tất cả khoa</option>
              {departmentOptions.map((departmentName) => (
                <option key={departmentName} value={departmentName}>
                  {departmentName}
                </option>
              ))}
            </select>
            <select
              className="w-full lg:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={selectedSex}
              onChange={(e) => setSelectedSex(e.target.value)}
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <button
              onClick={() => {
                setSelectedDepartment("all");
                setSelectedSex("all");
              }}
              className="w-full lg:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Mã BS</th>
                <th className="px-6 py-4 font-medium">Họ tên</th>
                <th className="px-6 py-4 font-medium">Chuyên khoa</th>
                <th className="px-6 py-4 font-medium">Liên hệ</th>
                <th className="px-6 py-4 font-medium">Khoa</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : filteredDoctors.map((doc) => (
                <tr key={doc.doctorId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    BS-{String(doc.doctorId).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {doc.lastName?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{doc.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {doc.specialty || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{doc.phone || '—'}</div>
                    <div className="text-xs text-slate-500">{doc.address || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {doc.departmentName || 'Chưa phân khoa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDoctors.length === 0 && !loading && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-900">Không tìm thấy bác sĩ phù hợp</h3>
              <p className="text-sm text-slate-500 mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1 đến {filteredDoctors.length} trong {doctors.length} bác sĩ</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1 bg-emerald-600 text-white rounded-md">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50">2</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Thêm bác sĩ mới</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {addMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${addMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {addMsg.text}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Nguyễn"
                    value={addForm.lastName}
                    onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đệm</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Văn"
                    value={addForm.middleName}
                    onChange={e => setAddForm(f => ({ ...f, middleName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="A"
                    value={addForm.firstName}
                    onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giới tính</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={addForm.sex}
                    onChange={e => setAddForm(f => ({ ...f, sex: e.target.value }))}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày sinh</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={addForm.birthday}
                    onChange={e => setAddForm(f => ({ ...f, birthday: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="0912345678"
                  value={addForm.phone}
                  onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="123 Đường ABC, Quận XYZ"
                  value={addForm.address}
                  onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Chuyên khoa</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Tim mạch, Nội khoa, ..."
                  value={addForm.specialty}
                  onChange={e => setAddForm(f => ({ ...f, specialty: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Khoa</label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={addForm.departmentId}
                  onChange={e => setAddForm(f => ({ ...f, departmentId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn khoa --</option>
                  {departments.map(d => <option key={d.dId} value={d.dId}>{d.dName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => void submitAddDoctor()}
                disabled={addLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {addLoading ? "Đang xử lý..." : "Thêm bác sĩ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Schedule Section */}
      {activeTab === "schedule" && (
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Bác sĩ</th>
                <th className="px-6 py-4 font-medium">Phòng khám</th>
                <th className="px-6 py-4 font-medium">Ngày</th>
                <th className="px-6 py-4 font-medium">Giờ bắt đầu</th>
                <th className="px-6 py-4 font-medium">Giờ kết thúc</th>
                <th className="px-6 py-4 font-medium">Số bệnh nhân tối đa</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedulesLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">Chưa có lịch làm việc nào.</td></tr>
              ) : schedules.map((s) => (
                <tr key={s.wsId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {s.doctorName?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{s.doctorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{s.clinicRoomName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{s.wsDay}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{s.wsStartTime?.slice(0, 5)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{s.wsEndTime?.slice(0, 5)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {s.wsMaxPatientSlot} bệnh nhân
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => void deleteSchedule(s.wsId)}
                      disabled={scheduleDeleteLoading === s.wsId}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      {scheduleDeleteLoading === s.wsId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Đặt lịch làm việc</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {scheduleMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${scheduleMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {scheduleMsg.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bác sĩ <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={scheduleForm.drId}
                  onChange={e => setScheduleForm(f => ({ ...f, drId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn bác sĩ --</option>
                  {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phòng khám <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={scheduleForm.crId}
                  onChange={e => setScheduleForm(f => ({ ...f, crId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn phòng khám --</option>
                  {clinicRooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomName} ({r.roomNumber})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày làm việc <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={scheduleForm.wsDay}
                  onChange={e => setScheduleForm(f => ({ ...f, wsDay: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giờ bắt đầu <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={scheduleForm.wsStartTime}
                    onChange={e => setScheduleForm(f => ({ ...f, wsStartTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giờ kết thúc <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={scheduleForm.wsEndTime}
                    onChange={e => setScheduleForm(f => ({ ...f, wsEndTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => void submitSchedule()}
                disabled={scheduleLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {scheduleLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {scheduleLoading ? "Đang xử lý..." : "Thêm lịch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
