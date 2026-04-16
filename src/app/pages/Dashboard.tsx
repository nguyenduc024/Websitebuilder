import { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  TrendingUp, 
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import { fetchApi, registerRefreshOnFocus } from "../lib/api";

const API_BASE = "http://localhost:8080/api";

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
}

interface DailyVisitCount {
  day: string;
  patients: number;
}

interface DoctorOption {
  doctorId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
}

interface PatientOption {
  patientId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
}

interface RoomOption {
  roomId: number;
  roomName: string;
  roomNumber: string;
  status: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0 });
  const [chartData, setChartData] = useState<DailyVisitCount[]>([
    { day: 'T2', patients: 0 }, { day: 'T3', patients: 0 }, { day: 'T4', patients: 0 },
    { day: 'T5', patients: 0 }, { day: 'T6', patients: 0 }, { day: 'T7', patients: 0 }, { day: 'CN', patients: 0 },
  ]);
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  const [loading, setLoading] = useState(true);

  // Book appointment state
  const [showBooking, setShowBooking] = useState(false);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [bookForm, setBookForm] = useState({ doctorId: 0, patientId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookMsg, setBookMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const openBookingDialog = async () => {
    setShowBooking(true);
    setBookMsg(null);
    setBookForm({ doctorId: 0, patientId: 0, clinicRoomId: 0, reason: "", dateTime: "" });
    try {
      const [d, p, r] = await Promise.all([
        fetchApi<DoctorOption[]>("/doctors"),
        fetchApi<PatientOption[]>("/patients"),
        fetchApi<RoomOption[]>("/clinic-rooms"),
      ]);
      setDoctors(d);
      setPatients(p);
      setRooms(r);
    } catch {
      setBookMsg({ type: "error", text: "Không thể tải danh sách. Kiểm tra kết nối backend." });
    }
  };

  const submitBooking = async () => {
    if (!bookForm.doctorId || !bookForm.patientId || !bookForm.clinicRoomId || !bookForm.dateTime) {
      setBookMsg({ type: "error", text: "Vui lòng điền đầy đủ thông tin bắt buộc." });
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
        // Reload stats & chart
        void fetchApi<DashboardStats>("/dashboard/stats").then(setStats);
        void loadChartData(selectedWeek);
      } else {
        setBookMsg({ type: "error", text: data.message });
      }
    } catch {
      setBookMsg({ type: "error", text: "Lỗi kết nối server." });
    } finally {
      setBookLoading(false);
    }
  };

  const loadChartData = async (week: string) => {
    try {
      const data = await fetchApi<DailyVisitCount[]>(`/dashboard/weekly-visits?week=${week}`);
      setChartData(data);
    } catch {
      // keep existing data
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      try {
        const data = await fetchApi<DashboardStats>("/dashboard/stats");
        if (isActive) {
          setStats(data);
        }
      } catch {
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadStats();
    void loadChartData(selectedWeek);
    const cleanupRefresh = registerRefreshOnFocus(() => {
      void loadStats();
      void loadChartData(selectedWeek);
    });

    return () => {
      isActive = false;
      cleanupRefresh();
    };
  }, []);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
          <p className="text-sm text-slate-500 mt-1">Chào bạn. Đây là tình hình hôm nay.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Xuất báo cáo
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            onClick={() => void openBookingDialog()}>
            Đặt lịch mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Tổng bệnh nhân", value: loading ? "..." : String(stats.totalPatients), icon: Users },
          { title: "Bác sĩ", value: loading ? "..." : String(stats.totalDoctors), icon: Stethoscope },
          { title: "Lịch hẹn", value: loading ? "..." : String(stats.totalAppointments), icon: CalendarDays },
          { title: "Doanh thu", value: loading ? "..." : formatVND(stats.totalRevenue), icon: TrendingUp },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-900">Lượt khám bệnh</h3>
            <select 
              className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 font-medium"
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                void loadChartData(e.target.value);
              }}
            >
              <option value="current">Tuần này</option>
              <option value="last">Tuần trước</option>
            </select>
          </div>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart id="dashboard-chart" accessibilityLayer={false} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs key="defs">
                  <linearGradient id="colorPatients" key="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1} key="stop1"/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} key="stop2"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="patients" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Cảnh báo</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
            ) : (
              <div className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Hệ thống</h4>
                  <p className="text-xs text-slate-500 mt-1">Hiện có {stats.totalPatients} bệnh nhân và {stats.totalDoctors} bác sĩ trong hệ thống.</p>
                </div>
              </div>
            )}
          </div>
          <button className="mt-6 w-full py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
            Xem tất cả
          </button>
        </div>
      </div>

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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bác sĩ <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={bookForm.doctorId}
                  onChange={e => setBookForm(f => ({ ...f, doctorId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn bác sĩ --</option>
                  {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bệnh nhân <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={bookForm.patientId}
                  onChange={e => setBookForm(f => ({ ...f, patientId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn bệnh nhân --</option>
                  {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phòng khám <span className="text-red-500">*</span></label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={bookForm.clinicRoomId}
                  onChange={e => setBookForm(f => ({ ...f, clinicRoomId: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn phòng khám --</option>
                  {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomName} - {r.roomNumber}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày giờ hẹn <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
