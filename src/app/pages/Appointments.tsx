import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Settings,
  Search,
  X,
  Loader2,
  BarChart3,
  Trophy,
  Medal
} from "lucide-react";
import { fetchApi, API_BASE, registerRefreshOnFocus } from "../lib/api";

interface AppointmentData {
  appointmentId: number;
  doctorName: string;
  patientName: string;
  clinicRoomName: string | null;
  status: string;
  reason: string | null;
  dateTime: string;
  createdAt: string;
}

interface DoctorBasic {
  fullName: string;
}

// DTO từ backend - đã được sắp xếp bằng Heap Sort ở Java
interface DoctorRankingItem {
  rank: number;
  doctorName: string;
  appointmentCount: number;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [allDoctorNames, setAllDoctorNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("Tất cả");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<{ apId: number; patientName: string; oldDateTime: string } | null>(null);
  const [newDateTime, setNewDateTime] = useState("");
  const [showDoctorRanking, setShowDoctorRanking] = useState(false);
  const [doctorRanking, setDoctorRanking] = useState<DoctorRankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadData = async () => {
      try {
        const [apData, drData] = await Promise.all([
          fetchApi<AppointmentData[]>("/appointments"),
          fetchApi<DoctorBasic[]>("/doctors"),
        ]);
        if (isActive) {
          setAppointments(apData);
          setAllDoctorNames(drData.map(d => d.fullName));
        }
      } catch {
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };
    void loadData();
    const unregister = registerRefreshOnFocus(() => void loadData());
    return () => { isActive = false; unregister(); };
  }, []);

