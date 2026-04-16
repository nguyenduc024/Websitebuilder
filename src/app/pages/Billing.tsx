import { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  X,
  User,
  Stethoscope,
  Pill,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
  Eye,
} from "lucide-react";
import { API_BASE, fetchApi, registerRefreshOnFocus } from "../lib/api";

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

interface InvoiceMedicineItem {
  medicineName: string;
  unitPrice: number;
  quantity: number;
  duration: number;
  guide: string;
  subtotal: number;
}

interface InvoiceDetail {
  invoiceId: number;
  appointmentId: number;
  prescriptionId: number | null;
  patientName: string;
  patientPhone: string | null;
  patientInsurance: string | null;
  doctorName: string;
  doctorSpecialty: string | null;
  diagnosis: string | null;
  doctorNote: string | null;
  totalPrice: number;
  paymentMethod: string | null;
  status: string;
  paidDate: string | null;
  createdAt: string | null;
  medicines: InvoiceMedicineItem[];
}

type FilterStatus = "all" | "Chưa thanh toán" | "Đã thanh toán";

export function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Payment modal
  const [payingInvoice, setPayingInvoice] = useState<InvoiceDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paying, setPaying] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadInvoices = useCallback(async () => {
    try {
      const data = await fetchApi<InvoiceData[]>("/invoices");
      setInvoices(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
    const cleanup = registerRefreshOnFocus(() => void loadInvoices());
    return cleanup;
  }, [loadInvoices]);

  const openDetail = async (invoiceId: number) => {
    setDetailLoading(true);
    setSelectedInvoice(null);
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}`);
      const data = await res.json();
      if (data.status === "error") {
        showToast(data.message, "error");
        return;
      }
      setSelectedInvoice(data as InvoiceDetail);
    } catch {
      showToast("Lỗi kết nối server.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const openPayment = (invoice: InvoiceDetail) => {
    setPayingInvoice(invoice);
    setPaymentMethod("");
  };

  const handlePay = async () => {
    if (!payingInvoice || !paymentMethod) return;
    setPaying(true);
    try {
      const res = await fetch(`${API_BASE}/invoices/${payingInvoice.invoiceId}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast(data.message, "success");
        setPayingInvoice(null);
        setSelectedInvoice(null);
        void loadInvoices();
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Lỗi kết nối server.", "error");
    } finally {
      setPaying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã thanh toán": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Chưa thanh toán": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Đã thanh toán": return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      case "Chưa thanh toán": return <Clock className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const totalRevenue = invoices.filter((i) => i.status === "Đã thanh toán").reduce((s, i) => s + i.totalPrice, 0);
  const pendingAmount = invoices.filter((i) => i.status === "Chưa thanh toán").reduce((s, i) => s + i.totalPrice, 0);
  const formatVND = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inv.invoiceId).includes(searchTerm);
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hóa đơn & Thanh toán</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hóa đơn, thanh toán và báo cáo tài chính.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-sm font-medium text-slate-500">Tổng hóa đơn</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo bệnh nhân, bác sĩ hoặc mã HĐ..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="w-4 h-4" />
              {filterStatus === "all" ? "Tất cả" : filterStatus}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[160px]">
                {(["all", "Chưa thanh toán", "Đã thanh toán"] as FilterStatus[]).map((s) => (
                  <button
                    key={s}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${filterStatus === s ? "text-emerald-600 font-semibold" : "text-slate-700"}`}
                    onClick={() => { setFilterStatus(s); setShowFilterDropdown(false); }}
                  >
                    {s === "all" ? "Tất cả" : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Mã HĐ</th>
                <th className="px-6 py-4 font-medium">Bệnh nhân</th>
                <th className="px-6 py-4 font-medium">Phương thức</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">Không có hóa đơn nào.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.invoiceId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      HD-{String(invoice.invoiceId).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{invoice.patientName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">BS: {invoice.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {invoice.paymentMethod || <span className="text-slate-400 italic">Chưa chọn</span>}
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
                        <button
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-md transition-colors text-xs font-semibold shadow-sm flex items-center gap-1"
                          onClick={() => openDetail(invoice.invoiceId)}
                        >
                          <Eye className="w-3 h-3" />
                          Xem
                        </button>
                        {invoice.status === "Chưa thanh toán" && (
                          <button
                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors text-xs font-semibold shadow-sm flex items-center gap-1"
                            onClick={() => openDetail(invoice.invoiceId).then(() => {
                              /* payment is opened from detail modal */
                            })}
                          >
                            <CreditCard className="w-3 h-3" />
                            Thanh toán
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== INVOICE DETAIL MODAL ====== */}
      {(selectedInvoice || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!detailLoading) setSelectedInvoice(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="p-12 text-center text-sm text-slate-500">Đang tải chi tiết hóa đơn...</div>
            ) : selectedInvoice && (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-900">HD-{String(selectedInvoice.invoiceId).padStart(3, "0")}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedInvoice.status)}`}>
                        {getStatusIcon(selectedInvoice.status)}
                        {selectedInvoice.status}
                      </span>
                    </div>
                    {selectedInvoice.createdAt && (
                      <p className="text-xs text-slate-400">Ngày tạo: {new Date(selectedInvoice.createdAt).toLocaleString("vi-VN")}</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedInvoice(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Patient & Doctor Info */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Bệnh nhân
                    </div>
                    <p className="text-sm font-bold text-slate-900">{selectedInvoice.patientName}</p>
                    {selectedInvoice.patientPhone && <p className="text-xs text-slate-500 mt-0.5">SĐT: {selectedInvoice.patientPhone}</p>}
                    {selectedInvoice.patientInsurance && <p className="text-xs text-slate-500 mt-0.5">BHYT: {selectedInvoice.patientInsurance}</p>}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Stethoscope className="w-4 h-4 text-emerald-500" />
                      Bác sĩ khám
                    </div>
                    <p className="text-sm font-bold text-slate-900">{selectedInvoice.doctorName}</p>
                    {selectedInvoice.doctorSpecialty && <p className="text-xs text-slate-500 mt-0.5">Chuyên khoa: {selectedInvoice.doctorSpecialty}</p>}
                  </div>
                </div>

                {/* Diagnosis */}
                {selectedInvoice.diagnosis && (
                  <div className="px-6 pb-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Chẩn đoán</p>
                      <p className="text-sm text-slate-800">{selectedInvoice.diagnosis}</p>
                      {selectedInvoice.doctorNote && (
                        <p className="text-xs text-slate-500 mt-2 italic">Ghi chú BS: {selectedInvoice.doctorNote}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Medicine Table */}
                {selectedInvoice.medicines.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Pill className="w-4 h-4 text-purple-500" />
                      Đơn thuốc ({selectedInvoice.medicines.length} loại)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="px-4 py-2 text-left font-medium">Thuốc</th>
                            <th className="px-4 py-2 text-right font-medium">Đơn giá</th>
                            <th className="px-4 py-2 text-center font-medium">SL</th>
                            <th className="px-4 py-2 text-center font-medium">Ngày</th>
                            <th className="px-4 py-2 text-right font-medium">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedInvoice.medicines.map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5">
                                <div className="font-medium text-slate-900">{med.medicineName}</div>
                                {med.guide && <div className="text-xs text-slate-400 mt-0.5">{med.guide}</div>}
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-600">{formatVND(med.unitPrice)}</td>
                              <td className="px-4 py-2.5 text-center text-slate-600">{med.quantity}</td>
                              <td className="px-4 py-2.5 text-center text-slate-600">{med.duration}</td>
                              <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatVND(med.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Total & Payment */}
                <div className="px-6 pb-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Tổng cộng</p>
                      {selectedInvoice.paymentMethod && (
                        <p className="text-xs text-slate-500 mt-0.5">Thanh toán: {selectedInvoice.paymentMethod}</p>
                      )}
                      {selectedInvoice.paidDate && (
                        <p className="text-xs text-slate-500">Ngày TT: {new Date(selectedInvoice.paidDate).toLocaleString("vi-VN")}</p>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{formatVND(selectedInvoice.totalPrice)}</p>
                  </div>
                </div>

                {/* Actions */}
                {selectedInvoice.status === "Chưa thanh toán" && (
                  <div className="px-6 pb-6">
                    <button
                      className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center gap-2"
                      onClick={() => openPayment(selectedInvoice)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Tiến hành thanh toán
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ====== PAYMENT MODAL ====== */}
      {payingInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPayingInvoice(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Thanh toán HD-{String(payingInvoice.invoiceId).padStart(3, "0")}</h3>
              <button onClick={() => setPayingInvoice(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Số tiền cần thanh toán</p>
                <p className="text-3xl font-bold text-slate-900">{formatVND(payingInvoice.totalPrice)}</p>
                <p className="text-xs text-slate-400 mt-1">BN: {payingInvoice.patientName}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Phương thức thanh toán</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "Tiền mặt", icon: Banknote, color: "emerald" },
                    { value: "Thẻ", icon: CreditCard, color: "blue" },
                    { value: "Chuyển khoản", icon: Smartphone, color: "purple" },
                  ].map((m) => (
                    <button
                      key={m.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === m.value
                          ? `border-${m.color}-500 bg-${m.color}-50 text-${m.color}-700`
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                      onClick={() => setPaymentMethod(m.value)}
                    >
                      <m.icon className="w-6 h-6" />
                      <span className="text-xs font-semibold">{m.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={!paymentMethod || paying}
                onClick={handlePay}
              >
                {paying ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Xác nhận thanh toán
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
