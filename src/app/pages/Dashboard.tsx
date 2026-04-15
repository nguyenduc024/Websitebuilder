import { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  TrendingUp, 
  AlertCircle 
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

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
}

const defaultData = [
  { name: 'T2', patients: 0 },
  { name: 'T3', patients: 0 },
  { name: 'T4', patients: 0 },
  { name: 'T5', patients: 0 },
  { name: 'T6', patients: 0 },
  { name: 'T7', patients: 0 },
  { name: 'CN', patients: 0 },
];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

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
    const cleanupRefresh = registerRefreshOnFocus(() => {
      void loadStats();
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
          <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
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
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 font-medium">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </div>
          <div className="h-72 w-full min-h-[288px]">
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart id="dashboard-chart" accessibilityLayer={false} data={defaultData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs key="defs">
                  <linearGradient id="colorPatients" key="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1} key="stop1"/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} key="stop2"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
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
    </div>
  );
}