  // Gọi API backend để lấy xếp hạng (đã sort bằng Heap Sort ở Java)
  const loadDoctorRanking = async () => {
    setRankingLoading(true);
    try {
      const data = await fetchApi<DoctorRankingItem[]>("/doctor-ranking");
      setDoctorRanking(data);
    } catch {
      showToast("error", "Không thể tải xếp hạng bác sĩ.");
    } finally {
      setRankingLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const reloadAppointments = async () => {
    try {
      const data = await fetchApi<AppointmentData[]>("/appointments");
      setAppointments(data);
    } catch {}
  };

  const handleConfirm = async (apId: number) => {
    setActionLoading(apId);
    try {
      const res = await fetch(`${API_BASE}/appointments/${apId}/confirm`, { method: "PUT" });
      const json = (await res.json()) as { status: string; message: string };
      if (json.status === "success") {
        showToast("success", json.message);
        void reloadAppointments();
      } else {
        showToast("error", json.message);
      }
    } catch {
      showToast("error", "Không thể kết nối server.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (apId: number) => {
    setActionLoading(apId);
    try {
      const res = await fetch(`${API_BASE}/appointments/${apId}/cancel`, { method: "PUT" });
      const json = (await res.json()) as { status: string; message: string };
      if (json.status === "success") {
        showToast("success", json.message);
        void reloadAppointments();
      } else {
        showToast("error", json.message);
      }
    } catch {
      showToast("error", "Không thể kết nối server.");
    } finally {
      setActionLoading(null);
    }
  };

  const openReschedule = (apt: AppointmentData) => {
    setRescheduleModal({ apId: apt.appointmentId, patientName: apt.patientName, oldDateTime: apt.dateTime });
    setNewDateTime("");
  };

  const submitReschedule = async () => {
    if (!rescheduleModal || !newDateTime) {
      showToast("error", "Vui lòng chọn ngày giờ mới.");
      return;
    }
    setActionLoading(rescheduleModal.apId);
    try {
      const formatted = newDateTime.replace("T", " ") + ":00";
      const res = await fetch(`${API_BASE}/appointments/${rescheduleModal.apId}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDateTime: formatted }),
      });
      const json = (await res.json()) as { status: string; message: string };
      if (json.status === "success") {
        showToast("success", json.message);
        setRescheduleModal(null);
        void reloadAppointments();
      } else {
        showToast("error", json.message);
      }
    } catch {
      showToast("error", "Không thể kết nối server.");
    } finally {
      setActionLoading(null);
    }
  };

  const statusMap: Record<string, string> = {
    'Chờ xác nhận': 'Pending',
    'Đã xác nhận': 'Confirmed',
    'Hoàn thành': 'Completed',
    'Đã hủy': 'Cancelled',
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Đã xác nhận': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Chờ xác nhận': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hoàn thành': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Đã hủy': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Đã xác nhận': return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      case 'Đã hủy': return <XCircle className="w-4 h-4 mr-1.5" />;
      case 'Hoàn thành': return <RefreshCw className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  const formatTime = (dateTimeStr: string) => {
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const formatDate = (dateTimeStr: string) => {
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleDateString('vi-VN');
    } catch { return '—'; }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch hẹn</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý lịch hẹn khám bệnh hàng ngày.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            onClick={() => { setShowDoctorRanking(true); void loadDoctorRanking(); }}
          >
            <BarChart3 className="w-4 h-4" />
            Xếp hạng BS
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Settings className="w-4 h-4" />
            Giờ làm việc
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
            <Plus className="w-4 h-4" />
            Đặt lịch mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">October 2023</h3>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-slate-50 rounded text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
              <button className="p-1 hover:bg-slate-50 rounded text-slate-500"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({length: 31}).map((_, i) => (
              <button 
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                  i + 1 === 18 ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-200" : 
                  [5, 12, 19].includes(i + 1) ? "font-bold text-slate-900 bg-emerald-50" :
                  "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lọc theo bác sĩ</h4>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bác sĩ..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {["Tất cả", ...allDoctorNames]
                .filter(doc => doc === "Tất cả" || doc.toLowerCase().includes(doctorSearch.toLowerCase()))
                .map((doc, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="doctor_filter"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    checked={selectedDoctor === doc}
                    onChange={() => setSelectedDoctor(doc)}
                  />
                  <span className={`text-sm font-medium transition-colors ${
                    selectedDoctor === doc ? "text-emerald-700" : "text-slate-700 group-hover:text-emerald-700"
                  }`}>{doc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Lịch hẹn hôm nay
              <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs ml-2">{selectedDoctor === "Tất cả" ? appointments.length : appointments.filter(a => a.doctorName === selectedDoctor).length}</span>
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
            ) : appointments
              .filter(apt => selectedDoctor === "Tất cả" || apt.doctorName === selectedDoctor)
              .map((apt) => (
              <div key={apt.appointmentId} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all bg-white relative">
                
                {/* Time Indicator */}
                <div className="flex sm:flex-col items-center sm:items-end sm:justify-center w-full sm:w-24 shrink-0 text-slate-500 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4 gap-2 sm:gap-0">
                  <span className="text-lg font-bold text-slate-900">{formatTime(apt.dateTime)}</span>
                  <span className="text-xs font-semibold uppercase">{formatDate(apt.dateTime)}</span>
                  <div className="flex items-center gap-1 mt-1 ml-auto sm:ml-0 text-xs bg-slate-50 px-2 py-0.5 rounded text-slate-600">
                    <Clock className="w-3 h-3" />
                    {apt.clinicRoomName || '—'}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{apt.patientName}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">{apt.reason || 'Khám bệnh'} • {apt.doctorName}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)}
                      {apt.status}
                    </span>
                  </div>
                </div>

                {/* Quick Actions (Hover) */}
                <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-slate-100">
                  {apt.status !== 'Đã xác nhận' && apt.status !== 'Hoàn thành' && apt.status !== 'Đã hủy' && (
                    <button
                      onClick={() => void handleConfirm(apt.appointmentId)}
                      disabled={actionLoading === apt.appointmentId}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors disabled:opacity-50"
                      title="Xác nhận"
                    >
                      {actionLoading === apt.appointmentId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  )}
                  {apt.status !== 'Hoàn thành' && apt.status !== 'Đã hủy' && (
                    <button
                      onClick={() => openReschedule(apt)}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      title="Dời lịch"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  {apt.status !== 'Hoàn thành' && apt.status !== 'Đã hủy' && (
                    <button
                      onClick={() => void handleCancel(apt.appointmentId)}
                      disabled={actionLoading === apt.appointmentId}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                      title="Hủy"
                    >
                      {actionLoading === apt.appointmentId ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
          <span className="text-sm font-medium">{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setRescheduleModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Dời lịch hẹn</h2>
            <p className="text-sm text-slate-500 mb-4">Bệnh nhân: <strong>{rescheduleModal.patientName}</strong></p>
            <p className="text-sm text-slate-500 mb-4">Lịch hiện tại: <strong>{formatDate(rescheduleModal.oldDateTime)} {formatTime(rescheduleModal.oldDateTime)}</strong></p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Ngày giờ mới *</label>
              <input
                type="datetime-local"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRescheduleModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hủy</button>
              <button
                onClick={() => void submitReschedule()}
                disabled={actionLoading !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận dời lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== DOCTOR RANKING MODAL (Heap Sort) ====== */}
      {showDoctorRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDoctorRanking(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Xếp hạng bác sĩ</h2>
                  <p className="text-xs text-slate-500">Sắp xếp giảm dần theo số lịch hẹn (Heap Sort)</p>
                </div>
              </div>
              <button onClick={() => setShowDoctorRanking(false)} className="p-1.5 hover:bg-white/80 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Ranking List */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)]">
              {rankingLoading ? (
                <div className="text-center py-12 text-sm text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải xếp hạng...
                </div>
              ) : doctorRanking.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">Chưa có dữ liệu lịch hẹn.</div>
              ) : (
                <div className="space-y-3">
                  {doctorRanking.map((doc) => {
                    const rank = doc.rank;
                    const isTop3 = rank <= 3;
                    const medalColors = [
                      "from-yellow-400 to-amber-500 text-white shadow-amber-200",
                      "from-slate-300 to-slate-400 text-white shadow-slate-200",
                      "from-orange-400 to-orange-500 text-white shadow-orange-200",
                    ];
                    const barMaxWidth = doctorRanking[0]?.appointmentCount || 1;
                    const barPercent = Math.round((doc.appointmentCount / barMaxWidth) * 100);

                    return (
                      <div
                        key={doc.doctorName}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isTop3
                            ? "border-emerald-200 bg-emerald-50/50 hover:shadow-md"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className="shrink-0">
                          {isTop3 ? (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${medalColors[rank - 1]} flex items-center justify-center font-bold text-sm shadow-md`}>
                              {rank === 1 ? <Trophy className="w-5 h-5" /> : <Medal className="w-5 h-5" />}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                              {rank}
                            </div>
                          )}
                        </div>

                        {/* Doctor Info + Bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className={`text-sm font-semibold truncate ${isTop3 ? "text-slate-900" : "text-slate-700"}`}>
                              {doc.doctorName}
                            </p>
                            <span className={`text-sm font-bold shrink-0 ml-3 ${isTop3 ? "text-emerald-700" : "text-slate-600"}`}>
                              {doc.appointmentCount} lịch hẹn
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                rank === 1 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
                                rank === 2 ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                                rank === 3 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                "bg-slate-300"
                              }`}
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Algorithm note */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 text-center">
                      Thuật toán: <span className="font-semibold text-slate-700">Heap Sort (Java Backend)</span> — Độ phức tạp: O(n log n)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
