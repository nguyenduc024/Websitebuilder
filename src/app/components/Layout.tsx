import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  UserRoundPlus, 
  CalendarDays, 
  Stethoscope, 
  Receipt,
  Menu,
  Bell,
  X
} from "lucide-react";
import { fetchApi } from "../lib/api";

interface SystemNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
}

interface AppointmentInfo {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  dateTime: string;
  status: string;
}

const NAV_ITEMS = [
  { name: "Tổng quan", path: "/", icon: LayoutDashboard },
  { name: "Quản lý bác sĩ", path: "/doctors", icon: Stethoscope },
  { name: "Hồ sơ bệnh nhân", path: "/patients", icon: Users },
  { name: "Lịch hẹn", path: "/appointments", icon: CalendarDays },
  { name: "Phòng khám", path: "/workspace", icon: UserRoundPlus },
  { name: "Hóa đơn & Thanh toán", path: "/billing", icon: Receipt },
];

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load thông báo từ hệ thống
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [stats, appointments] = await Promise.all([
          fetchApi<DashboardStats>("/dashboard/stats"),
          fetchApi<AppointmentInfo[]>("/appointments"),
        ]);

        const notifs: SystemNotification[] = [];
        let id = 1;

        // Thông báo lịch hẹn chờ xác nhận
        const pending = appointments.filter(a => a.status === "Chờ xác nhận");
        if (pending.length > 0) {
          notifs.push({
            id: id++,
            title: "Lịch hẹn chờ xác nhận",
            message: `Có ${pending.length} lịch hẹn đang chờ xác nhận.`,
            time: "Vừa xong",
            read: false,
          });
        }

        // Thông báo lịch hẹn hôm nay
        const today = new Date().toISOString().slice(0, 10);
        const todayAps = appointments.filter(a => a.dateTime.startsWith(today) && a.status !== "Đã hủy");
        if (todayAps.length > 0) {
          notifs.push({
            id: id++,
            title: "Lịch hẹn hôm nay",
            message: `Hôm nay có ${todayAps.length} lịch hẹn.`,
            time: "Hôm nay",
            read: false,
          });
        }

        // Thông báo tổng quan hệ thống
        notifs.push({
          id: id++,
          title: "Tổng quan hệ thống",
          message: `Hiện có ${stats.totalDoctors} bác sĩ và ${stats.totalPatients} bệnh nhân.`,
          time: "Hệ thống",
          read: true,
        });

        setNotifications(notifs);
      } catch {
        // Không có kết nối backend
        setNotifications([{
          id: 1,
          title: "Mất kết nối",
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.",
          time: "Vừa xong",
          read: false,
        }]);
      }
    };

    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xl">
              +
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">HealthLink</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Contact Footer Information */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Liên hệ hỗ trợ
          </h4>
          <div className="text-xs text-slate-600 space-y-2">
            <p className="flex justify-between">
              <span className="text-slate-400">FB:</span>
              <a href="https://facebook.com/nguyenduc.024" className="hover:text-emerald-600 transition-colors">nguyenduc.024</a>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <a href="tel:0966432687" className="hover:text-emerald-600 transition-colors">0966432687</a>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <a href="mailto:nguyenduc.personal@gmail.com" className="hover:text-emerald-600 transition-colors truncate ml-2">
                nguyenduc.personal@gmail.com
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-slate-600 lg:hidden hover:bg-slate-50 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button 
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">Không có thông báo</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.read ? "bg-emerald-50/40" : ""}`}>
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? "bg-emerald-500" : "bg-transparent"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                          <button onClick={() => removeNotification(n.id)} className="p-0.5 text-slate-300 hover:text-slate-500 flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm border border-emerald-200 cursor-pointer">
              Dr
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
