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
  Search,
  X,
  Loader2,
  BarChart3,
  Trophy,
  Medal,
  User,
  DoorOpen
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

interface DoctorOption {
  doctorId: number;
  fullName: string;
}

interface PatientOption {
  patientId: number;
  fullName: string;
}

interface RoomOption {
  roomId: number;
  roomName: string;
  roomNumber: string;
}

interface WorkScheduleItem {
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

const VI_WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function formatWsDay(dateStr: string): string {
  // dateStr can be "2026-04-17" or "Monday" etc.
  // Try to parse as ISO date first
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dow = VI_WEEKDAYS[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${dow}, ${day}/${month}/${d.getFullYear()}`;
  }
  // Fallback: map English day names
  const MAP: Record<string, string> = {
    Monday: "Thứ Hai", Tuesday: "Thứ Ba", Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm", Friday: "Thứ Sáu", Saturday: "Thứ Bảy", Sunday: "Chủ Nhật",
  };
  return MAP[dateStr] ?? dateStr;
}

function WorkScheduleModal({
  workSchedules, wsLoading, wsSearchDoctor, setWsSearchDoctor, onClose,
}: {
  workSchedules: WorkScheduleItem[];
  wsLoading: boolean;
  wsSearchDoctor: string;
  setWsSearchDoctor: (v: string) => void;
  onClose: () => void;
}) {
  const filtered = wsSearchDoctor.trim()
    ? workSchedules.filter(s => s.doctorName.toLowerCase().includes(wsSearchDoctor.toLowerCase()))
    : workSchedules;

  const byDoctor: Record<string, WorkScheduleItem[]> = {};
  filtered.forEach(s => {
    if (!byDoctor[s.doctorName]) byDoctor[s.doctorName] = [];
    byDoctor[s.doctorName].push(s);
  });
  const doctorNames = Object.keys(byDoctor).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Giờ làm việc bác sĩ</h2>
              <p className="text-xs text-slate-500">Lịch làm việc theo từng bác sĩ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/80 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={wsSearchDoctor}
              onChange={e => setWsSearchDoctor(e.target.value)}
              placeholder="Tìm theo tên bác sĩ..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {wsLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải lịch làm việc...
            </div>
          ) : doctorNames.length === 0 ? (
            <div className="text-center py-16 text-sm text-slate-400">Không tìm thấy dữ liệu.</div>
          ) : (
            <div className="space-y-5 mt-3">
              {doctorNames.map(drName => {
                const slots = byDoctor[drName];
                // Group by wsDay (actual date string from API)
                const slotsByDay: Record<string, WorkScheduleItem[]> = {};
                slots.forEach(s => {
                  if (!slotsByDay[s.wsDay]) slotsByDay[s.wsDay] = [];
                  slotsByDay[s.wsDay].push(s);
                });
                // Sort days chronologically
                const sortedDays = Object.keys(slotsByDay).sort();
                return (
                  <div key={drName} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{drName}</span>
                      <span className="ml-auto text-xs text-slate-400">{slots.length} ca</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {sortedDays.map(day => (
                        <div key={day} className="flex items-start gap-3 px-4 py-3">
                          <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-md px-2 py-1.5 min-w-[110px] text-center shrink-0 mt-0.5 leading-tight">
                            {formatWsDay(day)}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {slotsByDay[day].map(s => (
                              <div key={s.wsId} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-sm">
                                <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span className="font-medium text-slate-700">{s.wsStartTime.slice(0,5)} – {s.wsEndTime.slice(0,5)}</span>
                                <span className="text-slate-300">|</span>
                                <DoorOpen className="w-3 h-3 text-blue-400 shrink-0" />
                                <span className="text-slate-500">{s.clinicRoomName}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400">{s.wsMaxPatientSlot} bệnh nhân</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

  // Work schedule state
  const [showWorkSchedule, setShowWorkSchedule] = useState(false);
  const [workSchedules, setWorkSchedules] = useState<WorkScheduleItem[]>([]);
  const [wsLoading, setWsLoading] = useState(false);
  const [wsSearchDoctor, setWsSearchDoctor] = useState("");

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  // Book appointment state
  const [showBooking, setShowBooking] = useState(false);
  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [bookForm, setBookForm] = useState({ doctorId: 0, patientId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookMsg, setBookMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Autocomplete search text for booking fields
  const [bookDoctorText, setBookDoctorText] = useState("");
  const [bookPatientText, setBookPatientText] = useState("");
  const [bookRoomText, setBookRoomText] = useState("");
  const [bookFocus, setBookFocus] = useState<"doctor" | "patient" | "room" | null>(null);

  const openBookingDialog = async () => {
    setShowBooking(true);
    setBookMsg(null);
    setBookForm({ doctorId: 0, patientId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
    setBookDoctorText("");
    setBookPatientText("");
    setBookRoomText("");
    setBookFocus(null);
    try {
      const [d, p, r] = await Promise.all([
        fetchApi<DoctorOption[]>("/doctors"),
        fetchApi<PatientOption[]>("/patients"),
        fetchApi<RoomOption[]>("/clinic-rooms"),
      ]);
      setDoctorOptions(d);
      setPatientOptions(p);
      setRoomOptions(r);
    } catch {
      setBookMsg({ type: "error", text: "Không thể tải danh sách. Kiểm tra kết nối backend." });
    }
  };

  const submitBooking = async () => {
    if (!bookForm.doctorId || !bookForm.patientId || !bookForm.clinicRoomId || !bookForm.dateTime) {
      setBookMsg({ type: "error", text: "Vui lòng điền đầy đủ thông tin bắt buộc." });
      return;
    }
    if (new Date(bookForm.dateTime) <= new Date()) {
      setBookMsg({ type: "error", text: "Không thể đặt lịch trong quá khứ. Vui lòng chọn thời gian trong tương lai." });
      return;
    }
    setBookLoading(true);
    setBookMsg(null);
    try {
      const formatted = bookForm.dateTime.replace("T", " ") + ":00";
      const res = await fetch(`${API_BASE}/book-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookForm, dateTime: formatted }),
      });
      const data = await res.json() as { status: string; message: string };
      if (data.status === "success") {
        setBookMsg({ type: "success", text: data.message });
        setBookForm({ doctorId: 0, patientId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
        void reloadAppointments();
      } else {
        setBookMsg({ type: "error", text: data.message });
      }
    } catch {
      setBookMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setBookLoading(false);
    }
  };

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

  const loadWorkSchedules = async () => {
    setWsLoading(true);
    try {
      const data = await fetchApi<WorkScheduleItem[]>("/work-schedules");
      setWorkSchedules(data);
    } catch {
      showToast("error", "Không thể tải lịch làm việc.");
    } finally {
      setWsLoading(false);
    }
  };

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
    if (new Date(newDateTime) <= new Date()) {
      showToast("error", "Không thể dời lịch sang thời gian trong quá khứ.");
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

  const allStatuses = ['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'];

  // Calendar helpers
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const appointmentDateCounts = (() => {
    const counts: Record<string, number> = {};
    appointments.forEach(apt => {
      try {
        const d = new Date(apt.dateTime);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        counts[key] = (counts[key] || 0) + 1;
      } catch {}
    });
    return counts;
  })();

  const goToPrevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(prev => prev === key ? null : key);
  };

  const todayKey = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  // Combined filter logic
  const filteredAppointments = appointments.filter(apt => {
    if (selectedDoctor !== "Tất cả" && apt.doctorName !== selectedDoctor) return false;
    if (statusFilter !== "Tất cả" && apt.status !== statusFilter) return false;
    if (selectedDate) {
      try {
        const d = new Date(apt.dateTime);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (key !== selectedDate) return false;
      } catch { return false; }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!apt.patientName.toLowerCase().includes(q) && !apt.doctorName.toLowerCase().includes(q) && !(apt.reason || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            onClick={() => { setShowWorkSchedule(true); void loadWorkSchedules(); }}
          >
            <Clock className="w-4 h-4" />
            Giờ làm việc
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            onClick={() => void openBookingDialog()}
          >
            <Plus className="w-4 h-4" />
            Đặt lịch mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">{monthNames[calendarMonth]} {calendarYear}</h3>
            <div className="flex gap-1">
              <button onClick={goToPrevMonth} className="p-1 hover:bg-slate-50 rounded text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={goToToday} className="px-2 py-1 hover:bg-emerald-50 rounded text-xs font-medium text-emerald-600">Nay</button>
              <button onClick={goToNextMonth} className="p-1 hover:bg-slate-50 rounded text-slate-500"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
            {dayNames.map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-sm">
            {/* Empty cells for days before 1st */}
            {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
            {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const count = appointmentDateCounts[dateKey] || 0;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors relative ${
                    isSelected
                      ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-200"
                      : isToday
                        ? "ring-2 ring-emerald-400 font-bold text-emerald-700"
                        : count > 0
                          ? "font-bold text-slate-900 bg-emerald-50 hover:bg-emerald-100"
                          : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                  {count > 0 && !isSelected && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected date info */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-emerald-700">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => setSelectedDate(null)} className="text-emerald-400 hover:text-emerald-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-emerald-600 mt-1">{appointmentDateCounts[selectedDate] || 0} lịch hẹn</p>
            </div>
          )}

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
              {selectedDate
                ? `Lịch hẹn ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN')}`
                : 'Tất cả lịch hẹn'}
              <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs ml-2">{filteredAppointments.length}</span>
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full sm:w-44 pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Filter button */}
              <div className="relative">
                <button
                  className={`flex items-center justify-center gap-2 px-3 py-1.5 border text-sm font-medium rounded-lg transition-colors shadow-sm ${
                    statusFilter !== 'Tất cả'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                  {statusFilter !== 'Tất cả' && (
                    <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
                  )}
                </button>
                {/* Filter dropdown */}
                {showFilterPanel && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-800">Lọc theo trạng thái</h4>
                      <button onClick={() => setShowFilterPanel(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {allStatuses.map((s) => (
                        <label key={s} className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="status_filter"
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            checked={statusFilter === s}
                            onChange={() => { setStatusFilter(s); setShowFilterPanel(false); }}
                          />
                          <span className={`text-sm font-medium ${statusFilter === s ? 'text-emerald-700' : 'text-slate-700'}`}>
                            {s}
                          </span>
                          {s !== 'Tất cả' && (
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md border ${getStatusColor(s)}`}>
                              {appointments.filter(a => a.status === s).length}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                    {statusFilter !== 'Tất cả' && (
                      <div className="p-3 border-t border-slate-100">
                        <button
                          onClick={() => { setStatusFilter('Tất cả'); setShowFilterPanel(false); }}
                          className="w-full text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filters bar */}
          {(selectedDate || statusFilter !== 'Tất cả' || selectedDoctor !== 'Tất cả' || searchQuery.trim()) && (
            <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 flex-wrap bg-slate-50/30">
              <span className="text-xs text-slate-400 font-medium">Đang lọc:</span>
              {selectedDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200">
                  📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN')}
                  <button onClick={() => setSelectedDate(null)} className="ml-0.5 hover:text-emerald-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {statusFilter !== 'Tất cả' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(statusFilter)}`}>
                  {statusFilter}
                  <button onClick={() => setStatusFilter('Tất cả')} className="ml-0.5 hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedDoctor !== 'Tất cả' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
                  🩺 {selectedDoctor}
                  <button onClick={() => setSelectedDoctor('Tất cả')} className="ml-0.5 hover:text-blue-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200">
                  🔍 "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:text-purple-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => { setSelectedDate(null); setStatusFilter('Tất cả'); setSelectedDoctor('Tất cả'); setSearchQuery(''); }}
                className="ml-auto text-xs text-slate-500 hover:text-red-600 font-medium transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Không tìm thấy lịch hẹn nào</p>
                <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc chọn ngày khác</p>
                {(selectedDate || statusFilter !== 'Tất cả' || selectedDoctor !== 'Tất cả' || searchQuery.trim()) && (
                  <button
                    onClick={() => { setSelectedDate(null); setStatusFilter('Tất cả'); setSelectedDoctor('Tất cả'); setSearchQuery(''); }}
                    className="mt-3 px-4 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : filteredAppointments.map((apt) => (
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
                min={new Date().toISOString().slice(0, 16)}
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

      {/* ====== WORK SCHEDULE MODAL ====== */}
      {showWorkSchedule && <WorkScheduleModal
        workSchedules={workSchedules}
        wsLoading={wsLoading}
        wsSearchDoctor={wsSearchDoctor}
        setWsSearchDoctor={setWsSearchDoctor}
        onClose={() => setShowWorkSchedule(false)}
      />}

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

      {/* Booking Dialog */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowBooking(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Đặt lịch hẹn mới</h2>
              <button onClick={() => setShowBooking(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {bookMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${bookMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {bookMsg.text}
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bác sĩ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên bác sĩ..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    value={bookDoctorText}
                    onChange={e => {
                      setBookDoctorText(e.target.value);
                      if (bookForm.doctorId) setBookForm(f => ({ ...f, doctorId: 0 }));
                    }}
                    onFocus={() => setBookFocus("doctor")}
                    onBlur={() => setTimeout(() => { if (bookFocus === "doctor") setBookFocus(null); }, 150)}
                  />
                  {bookForm.doctorId > 0 && (
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => { setBookDoctorText(""); setBookForm(f => ({ ...f, doctorId: 0 })); }}
                    ><X className="w-4 h-4" /></button>
                  )}
                </div>
                {bookFocus === "doctor" && !bookForm.doctorId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                    {doctorOptions
                      .filter(d => d.fullName.toLowerCase().includes(bookDoctorText.toLowerCase()))
                      .length === 0 ? (
                        <div className="px-3 py-2.5 text-sm text-slate-400">Không tìm thấy bác sĩ</div>
                      ) : doctorOptions
                      .filter(d => d.fullName.toLowerCase().includes(bookDoctorText.toLowerCase()))
                      .map(d => (
                        <button
                          key={d.doctorId}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setBookForm(f => ({ ...f, doctorId: d.doctorId }));
                            setBookDoctorText(d.fullName);
                            setBookFocus(null);
                          }}
                        >{d.fullName}</button>
                      ))
                    }
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bệnh nhân <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên bệnh nhân..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    value={bookPatientText}
                    onChange={e => {
                      setBookPatientText(e.target.value);
                      if (bookForm.patientId) setBookForm(f => ({ ...f, patientId: 0 }));
                    }}
                    onFocus={() => setBookFocus("patient")}
                    onBlur={() => setTimeout(() => { if (bookFocus === "patient") setBookFocus(null); }, 150)}
                  />
                  {bookForm.patientId > 0 && (
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => { setBookPatientText(""); setBookForm(f => ({ ...f, patientId: 0 })); }}
                    ><X className="w-4 h-4" /></button>
                  )}
                </div>
                {bookFocus === "patient" && !bookForm.patientId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                    {patientOptions
                      .filter(p => p.fullName.toLowerCase().includes(bookPatientText.toLowerCase()))
                      .length === 0 ? (
                        <div className="px-3 py-2.5 text-sm text-slate-400">Không tìm thấy bệnh nhân</div>
                      ) : patientOptions
                      .filter(p => p.fullName.toLowerCase().includes(bookPatientText.toLowerCase()))
                      .map(p => (
                        <button
                          key={p.patientId}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setBookForm(f => ({ ...f, patientId: p.patientId }));
                            setBookPatientText(p.fullName);
                            setBookFocus(null);
                          }}
                        >{p.fullName}</button>
                      ))
                    }
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phòng khám <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên phòng khám..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    value={bookRoomText}
                    onChange={e => {
                      setBookRoomText(e.target.value);
                      if (bookForm.clinicRoomId) setBookForm(f => ({ ...f, clinicRoomId: 0 }));
                    }}
                    onFocus={() => setBookFocus("room")}
                    onBlur={() => setTimeout(() => { if (bookFocus === "room") setBookFocus(null); }, 150)}
                  />
                  {bookForm.clinicRoomId > 0 && (
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => { setBookRoomText(""); setBookForm(f => ({ ...f, clinicRoomId: 0 })); }}
                    ><X className="w-4 h-4" /></button>
                  )}
                </div>
                {bookFocus === "room" && !bookForm.clinicRoomId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                    {roomOptions
                      .filter(r => `${r.roomName} ${r.roomNumber}`.toLowerCase().includes(bookRoomText.toLowerCase()))
                      .length === 0 ? (
                        <div className="px-3 py-2.5 text-sm text-slate-400">Không tìm thấy phòng khám</div>
                      ) : roomOptions
                      .filter(r => `${r.roomName} ${r.roomNumber}`.toLowerCase().includes(bookRoomText.toLowerCase()))
                      .map(r => (
                        <button
                          key={r.roomId}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setBookForm(f => ({ ...f, clinicRoomId: r.roomId }));
                            setBookRoomText(`${r.roomName} - ${r.roomNumber}`);
                            setBookFocus(null);
                          }}
                        >{r.roomName} - {r.roomNumber}</button>
                      ))
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày giờ hẹn <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  min={new Date().toISOString().slice(0, 16)}
                  value={bookForm.dateTime}
                  onChange={e => setBookForm(f => ({ ...f, dateTime: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lý do khám</label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  rows={3}
                  placeholder="Mô tả triệu chứng hoặc lý do khám..."
                  value={bookForm.reason}
                  onChange={e => setBookForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => void submitBooking()}
                disabled={bookLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {bookLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
