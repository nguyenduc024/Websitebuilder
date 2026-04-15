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
  Settings
} from "lucide-react";

const API_BASE = "http://localhost:8080/api";

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

export function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/appointments`)
      .then(res => res.json())
      .then(data => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lọc theo bác sĩ</h4>
            {["Tất cả", ...Array.from(new Set(appointments.map(a => a.doctorName)))].map((doc, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="doctor_filter" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" defaultChecked={i === 0} />
                <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">{doc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Lịch hẹn hôm nay
              <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs ml-2">{appointments.length}</span>
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
            ) : appointments.map((apt) => (
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
                  <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors" title="Confirm">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors" title="Reschedule">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" title="Cancel">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
