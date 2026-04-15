package gr7.oop.HealthLink.controller;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gr7.oop.HealthLink.dao.ClinicManagerDAO;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.DoctorStats;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.DoctorInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.PatientInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.InvoiceInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.DashboardStats;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.ClinicRoomInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.MedicineInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.AppointmentInfo;
import gr7.oop.HealthLink.entity.Appointment;
import gr7.oop.HealthLink.entity.ClinicRoom;
import gr7.oop.HealthLink.entity.Department;
import gr7.oop.HealthLink.entity.Doctor;
import gr7.oop.HealthLink.entity.MedicalRecord;
import gr7.oop.HealthLink.entity.Patient;
import gr7.oop.HealthLink.entity.Prescription;
import gr7.oop.HealthLink.entity.PrescriptionDetail;
import gr7.oop.HealthLink.entity.WorkSchedule;
import gr7.oop.HealthLink.exception.DuplicateAppointmentException;

// Tự động chuyển Object Java sang JSON hoặc XML
@RestController
// Tất cả API bên trong class sẽ bắt đầu bằng /api
@RequestMapping("/api")
// Cho phép tất cả domain truy cập API
@CrossOrigin(origins = "*") // Bắt buộc phải có dòng này để app Electron gọi được API
public class ClinicAPIController {

	private ClinicManagerDAO dao = new ClinicManagerDAO();

	// Cung cấp API đường dẫn: http://localhost:8080/api/top-doctors
	@GetMapping("/top-doctors")
	public List<DoctorStats> getTopDoctors() {
		// Hàm này sẽ liên kết xuống SQL Server, đếm số lịch hẹn,
		// chạy thuật toán Heap-Sort sắp xếp giảm dần rồi trả về đây.
		return dao.getTopDoctors();
	}

	@PostMapping("/book-appointment")
	public Map<String, String> bookAppointment(@RequestBody AppointmentRequest req) {
		try {
			// 1. Chuyển đổi dữ liệu từ Giao diện thành Đối tượng chuẩn (HAS-A)
			Doctor doctor = new Doctor(req.doctorId, null, null, null, null, null, null, null, null, null); // Chỉ cần
																											// ID
																											// để map
			Patient patient = new Patient(req.patientId, null, null, null, null, null, null, null, null);
			ClinicRoom room = new ClinicRoom(req.clinicRoomId, null, null, null, 0, null);
			Timestamp appointmentTime = Timestamp.valueOf(req.dateTime); // Ép kiểu giờ

			Appointment newAp = new Appointment(0, doctor, patient, room, "Chờ xác nhận", req.reason, appointmentTime);

			// 2. Gọi DAO để lưu
			boolean success = dao.bookAppointment(newAp);

			if (success) {
				return Map.of("status", "success", "message", "🎉 Đặt lịch thành công!");
			} else {
				return Map.of("status", "error", "message", "Lỗi hệ thống khi lưu xuống Database.");
			}

		} catch (DuplicateAppointmentException e) {
			return Map.of("status", "error", "message", "⚠️ " + e.getMessage());
		} catch (Exception e) {
			return Map.of("status", "error", "message", "❌ Sai định dạng dữ liệu: " + e.getMessage());
		}
	}

	// API: Xem danh sách lịch hẹn của 1 bác sĩ
	@GetMapping("/appointments/doctor/{doctorId}")
	public List<ClinicManagerDAO.AppointmentInfo> getDoctorAppointments(@PathVariable int doctorId) {
		return dao.getAppointmentsByDoctor(doctorId);
	}

	// API 4: Hủy lịch hẹn
	@PutMapping("/appointments/{apId}/cancel")
	public Map<String, String> cancelAppointment(@PathVariable int apId) {
		// Tái sử dụng hàm update đã có sẵn ở DAO
		boolean success = dao.updateAppointmentStatus(apId, "Đã hủy");

		if (success) {
			return Map.of("status", "success", "message", "Đã hủy lịch hẹn thành công!");
		} else {
			return Map.of("status", "error", "message", "Lỗi: Không thể hủy lịch hẹn này.");
		}
	}

