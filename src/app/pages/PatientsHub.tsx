import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreHorizontal, User, Mail, Phone, Calendar } from "lucide-react";

const API_BASE = "http://localhost:8080/api";

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

  useEffect(() => {
    fetch(`${API_BASE}/patients`)
      .then(res => res.json())
      .then(data => { setPatients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

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
