import { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText
} from "lucide-react";

const API_BASE = "http://localhost:8080/api";

interface InvoiceData {
  invoiceId: number;
  appointmentId: number;
  prescriptionId: number | null;
  totalPrice: number;
  paymentMethod: string | null;
  status: string;
  paidDate: string | null;
  patientName: string;
  doctorName: string;
}

export function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/invoices`)
      .then(res => res.json())
      .then(data => { setInvoices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Đã thanh toán': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Chưa thanh toán': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Đã hủy': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Đã thanh toán': return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      case 'Chưa thanh toán': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'Đã hủy': return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'Đã thanh toán').reduce((s, i) => s + i.totalPrice, 0);
  const pendingAmount = invoices.filter(i => i.status === 'Chưa thanh toán').reduce((s, i) => s + i.totalPrice, 0);
  const cancelledAmount = invoices.filter(i => i.status === 'Đã hủy').reduce((s, i) => s + i.totalPrice, 0);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const filteredInvoices = invoices.filter(inv => 
    inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(inv.invoiceId).includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hóa đơn & Thanh toán</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hóa đơn, thanh toán và báo cáo tài chính.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          <FileText className="w-4 h-4" />
          Tạo hóa đơn
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatVND(totalRevenue)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Chờ thanh toán</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatVND(pendingAmount)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Đã hủy</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatVND(cancelledAmount)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm hóa đơn theo bệnh nhân hoặc mã..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Mã HĐ</th>
                <th className="px-6 py-4 font-medium">Bệnh nhân</th>
                <th className="px-6 py-4 font-medium">Ngày thanh toán</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : filteredInvoices.map((invoice) => (
                <tr key={invoice.invoiceId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    HD-{String(invoice.invoiceId).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900">{invoice.patientName}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">BS: {invoice.doctorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {invoice.paidDate || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {formatVND(invoice.totalPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-md transition-colors text-xs font-semibold shadow-sm">
                        Xem
                      </button>
                      <button className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
