import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreHorizontal, User, Mail, Phone, Calendar, X, Loader2 } from "lucide-react";
import { fetchApi, API_BASE, registerRefreshOnFocus } from "../lib/api";

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
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Patient modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const EMPTY_FORM = { firstName: "", middleName: "", lastName: "", sex: "Nam", phone: "", address: "", insurance: "", birthday: "" };
  const [addForm, setAddForm] = useState(EMPTY_FORM);

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
    setAddLoading(true);
    setAddMsg(null);
    try {
      const res = await fetch(`${API_BASE}/add-patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
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

  const filteredPatients = patients.filter(patient => 
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(patient.patientId).includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patients Hub</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage patient records securely.</p>
        </div>
        <button onClick={() => openAddModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          <Plus className="w-4 h-4" />
          Add New Patient
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
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên đệm</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.middleName} onChange={e => setAddForm(f => ({ ...f, middleName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên *</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} />
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
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Patient ID or Name..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filter Options
            </button>
            <button className="flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <MoreHorizontal className="w-5 h-5" />
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
                <button className="flex-1 bg-emerald-50 text-emerald-700 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-100 transition-colors">
                  Xem hồ sơ
                </button>
                <button className="flex-1 bg-slate-50 text-slate-700 py-1.5 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200">
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
    </div>
  );
}
