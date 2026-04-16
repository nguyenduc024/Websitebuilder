package gr7.oop.HealthLink.controller;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gr7.oop.HealthLink.dao.ClinicManagerDAO;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.AppointmentInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.ClinicRoomInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.DashboardStats;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.DoctorInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.DoctorStats;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.InvoiceInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.MedicineInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.PatientInfo;
import gr7.oop.HealthLink.dao.ClinicManagerDAO.WorkScheduleInfo;
import gr7.oop.HealthLink.entity.Appointment;
import gr7.oop.HealthLink.entity.ClinicRoom;
import gr7.oop.HealthLink.entity.Department;
import gr7.oop.HealthLink.entity.Doctor;
import gr7.oop.HealthLink.entity.MedicalRecord;
import gr7.oop.HealthLink.entity.Patient;
import gr7.oop.HealthLink.entity.Prescription;
import gr7.oop.HealthLink.entity.PrescriptionDetail;
import gr7.oop.HealthLink.exception.DuplicateAppointmentException;

// Tự động chuyển Object Java sang JSON hoặc XML
@RestController
// Tất cả API bên trong class sẽ bắt đầu bằng /api
@RequestMapping("/api")
// Cho phép tất cả domain truy cập API
@CrossOrigin(origins = "*") // Bắt buộc phải có dòng này để app Electron gọi được API
public class ClinicAPIController {

	private ClinicManagerDAO dao = new ClinicManagerDAO();

