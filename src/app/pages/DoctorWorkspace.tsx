import { useState, useEffect } from "react";
import { 
  FileText, 
  Pill, 
  Search, 
  Plus, 
  Save, 
  ChevronRight, 
  User, 
  Clock, 
  AlertCircle,
  X
} from "lucide-react";

const API_BASE = "http://localhost:8080/api";

interface QueueItem {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  clinicRoomName: string | null;
  status: string;
  reason: string | null;
  dateTime: string;
}

export function DoctorWorkspace() {
  const [activeTab, setActiveTab] = useState("ehr");
  const [selectedPatientIdx, setSelectedPatientIdx] = useState(0);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/appointments`)
      .then(res => res.json())
      .then((data: QueueItem[]) => { setQueue(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selectedPatient = queue[selectedPatientIdx] || null;

  const formatTime = (dateTimeStr: string) => {
    try { return new Date(dateTimeStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); }
    catch { return '—'; }
  };

  const handleViewMedication = (med: any) => {
    setSelectedMedication(med);
    setShowPrescriptionModal(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Phòng khám</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ bệnh nhân, đơn thuốc và danh sách chờ.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Lưu nháp
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
            Hoàn tất khám
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Dynamic Appointment List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col h-[500px] lg:h-auto overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Danh sách chờ
            </h2>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
            ) : queue.map((patient, idx) => (
              <div 
                key={patient.appointmentId} 
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors border ${
                  selectedPatientIdx === idx 
                    ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                    : "bg-white border-transparent hover:bg-slate-50"
                }`}
                onClick={() => setSelectedPatientIdx(idx)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-slate-900">{formatTime(patient.dateTime)}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ${
                    patient.status === 'Đã xác nhận' ? 'bg-amber-100 text-amber-700' : 
                    patient.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {patient.status}
                  </span>
                </div>
                <h3 className={`text-sm font-medium ${selectedPatientIdx === idx ? "text-emerald-700" : "text-slate-700"}`}>
                  {patient.patientName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{patient.reason || 'Khám bệnh'} • {patient.doctorName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Main Area */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden h-[600px] lg:h-auto">
          
          {/* Patient Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start sm:items-center justify-between bg-slate-50/50">
            {selectedPatient ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                {selectedPatient.patientName?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedPatient.patientName}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                  <span>Mã LH: {selectedPatient.appointmentId}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>BS: {selectedPatient.doctorName}</span>
                  {selectedPatient.clinicRoomName && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{selectedPatient.clinicRoomName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            ) : (
              <div className="text-sm text-slate-500">Chọn bệnh nhân từ danh sách chờ</div>
            )}
            <button className="hidden sm:flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Hồ sơ đầy đủ <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-4 sm:px-6">
            <button 
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ehr' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={() => setActiveTab('ehr')}
            >
              <FileText className="w-4 h-4" /> Hồ sơ bệnh án
            </button>
            <button 
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rx' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={() => setActiveTab('rx')}
            >
              <Pill className="w-4 h-4" /> Đơn thuốc
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
            {activeTab === 'ehr' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Triệu chứng chính</label>
                    <textarea 
                      className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                      placeholder="Bệnh nhân cho biết..."
                      defaultValue=""
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Chỉ số sinh tồn</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">BP</span>
                        <span className="text-sm font-bold text-slate-900">120/80</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">HR</span>
                        <span className="text-sm font-bold text-slate-900">72 bpm</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Temp</span>
                        <span className="text-sm font-bold text-slate-900">98.6 °F</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">SpO2</span>
                        <span className="text-sm font-bold text-slate-900">99%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ghi chú lâm sàng & Chẩn đoán</label>
                  <textarea 
                    className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                    placeholder="Nhập ghi chú lâm sàng chi tiết..."
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-slate-900">Đơn thuốc hiện tại</h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 transition-colors">
                    <Plus className="w-4 h-4" /> Thêm thuốc
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days", notes: "Take in the morning with food." },
                    { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "90 days", notes: "Take at bedtime." }
                  ].map((med, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                          <Pill className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{med.name} <span className="text-slate-500 font-medium ml-1">{med.dosage}</span></h4>
                          <p className="text-xs text-slate-500 mt-1">{med.frequency} for {med.duration}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleViewMedication(med)}
                        className="mt-3 sm:mt-0 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showPrescriptionModal && selectedMedication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" /> Chi tiết thuốc
              </h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên thuốc</label>
                <p className="text-base font-bold text-slate-900 mt-1">{selectedMedication.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Liều lượng</label>
                  <p className="text-sm font-medium text-slate-800 mt-1">{selectedMedication.dosage}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thời gian</label>
                  <p className="text-sm font-medium text-slate-800 mt-1">{selectedMedication.duration}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tần suất</label>
                <p className="text-sm font-medium text-slate-800 mt-1">{selectedMedication.frequency}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Ghi chú dược sĩ
                </label>
                <p className="text-sm text-amber-900 mt-1">{selectedMedication.notes}</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
                In đơn thuốc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