	// API: Bác sĩ khám và kê đơn thuốc (Transaction 3 bảng)
	@PostMapping("/medical-record/create")
	public Map<String, String> createMedicalRecord(@RequestBody MedicalProcessRequest req) {
		try {
			// 1. Chuyển đổi dữ liệu JSON từ request sang Object
			Doctor doc = new Doctor(req.doctorId, null, null, null, null, null, null, null, null, null);
			Patient pat = new Patient(req.patientId, null, null, null, null, null, null, null, null);

			MedicalRecord mr = new MedicalRecord(0, doc, pat, req.appointmentId, req.diagnosis, req.method,
					req.testResult);
			Prescription pr = new Prescription(0, null, req.doctorNote, null); // mrId sẽ tự sinh trong DAO

			// 2. CHUYỂN ĐỔI (MAP) DANH SÁCH THUỐC TỪ FRONTEND SANG OBJECT CHUẨN CỦA JAVA
			List<PrescriptionDetail> details = new java.util.ArrayList<>();
			for (MedicalProcessRequest.MedicineItem item : req.prescriptionDetails) {
				// Tạo object Thuốc tạm (chỉ cần ID để lưu)
				gr7.oop.HealthLink.entity.CategoryMedicine med = new gr7.oop.HealthLink.entity.CategoryMedicine(
						item.medicineId, null, 0, 0.0, null);

				// Đưa vào danh sách chi tiết
				details.add(
						new PrescriptionDetail(0, null, med, item.unitPrice, item.quantity, item.duration, item.guide));
			}

			// 3. Gọi DAO với ĐÚNG tên hàm của bạn và truyền danh sách 'details' đã được
			// dịch
			boolean success = dao.createMedicalRecordAndPrescription(mr, pr, details);

			if (success) {
				return Map.of("status", "success", "message", "Đã lưu hồ sơ và kê đơn thành công!");
			} else {
				return Map.of("status", "error", "message", "Lỗi Transaction khi lưu vào Database.");
			}
		} catch (Exception e) {
			return Map.of("status", "error", "message", "Lỗi dữ liệu: " + e.getMessage());
		}
	}

	// API: Lấy chi tiết đơn thuốc
	@GetMapping("/prescription/{prId}/details")
	public List<PrescriptionDetail> getPrescriptionDetails(@PathVariable int prId) {
		// Bạn cần viết thêm 1 hàm getPrescriptionDetails(prId) trong DAO chứa câu lệnh:
		// SELECT * FROM PRESCRIPTION_DETAIL WHERE PRId = ?
		return dao.getPrescriptionDetails(prId);
	}

	// API: Xuất hóa đơn dựa trên lịch hẹn và đơn thuốc
	@PostMapping("/invoice/generate")
	public Map<String, String> generateInvoice(@RequestBody Map<String, Object> payload) {
		try {
			int apId = Integer.parseInt(payload.get("apId").toString());
			int prId = Integer.parseInt(payload.get("prId").toString());
			String paymentMethod = payload.get("paymentMethod").toString();

			boolean success = dao.generateInvoice(apId, prId, paymentMethod);
			if (success) {
				return Map.of("status", "success", "message", "Hóa đơn đã được tạo thành công!");
			}
			return Map.of("status", "error", "message", "Lỗi tạo hóa đơn.");
		} catch (Exception e) {
			return Map.of("status", "error", "message", "Dữ liệu hóa đơn không hợp lệ.");
		}
	}

	// Bác sĩ đặt lịch làm việc
	@PostMapping("/work-schedule/add")
	public Map<String, String> addWorkSchedule(@RequestBody WorkSchedule ws) {
		boolean success = dao.setWorkSchedule(ws);
		if (success) {
			return Map.of("status", "success", "message", "Đã cập nhật lịch làm việc!");
		}
		return Map.of("status", "error", "message", "Không thể lưu lịch làm việc.");
	}

	// ===== LISTING APIs =====

	@GetMapping("/doctors")
	public List<DoctorInfo> getAllDoctors() {
		return dao.getAllDoctors();
	}

	@GetMapping("/patients")
	public List<PatientInfo> getAllPatients() {
		return dao.getAllPatients();
	}

	@GetMapping("/appointments")
	public List<AppointmentInfo> getAllAppointments() {
		return dao.getAllAppointments();
	}

	@GetMapping("/invoices")
	public List<InvoiceInfo> getAllInvoices() {
		return dao.getAllInvoices();
	}

	@GetMapping("/dashboard/stats")
	public DashboardStats getDashboardStats() {
		return dao.getDashboardStats();
	}

	@GetMapping("/clinic-rooms")
	public List<ClinicRoomInfo> getAllClinicRooms() {
		return dao.getAllClinicRooms();
	}

	@GetMapping("/departments")
	public List<Department> getAllDepartments() {
		return dao.getAllDepartments();
	}

	@GetMapping("/medicines")
	public List<MedicineInfo> getAllMedicines() {
		return dao.getAllMedicines();
	}
}