	private Map<String, String> response(String status, String message) {
		java.util.HashMap<String, String> map = new java.util.HashMap<>();
		map.put("status", status);
		map.put("message", message);
		return map;
	}

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
				return response("success", "Đặt lịch thành công!");
			} else {
				return response("error", "Lỗi hệ thống khi lưu xuống Database.");
			}

		} catch (DuplicateAppointmentException e) {
			return response("error", "⚠️ " + e.getMessage());
		} catch (Exception e) {
			return response("error", "❌ " + e.getMessage());
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
		boolean success = dao.updateAppointmentStatus(apId, "Đã hủy");
		if (success) {
			return response("success", "Đã hủy lịch hẹn thành công!");
		} else {
			return response("error", "Lỗi: Không thể hủy lịch hẹn này.");
		}
	}

	// API: Xác nhận lịch hẹn
	@PutMapping("/appointments/{apId}/confirm")
	public Map<String, String> confirmAppointment(@PathVariable int apId) {
		boolean success = dao.updateAppointmentStatus(apId, "Đã xác nhận");
		if (success) {
			return response("success", "Đã xác nhận lịch hẹn!");
		} else {
			return response("error", "Lỗi: Không thể xác nhận lịch hẹn.");
		}
	}

	// API: Dời lịch hẹn
	@PutMapping("/appointments/{apId}/reschedule")
	public Map<String, String> rescheduleAppointment(@PathVariable int apId, @RequestBody Map<String, String> payload) {
		try {
			String newDateTime = payload.get("newDateTime");
			if (newDateTime == null || newDateTime.isBlank()) {
				return response("error", "Vui lòng chọn ngày giờ mới.");
			}
			java.sql.Timestamp ts = java.sql.Timestamp.valueOf(newDateTime);
			boolean success = dao.rescheduleAppointment(apId, ts);
			if (success) {
				return response("success", "Đã dời lịch hẹn thành công!");
			} else {
				return response("error", "Lỗi: Không thể dời lịch hẹn.");
			}
		} catch (Exception e) {
			return response("error", "Lỗi: " + e.getMessage());
		}
	}

	// API: Bác sĩ khám và kê đơn thuốc + tự động tạo hóa đơn (Transaction 5 bảng)
	@PostMapping("/medical-record/create")
	public Map<String, Object> createMedicalRecord(@RequestBody MedicalProcessRequest req) {
		Map<String, Object> result = new java.util.HashMap<>();
		try {
			// 0. Kiểm tra trạng thái lịch hẹn — chỉ cho phép "Đã xác nhận"
			String apStatus = dao.getAppointmentStatus(req.appointmentId);
			if (apStatus == null) {
				result.put("status", "error");
				result.put("message", "Không tìm thấy lịch hẹn #" + req.appointmentId);
				return result;
			}
			if (!"Đã xác nhận".equals(apStatus)) {
				result.put("status", "error");
				result.put("message", "Lịch hẹn đang ở trạng thái \"" + apStatus + "\", không thể tạo hồ sơ.");
				return result;
			}

			// 1. Chuyển đổi dữ liệu JSON từ request sang Object
			Doctor doc = new Doctor(req.doctorId, null, null, null, null, null, null, null, null, null);
			Patient pat = new Patient(req.patientId, null, null, null, null, null, null, null, null);

			MedicalRecord mr = new MedicalRecord(0, doc, pat, req.appointmentId, req.diagnosis, req.method,
					req.testResult);
			Prescription pr = new Prescription(0, null, req.doctorNote, null);

			// 2. Chuyển đổi danh sách thuốc từ Frontend sang Object chuẩn Java
			List<PrescriptionDetail> details = new java.util.ArrayList<>();
			for (MedicalProcessRequest.MedicineItem item : req.prescriptionDetails) {
				gr7.oop.HealthLink.entity.CategoryMedicine med = new gr7.oop.HealthLink.entity.CategoryMedicine(
						item.medicineId, null, 0, 0.0, null);
				details.add(
						new PrescriptionDetail(0, null, med, item.unitPrice, item.quantity, item.duration, item.guide));
			}

			// 3. Gọi DAO Transaction (5 bảng: MEDICAL_RECORD, PRESCRIPTION, PRESCRIPTION_DETAIL, INVOICE, INVOICE_DETAIL)
			ClinicManagerDAO.MedicalProcessResult processResult = dao.createMedicalRecordAndPrescription(mr, pr, details);

			if (processResult != null) {
				result.put("status", "success");
				result.put("message", "Đã lưu hồ sơ, kê đơn và tạo hóa đơn thành công!");
				result.put("mrId", processResult.mrId);
				result.put("prId", processResult.prId);
				result.put("invoiceId", processResult.invoiceId);
				result.put("totalPrice", processResult.totalPrice);
			} else {
				result.put("status", "error");
				result.put("message", "Lỗi Transaction khi lưu vào Database.");
			}
		} catch (Exception e) {
			result.put("status", "error");
			result.put("message", "Lỗi dữ liệu: " + e.getMessage());
		}
		return result;
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
				return response("success", "Hóa đơn đã được tạo thành công!");
			}
			return response("error", "Lỗi tạo hóa đơn.");
		} catch (Exception e) {
			return response("error", "Dữ liệu hóa đơn không hợp lệ.");
		}
	}

	// Bác sĩ đặt lịch làm việc
	@PostMapping("/work-schedule/add")
	public Map<String, String> addWorkSchedule(@RequestBody Map<String, String> payload) {
		try {
			int drId = Integer.parseInt(payload.get("drId"));
			int crId = Integer.parseInt(payload.get("crId"));
			Date wsDay = Date.valueOf(payload.get("wsDay"));
			Time wsStartTime = Time.valueOf(payload.get("wsStartTime") + ":00");
			Time wsEndTime = Time.valueOf(payload.get("wsEndTime") + ":00");

			boolean success = dao.setWorkScheduleAuto(drId, crId, wsDay, wsStartTime, wsEndTime);
			if (success) {
				return response("success", "Đã thêm lịch làm việc!");
			}
			return response("error", "Không thể lưu lịch làm việc.");
		} catch (Exception e) {
			return response("error", "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
		}
	}

	@GetMapping("/work-schedules")
	public List<WorkScheduleInfo> getAllWorkSchedules() {
		return dao.getAllWorkSchedules();
	}

	@DeleteMapping("/work-schedules/{wsId}")
	public Map<String, String> deleteWorkSchedule(@PathVariable int wsId) {
		boolean success = dao.deleteWorkSchedule(wsId);
		if (success) {
			return response("success", "Đã xóa lịch làm việc!");
		}
		return response("error", "Không thể xóa lịch làm việc.");
	}

	// API: Thêm bác sĩ mới
	@PostMapping("/add-doctor")
	public Map<String, String> addDoctor(@RequestBody Map<String, String> payload) {
		try {
			String firstName = payload.get("firstName");
			String middleName = payload.get("middleName");
			String lastName = payload.get("lastName");
			String sex = payload.get("sex");
			String phone = payload.get("phone");
			String address = payload.get("address");
			String specialty = payload.get("specialty");
			String birthdayStr = payload.get("birthday");
			String departmentIdStr = payload.get("departmentId");

			if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
				return response("error", "Họ và tên không được để trống.");
			}

			java.sql.Date birthday = null;
			if (birthdayStr != null && !birthdayStr.isBlank()) {
				birthday = java.sql.Date.valueOf(birthdayStr);
			}

			int deptId = 0;
			if (departmentIdStr != null && !departmentIdStr.isBlank()) {
				deptId = Integer.parseInt(departmentIdStr);
			}

			Department dept = new Department(deptId, null, null);
			Doctor doctor = new Doctor(0, firstName, middleName, lastName, birthday, sex, phone, address, specialty, dept);

			boolean success = dao.addDoctor(doctor);
			if (success) {
				return response("success", "Thêm bác sĩ thành công!");
			} else {
				return response("error", "Lỗi hệ thống khi lưu bác sĩ.");
			}
		} catch (Exception e) {
			return response("error", "Lỗi: " + e.getMessage());
		}
	}

	// API: Thêm bệnh nhân mới
	@PostMapping("/add-patient")
	public Map<String, String> addPatient(@RequestBody Map<String, String> payload) {
		try {
			String firstName = payload.get("firstName");
			String middleName = payload.get("middleName");
			String lastName = payload.get("lastName");
			String sex = payload.get("sex");
			String phone = payload.get("phone");
			String address = payload.get("address");
			String insurance = payload.get("insurance");
			String birthdayStr = payload.get("birthday");

			if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
				return response("error", "Họ và tên không được để trống.");
			}

			java.sql.Date birthday = null;
			if (birthdayStr != null && !birthdayStr.isBlank()) {
				birthday = java.sql.Date.valueOf(birthdayStr);
			}

			Patient patient = new Patient(0, firstName, middleName, lastName, birthday, sex, phone, address, insurance);

			boolean success = dao.addPatient(patient);
			if (success) {
				return response("success", "Thêm bệnh nhân thành công!");
			} else {
				return response("error", "Lỗi hệ thống khi lưu bệnh nhân.");
			}
		} catch (Exception e) {
			return response("error", "Lỗi: " + e.getMessage());
		}
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

	// API: Xem chi tiết hóa đơn (bao gồm thuốc, bệnh nhân, bác sĩ)
	@GetMapping("/invoices/{id}")
	public Object getInvoiceDetail(@PathVariable int id) {
		ClinicManagerDAO.InvoiceDetailInfo detail = dao.getInvoiceDetail(id);
		if (detail == null) {
			return response("error", "Không tìm thấy hóa đơn #" + id);
		}
		return detail;
	}

	// API: Thanh toán hóa đơn
	@PutMapping("/invoices/{id}/pay")
	public Map<String, String> payInvoice(@PathVariable int id, @RequestBody Map<String, String> payload) {
		String paymentMethod = payload.get("paymentMethod");
		if (paymentMethod == null || paymentMethod.isBlank()) {
			return response("error", "Vui lòng chọn phương thức thanh toán.");
		}
		// Kiểm tra hóa đơn tồn tại và đang ở trạng thái chưa thanh toán
		ClinicManagerDAO.InvoiceDetailInfo invoice = dao.getInvoiceDetail(id);
		if (invoice == null) {
			return response("error", "Không tìm thấy hóa đơn #" + id);
		}
		if ("Đã thanh toán".equals(invoice.status)) {
			return response("error", "Hóa đơn #" + id + " đã được thanh toán trước đó.");
		}
		boolean success = dao.payInvoice(id, paymentMethod);
		if (success) {
			return response("success", "Thanh toán hóa đơn #" + id + " thành công!");
		}
		return response("error", "Lỗi khi thanh toán hóa đơn.");
	}

	@GetMapping("/dashboard/stats")
	public DashboardStats getDashboardStats() {
		return dao.getDashboardStats();
	}

	@GetMapping("/dashboard/weekly-visits")
	public List<ClinicManagerDAO.DailyVisitCount> getWeeklyVisits(@RequestParam(defaultValue = "current") String week) {
		return dao.getWeeklyVisits(week);
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

	// Xếp hạng bác sĩ theo số lịch hẹn giảm dần - Giải thuật Heap Sort O(n log n)
	@GetMapping("/doctor-ranking")
	public List<ClinicManagerDAO.DoctorAppointmentRanking> getDoctorRanking() {
		return dao.getDoctorRankingByHeapSort();
	}
}
