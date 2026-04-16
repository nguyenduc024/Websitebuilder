package gr7.oop.HealthLink.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import gr7.oop.HealthLink.DatabaseConnection;
import gr7.oop.HealthLink.algorithm.HeapSort;
import gr7.oop.HealthLink.entity.Appointment;
import gr7.oop.HealthLink.entity.CategoryMedicine;
import gr7.oop.HealthLink.entity.Department;
import gr7.oop.HealthLink.entity.Doctor;
import gr7.oop.HealthLink.entity.MedicalRecord;
import gr7.oop.HealthLink.entity.Patient;
import gr7.oop.HealthLink.entity.Prescription;
import gr7.oop.HealthLink.entity.PrescriptionDetail;
import gr7.oop.HealthLink.exception.DuplicateAppointmentException;

public class ClinicManagerDAO {
	// 1. thêm bác sĩ mới và thêm bệnh nhân mới
	public boolean addDoctor(Doctor d) {
		String sql = "INSERT INTO DOCTOR (DrFirstName, DrMiddleName, DrLastName, DrBirthday, DrSex, DrPhone, DrAddress, DrSpecialty, DId) VALUES (?,?,?,?,?,?,?,?,?)";
		Integer deptId = (d.getDepartment() != null && d.getDepartment().getdId() > 0) ? d.getDepartment().getdId() : null;
		return executeUpdate(sql, d.getFirstName(), d.getMiddleName(), d.getLastName(), d.getBirthDate(), d.getSex(),
				d.getPhone(), d.getAddress(), d.getSpecialty(), deptId);
	}

	public boolean addPatient(Patient p) {
		String sql = "INSERT INTO PATIENT (PFirstName, PMiddleName, PLastName, PBirthDate, PSex, PPhone, PAddress, PInsurance) VALUES (?,?,?,?,?,?,?,?)";
		return executeUpdate(sql, p.getFirstName(), p.getMiddleName(), p.getLastName(), p.getBirthDate(), p.getSex(),
				p.getPhone(), p.getAddress(), p.getpInsurance());
	}

	// 2. đặt lịch hẹn và quản lý lịch hẹn
	// 2.1 đặt lịch hẹn
	public boolean bookAppointment(Appointment ap) throws DuplicateAppointmentException {
		// câu lệnh sql
		String checkSql = "SELECT COUNT(*) FROM APPOINTMENT "
				+ "WHERE DrId = ? AND APStatus NOT IN (N'Đã hủy', N'Hoàn thành') "
				+ "AND ABS(DATEDIFF(MINUTE, APDateTimes, ?)) < 30";

		String insertSql = "INSERT INTO APPOINTMENT (DrId, PId, CRId, APStatus, APReason, APDateTimes) "
				+ "VALUES (?, ?, ?, ?, ?, ?)";

		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement checkStmt = conn.prepareStatement(checkSql);
				PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {

			// 1. Thực hiện kiểm tra trùng lịch
			checkStmt.setInt(1, ap.getDoctor().getId());
			checkStmt.setTimestamp(2, ap.getApDateTimes());

			try (ResultSet rs = checkStmt.executeQuery()) {
				if (rs.next() && rs.getInt(1) > 0) {
					throw new DuplicateAppointmentException(
							"Bác sĩ đã có lịch hẹn vào thời điểm này (chênh lệch dưới 30 phút)!");
				}
			}

			// 2. Nếu thỏa mãn được các điều kiện ở trên, tiến hành Insert vào trên cùng 1
			// Connection
			insertStmt.setInt(1, ap.getDoctor().getId());
			insertStmt.setInt(2, ap.getPatient().getId());
			insertStmt.setInt(3, ap.getClinicRoom().getCrId());
			insertStmt.setString(4, "Chờ xác nhận");
			insertStmt.setString(5, ap.getApReason());
			insertStmt.setTimestamp(6, ap.getApDateTimes());

			int rows = insertStmt.executeUpdate();
			if (rows > 0)
				System.out.println("✅ THÔNG BÁO: Lịch hẹn đã được hệ thống xác nhận!");
			return rows > 0;

		} catch (SQLException e) {
			System.err.println("Lỗi thao tác Database: " + e.getMessage());
			throw new RuntimeException("Lỗi Database: " + e.getMessage(), e);
		}
	}

	// 2.2 Cập nhật lịch hẹn
	public boolean updateAppointmentStatus(int apId, String status) {
		String sql = "UPDATE APPOINTMENT SET APStatus = ?, APUpdateAt = GETDATE() WHERE APId = ?";
		return executeUpdate(sql, status, apId);
	}

	// 2.3 Lấy trạng thái lịch hẹn
	public String getAppointmentStatus(int apId) {
		String sql = "SELECT APStatus FROM APPOINTMENT WHERE APId = ?";
		try (Connection conn = DatabaseConnection.getConnection();
			 PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, apId);
			ResultSet rs = ps.executeQuery();
			return rs.next() ? rs.getString("APStatus") : null;
		} catch (SQLException e) {
			throw new RuntimeException("Lỗi truy vấn trạng thái lịch hẹn: " + e.getMessage(), e);
		}
	}

	public boolean rescheduleAppointment(int apId, java.sql.Timestamp newDateTime) {
		String sql = "UPDATE APPOINTMENT SET APDateTimes = ?, APStatus = N'Chờ xác nhận', APUpdateAt = GETDATE() WHERE APId = ?";
		return executeUpdate(sql, newDateTime, apId);
	}

	// 3. Tạo hồ sơ bệnh án, kê đơn thuốc VÀ tự động tạo hóa đơn (Transaction 5 bảng)
	public MedicalProcessResult createMedicalRecordAndPrescription(MedicalRecord mr, Prescription pr,
			List<PrescriptionDetail> details) {
		Connection conn = null;
		try {
			conn = DatabaseConnection.getConnection();
			// Bật chế độ Transaction
			conn.setAutoCommit(false);

			// Bảng 1: Tạo hồ sơ bệnh án (MEDICAL_RECORD)
			String sqlMR = "INSERT INTO MEDICAL_RECORD (DrId, PId, APId, MRDiagnosis, MRMethod, MRTestResult) VALUES (?, ?, ?, ?, ?, ?)";
			PreparedStatement psMR = conn.prepareStatement(sqlMR, Statement.RETURN_GENERATED_KEYS);
			psMR.setInt(1, mr.getDoctor().getId());
			psMR.setInt(2, mr.getPatient().getId());
			psMR.setInt(3, mr.getAppointmentId());
			psMR.setString(4, mr.getDiagnosis());
			psMR.setString(5, mr.getMethod());
			psMR.setString(6, mr.getTestResult());
			psMR.executeUpdate();
			ResultSet rsMR = psMR.getGeneratedKeys();
			int mrId = rsMR.next() ? rsMR.getInt(1) : -1;

			// Bảng 2: Tạo đơn thuốc (PRESCRIPTION)
			String sqlPR = "INSERT INTO PRESCRIPTION (MRId, PRDoctorNote) VALUES (?, ?)";
			PreparedStatement psPR = conn.prepareStatement(sqlPR, Statement.RETURN_GENERATED_KEYS);
			psPR.setInt(1, mrId);
			psPR.setString(2, pr.getDoctorNote());
			psPR.executeUpdate();
			ResultSet rsPR = psPR.getGeneratedKeys();
			int prId = rsPR.next() ? rsPR.getInt(1) : -1;

			// Bảng 3: Thêm chi tiết các loại thuốc vào đơn (PRESCRIPTION_DETAIL)
			String sqlDet = "INSERT INTO PRESCRIPTION_DETAIL (PRId, CMId, PDUnitPrice, PDQuantity, PDDuration, PDGuide) VALUES (?, ?, ?, ?, ?, ?)";
			PreparedStatement psDet = conn.prepareStatement(sqlDet);
			double totalPrice = 0;
			for (PrescriptionDetail det : details) {
				psDet.setInt(1, prId);
				psDet.setInt(2, det.getMedicine().getCmId());
				psDet.setDouble(3, det.getUnitPrice());
				psDet.setInt(4, det.getQuantity());
				psDet.setInt(5, det.getDuration());
				psDet.setString(6, det.getGuide());
				psDet.addBatch();
				totalPrice += det.getUnitPrice() * det.getQuantity();
			}
			psDet.executeBatch();

			// Bảng 4: Tự động tạo hóa đơn (INVOICE)
			String sqlInv = "INSERT INTO INVOICE (APId, PRId, INTotalPrice, INPaymentMethod, INStatus) VALUES (?, ?, ?, NULL, N'Chưa thanh toán')";
			PreparedStatement psInv = conn.prepareStatement(sqlInv, Statement.RETURN_GENERATED_KEYS);
			psInv.setInt(1, mr.getAppointmentId());
			psInv.setInt(2, prId);
			psInv.setDouble(3, totalPrice);
			psInv.executeUpdate();
			ResultSet rsInv = psInv.getGeneratedKeys();
			int invoiceId = rsInv.next() ? rsInv.getInt(1) : -1;

			// Bảng 5: Tạo chi tiết hóa đơn (INVOICE_DETAIL)
			String sqlInvDet = "INSERT INTO INVOICE_DETAIL (INId, INDMedicinePrice, INDPatientPaid, INDInsurancePaid) VALUES (?, ?, 0, 0)";
			PreparedStatement psInvDet = conn.prepareStatement(sqlInvDet);
			psInvDet.setInt(1, invoiceId);
			psInvDet.setDouble(2, totalPrice);
			psInvDet.executeUpdate();

			// Đổi trạng thái lịch hẹn thành 'Hoàn thành'
			String updateApSql = "UPDATE APPOINTMENT SET APStatus = N'Hoàn thành', APUpdateAt = GETDATE() WHERE APId = ?";
			PreparedStatement psUpdateAp = conn.prepareStatement(updateApSql);
			psUpdateAp.setInt(1, mr.getAppointmentId());
			psUpdateAp.executeUpdate();

			conn.commit(); // Tất cả đều ổn -> Lưu xuống Database
			return new MedicalProcessResult(mrId, prId, invoiceId, totalPrice);

		} catch (SQLException e) {
			System.err.println("Transaction thất bại, đang Rollback... Lỗi: " + e.getMessage());
			e.printStackTrace();
			if (conn != null) {
				try {
					conn.rollback();
				} catch (SQLException ex) {
					ex.printStackTrace();
				}
			}
			throw new RuntimeException("SQL Error: " + e.getMessage(), e);
		} finally {
			if (conn != null) {
				try {
					conn.setAutoCommit(true);
					conn.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
	}

	// 4. Thống kê và sắp xếp bác sĩ (heap sort)
	// tạo ra lớp DoctorStats để chứa dữ liệu thống kê trả về cho frontend
	public static class DoctorStats {
		public int doctorId;
		public String fullName;
		public int totalAppointments;

		public DoctorStats(int doctorId, String fullName, int totalAppointments) {
			this.doctorId = doctorId;
			this.fullName = fullName;
			this.totalAppointments = totalAppointments;
		}
	}

	// lấy dữ liệu bác sĩ từ database
	public List<DoctorStats> getTopDoctors() {
		List<DoctorStats> list = new ArrayList<>();
		String sql = "SELECT d.DrId, d.DrLastName + ' ' + ISNULL(d.DrMiddleName + ' ', '') + d.DrFirstName AS FullName, "
				+ "COUNT(a.APId) AS TotalAppointments " + "FROM DOCTOR d "
				+ "LEFT JOIN APPOINTMENT a ON d.DrId = a.DrId "
				+ "GROUP BY d.DrId, d.DrLastName, d.DrMiddleName, d.DrFirstName";

		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {

			while (rs.next()) {
				list.add(new DoctorStats(rs.getInt("DrId"), rs.getString("FullName"), rs.getInt("TotalAppointments")));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy dữ liệu thống kê: " + e.getMessage());
		}

		// Gọi thuật toán sắp xếp trước khi trả về
		heapSort(list);
		return list;
	}

	// 5. đặt lịch làm việc bác sĩ (tự lấy WSMaxPatientSlot từ CRCapacity)
	public boolean setWorkScheduleAuto(int drId, int crId, java.sql.Date wsDay, java.sql.Time wsStartTime, java.sql.Time wsEndTime) {
		String sql = "INSERT INTO WORK_SCHEDULE (DrId, CRId, WSDay, WSStartime, WSEndtime, WSMaxPatientSlot) "
				+ "SELECT ?, ?, ?, ?, ?, CRCapacity FROM CLINIC_ROOM WHERE CRId = ?";
		return executeUpdate(sql, drId, crId, wsDay, wsStartTime, wsEndTime, crId);
	}

	// 5b. Xóa lịch làm việc
	public boolean deleteWorkSchedule(int wsId) {
		String sql = "DELETE FROM WORK_SCHEDULE WHERE WSId = ?";
		return executeUpdate(sql, wsId);
	}

	private void heapSort(List<DoctorStats> list) {
		int n = list.size();
		for (int i = n / 2 - 1; i >= 0; i--)
			heapify(list, n, i);
		for (int i = n - 1; i > 0; i--) {
			DoctorStats temp = list.get(0);
			list.set(0, list.get(i));
			list.set(i, temp);
			heapify(list, i, 0);
		}
	}

	// 6. Xuất hóa đơn tự động
	public boolean generateInvoice(int apId, int prId, String paymentMethod) {
		// Tính tổng tiền từ chi tiết đơn thuốc
		double total = calculateTotalMedicinePrice(prId);
		String sql = "INSERT INTO INVOICE (APId, PRId, INTotalPrice, INPaymentMethod, INStatus) VALUES (?,?,?,?,N'Chưa thanh toán')";
		return executeUpdate(sql, apId, prId, total, paymentMethod);
	}

	private double calculateTotalMedicinePrice(int prId) {
		double totalPrice = 0.0;

		// Câu lệnh SQL: Lấy Đơn giá (PDUnitPrice) x Số lượng (PDQuantity)
		String sql = "SELECT SUM(PDUnitPrice * PDQuantity) AS TotalPrice " + "FROM PRESCRIPTION_DETAIL "
				+ "WHERE PRId = ?";

		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setInt(1, prId);

			try (ResultSet rs = pstmt.executeQuery()) {
				// Nếu truy vấn thành công và có dữ liệu
				if (rs.next()) {
					totalPrice = rs.getDouble("TotalPrice");
				}
			}

		} catch (SQLException e) {
			System.err.println("Lỗi tính tổng tiền thuốc: " + e.getMessage());
		}

		return totalPrice;
	}

	// 7. Hiển thị danh sách lịch hẹn theo bác sĩ
	public static class AppointmentInfo {
		public int appointmentId;
		public int patientId;
		public int doctorId;
		public String patientName;
		public String doctorName;
		public String clinicRoomName;
		public String createdAt;
		public String dateTime;
		public String reason;
		public String status;

		public AppointmentInfo(int appointmentId, int patientId, int doctorId, String patientName, String doctorName, String clinicRoomName,
				String dateTime, String reason, String status, String createdAt) {
			this.appointmentId = appointmentId;
			this.patientId = patientId;
			this.doctorId = doctorId;
			this.patientName = patientName;
			this.doctorName = doctorName;
			this.clinicRoomName = clinicRoomName;
			this.dateTime = dateTime;
			this.reason = reason;
			this.status = status;
			this.createdAt = createdAt;
		}
	}

	// Kết quả trả về từ transaction tạo hồ sơ bệnh án
	public static class MedicalProcessResult {
		public int mrId;
		public int prId;
		public int invoiceId;
		public double totalPrice;

		public MedicalProcessResult(int mrId, int prId, int invoiceId, double totalPrice) {
			this.mrId = mrId;
			this.prId = prId;
			this.invoiceId = invoiceId;
			this.totalPrice = totalPrice;
		}
	}

	// 8. Lấy chi tiết đơn thuốc (kèm tên thuốc)
	public List<PrescriptionDetail> getPrescriptionDetails(int prId) {
		List<PrescriptionDetail> list = new ArrayList<>();
		// Dùng JOIN để lấy luôn tên thuốc từ bảng CATEGORY_MEDICINE
		String sql = "SELECT pd.PDId, pd.CMId, pd.PDUnitPrice, pd.PDQuantity, pd.PDDuration, pd.PDGuide, cm.CMName "
				+ "FROM PRESCRIPTION_DETAIL pd " + "JOIN CATEGORY_MEDICINE cm ON pd.CMId = cm.CMId "
				+ "WHERE pd.PRId = ?";

		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setInt(1, prId);
			try (ResultSet rs = pstmt.executeQuery()) {
				while (rs.next()) {
					// Tạo đối tượng CategoryMedicine tạm (chỉ cần ID và Tên để map ra giao diện)
					CategoryMedicine medicine = new CategoryMedicine(rs.getInt("CMId"), rs.getString("CMName"), 0, 0.0,
							null);

					// Gom vào PrescriptionDetail (để null đối tượng Prescription cha để tránh lỗi
					// lặp vòng JSON)
					PrescriptionDetail detail = new PrescriptionDetail(rs.getInt("PDId"), null, medicine,
							rs.getDouble("PDUnitPrice"), rs.getInt("PDQuantity"), rs.getInt("PDDuration"),
							rs.getString("PDGuide"));

					list.add(detail);
				}
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy chi tiết đơn thuốc: " + e.getMessage());
		}
		return list;
	}

	public List<AppointmentInfo> getAppointmentsByDoctor(int doctorId) {
		List<AppointmentInfo> list = new ArrayList<>();
		String sql = "SELECT a.APId, a.PId, a.DrId, p.PLastName + ' ' + ISNULL(p.PMiddleName + ' ', '') + p.PFirstName AS PatientName, "
				+ "d.DrLastName + ' ' + ISNULL(d.DrMiddleName + ' ', '') + d.DrFirstName AS DoctorName, "
				+ "c.CRName, a.APDateTimes, a.APReason, a.APStatus " + "FROM APPOINTMENT a "
				+ "JOIN PATIENT p ON a.PId = p.PId "
				+ "JOIN DOCTOR d ON a.DrId = d.DrId "
				+ "JOIN CLINIC_ROOM c ON a.CRId = c.CRId " + "WHERE a.DrId = ? "
				+ "ORDER BY a.APDateTimes ASC"; // Sắp xếp giờ từ sớm đến muộn

		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setInt(1, doctorId);
			try (ResultSet rs = pstmt.executeQuery()) {
				while (rs.next()) {
					list.add(new AppointmentInfo(
						rs.getInt("APId"),
						rs.getInt("PId"),
						rs.getInt("DrId"),
						rs.getString("PatientName"),
						rs.getString("DoctorName"),
						rs.getString("CRName"),
						rs.getTimestamp("APDateTimes").toString(),
						rs.getString("APReason"),
						rs.getString("APStatus"),
						rs.getTimestamp("APDateTimes").toString()
					));
				}
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách lịch hẹn: " + e.getMessage());
		}
		return list;
	}

	private void heapify(List<DoctorStats> list, int n, int i) {
		int smallest = i; // Tìm min để sắp xếp giảm dần
		int left = 2 * i + 1;
		int right = 2 * i + 2;

		if (left < n && list.get(left).totalAppointments < list.get(smallest).totalAppointments)
			smallest = left;
		if (right < n && list.get(right).totalAppointments < list.get(smallest).totalAppointments)
			smallest = right;

		if (smallest != i) {
			DoctorStats swap = list.get(i);
			list.set(i, list.get(smallest));
			list.set(smallest, swap);
			heapify(list, n, smallest);
		}
	}

	// Hàm dùng chung cho các lệnh INSERT, UPDATE, DELETE
	private boolean executeUpdate(String sql, Object... params) {
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			// Tự động map các tham số (?) vào câu lệnh SQL
			for (int i = 0; i < params.length; i++) {
				pstmt.setObject(i + 1, params[i]);
			}
			return pstmt.executeUpdate() > 0;

		} catch (SQLException e) {
			System.err.println("Lỗi thực thi SQL: " + e.getMessage());
			return false;
		}
	}

	// ===== LISTING APIs =====

	// Lấy danh sách tất cả bác sĩ
	public static class DoctorInfo {
		public int doctorId;
		public String firstName;
		public String middleName;
		public String lastName;
		public String fullName;
		public String sex;
		public String phone;
		public String address;
		public String specialty;
		public String departmentName;
		public String birthday;

		public DoctorInfo(int doctorId, String firstName, String middleName, String lastName, String sex, String phone,
				String address, String specialty, String departmentName, String birthday) {
			this.doctorId = doctorId;
			this.firstName = firstName;
			this.middleName = middleName;
			this.lastName = lastName;
			this.fullName = lastName + " " + (middleName != null && !middleName.isEmpty() ? middleName + " " : "") + firstName;
			this.sex = sex;
			this.phone = phone;
			this.address = address;
			this.specialty = specialty;
			this.departmentName = departmentName;
			this.birthday = birthday;
		}
	}

	public List<DoctorInfo> getAllDoctors() {
		List<DoctorInfo> list = new ArrayList<>();
		String sql = "SELECT d.DrId, d.DrFirstName, d.DrMiddleName, d.DrLastName, d.DrSex, d.DrPhone, d.DrAddress, "
				+ "d.DrSpecialty, dep.DName, d.DrBirthday "
				+ "FROM DOCTOR d LEFT JOIN DEPARTMENT dep ON d.DId = dep.DId ORDER BY d.DrId";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new DoctorInfo(
					rs.getInt("DrId"), rs.getString("DrFirstName"), rs.getString("DrMiddleName"),
					rs.getString("DrLastName"), rs.getString("DrSex"), rs.getString("DrPhone"),
					rs.getString("DrAddress"), rs.getString("DrSpecialty"), rs.getString("DName"),
					rs.getDate("DrBirthday") != null ? rs.getDate("DrBirthday").toString() : null
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách bác sĩ: " + e.getMessage());
		}
		return list;
	}

	// Lấy danh sách tất cả bệnh nhân
	public static class PatientInfo {
		public int patientId;
		public String firstName;
		public String middleName;
		public String lastName;
		public String fullName;
		public String sex;
		public String phone;
		public String address;
		public String insurance;
		public String birthday;

		public PatientInfo(int patientId, String firstName, String middleName, String lastName, String sex,
				String phone, String address, String insurance, String birthday) {
			this.patientId = patientId;
			this.firstName = firstName;
			this.middleName = middleName;
			this.lastName = lastName;
			this.fullName = lastName + " " + (middleName != null && !middleName.isEmpty() ? middleName + " " : "") + firstName;
			this.sex = sex;
			this.phone = phone;
			this.address = address;
			this.insurance = insurance;
			this.birthday = birthday;
		}
	}

	public List<PatientInfo> getAllPatients() {
		List<PatientInfo> list = new ArrayList<>();
		String sql = "SELECT PId, PFirstName, PMiddleName, PLastName, PSex, PPhone, PAddress, PInsurance, PBirthDate FROM PATIENT ORDER BY PId";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new PatientInfo(
					rs.getInt("PId"), rs.getString("PFirstName"), rs.getString("PMiddleName"),
					rs.getString("PLastName"), rs.getString("PSex"), rs.getString("PPhone"),
					rs.getString("PAddress"), rs.getString("PInsurance"),
					rs.getDate("PBirthDate") != null ? rs.getDate("PBirthDate").toString() : null
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách bệnh nhân: " + e.getMessage());
		}
		return list;
	}

	// Lấy tất cả lịch hẹn
	public List<AppointmentInfo> getAllAppointments() {
		List<AppointmentInfo> list = new ArrayList<>();
		String sql = "SELECT a.APId, a.PId, a.DrId, "
				+ "p.PLastName + ' ' + ISNULL(p.PMiddleName + ' ', '') + p.PFirstName AS PatientName, "
				+ "d.DrLastName + ' ' + ISNULL(d.DrMiddleName + ' ', '') + d.DrFirstName AS DoctorName, "
				+ "c.CRName, a.APDateTimes, a.APReason, a.APStatus "
				+ "FROM APPOINTMENT a "
				+ "JOIN PATIENT p ON a.PId = p.PId "
				+ "JOIN DOCTOR d ON a.DrId = d.DrId "
				+ "JOIN CLINIC_ROOM c ON a.CRId = c.CRId "
				+ "ORDER BY a.APDateTimes DESC";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new AppointmentInfo(
					rs.getInt("APId"),
					rs.getInt("PId"),
					rs.getInt("DrId"),
					rs.getString("PatientName"),
					rs.getString("DoctorName"),
					rs.getString("CRName"),
					rs.getTimestamp("APDateTimes").toString(),
					rs.getString("APReason"),
					rs.getString("APStatus"),
					rs.getTimestamp("APDateTimes").toString()
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy tất cả lịch hẹn: " + e.getMessage());
		}
		return list;
	}

	// Lấy danh sách hóa đơn
	public static class InvoiceInfo {
		public int invoiceId;
		public int appointmentId;
		public Integer prescriptionId;
		public String patientName;
		public String doctorName;
		public double totalPrice;
		public String paymentMethod;
		public String status;
		public String paidDate;

		public InvoiceInfo(int invoiceId, int appointmentId, Integer prescriptionId, String patientName,
				String doctorName, double totalPrice, String paymentMethod, String status, String paidDate) {
			this.invoiceId = invoiceId;
			this.appointmentId = appointmentId;
			this.prescriptionId = prescriptionId;
			this.patientName = patientName;
			this.doctorName = doctorName;
			this.totalPrice = totalPrice;
			this.paymentMethod = paymentMethod;
			this.status = status;
			this.paidDate = paidDate;
		}
	}

	public List<InvoiceInfo> getAllInvoices() {
		List<InvoiceInfo> list = new ArrayList<>();
		String sql = "SELECT i.INId, i.APId, i.PRId, "
				+ "p.PLastName + ' ' + ISNULL(p.PMiddleName + ' ', '') + p.PFirstName AS PatientName, "
				+ "d.DrLastName + ' ' + ISNULL(d.DrMiddleName + ' ', '') + d.DrFirstName AS DoctorName, "
				+ "i.INTotalPrice, i.INPaymentMethod, i.INStatus, i.INPaidDate "
				+ "FROM INVOICE i "
				+ "JOIN APPOINTMENT a ON i.APId = a.APId "
				+ "JOIN DOCTOR d ON a.DrId = d.DrId "
				+ "JOIN PATIENT p ON a.PId = p.PId "
				+ "ORDER BY i.INId DESC";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new InvoiceInfo(
					rs.getInt("INId"), rs.getInt("APId"), (Integer) rs.getObject("PRId"), rs.getString("PatientName"),
					rs.getString("DoctorName"),
					rs.getDouble("INTotalPrice"), rs.getString("INPaymentMethod"),
					rs.getString("INStatus"),
					rs.getTimestamp("INPaidDate") != null ? rs.getTimestamp("INPaidDate").toString() : null
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách hóa đơn: " + e.getMessage());
		}
		return list;
	}

	// Chi tiết hóa đơn đầy đủ (dùng cho trang Billing)
	public static class InvoiceDetailInfo {
		public int invoiceId;
		public int appointmentId;
		public Integer prescriptionId;
		public String patientName;
		public String patientPhone;
		public String patientInsurance;
		public String doctorName;
		public String doctorSpecialty;
		public String diagnosis;
		public String doctorNote;
		public double totalPrice;
		public String paymentMethod;
		public String status;
		public String paidDate;
		public String createdAt;
		public List<InvoiceMedicineItem> medicines;

		public InvoiceDetailInfo() {
			this.medicines = new java.util.ArrayList<>();
		}
	}

	public static class InvoiceMedicineItem {
		public String medicineName;
		public double unitPrice;
		public int quantity;
		public int duration;
		public String guide;
		public double subtotal;

		public InvoiceMedicineItem(String medicineName, double unitPrice, int quantity, int duration, String guide) {
			this.medicineName = medicineName;
			this.unitPrice = unitPrice;
			this.quantity = quantity;
			this.duration = duration;
			this.guide = guide;
			this.subtotal = unitPrice * quantity;
		}
	}

	public InvoiceDetailInfo getInvoiceDetail(int invoiceId) {
		InvoiceDetailInfo info = null;
		String sql = "SELECT i.INId, i.APId, i.PRId, i.INTotalPrice, i.INPaymentMethod, i.INStatus, i.INPaidDate, "
				+ "p.PLastName + ' ' + ISNULL(p.PMiddleName + ' ', '') + p.PFirstName AS PatientName, "
				+ "p.PPhone, p.PInsurance, "
				+ "d.DrLastName + ' ' + ISNULL(d.DrMiddleName + ' ', '') + d.DrFirstName AS DoctorName, "
				+ "d.DrSpecialty, "
				+ "mr.MRDiagnosis, pr.PRDoctorNote, pr.PRCreatedAt "
				+ "FROM INVOICE i "
				+ "JOIN APPOINTMENT a ON i.APId = a.APId "
				+ "JOIN PATIENT p ON a.PId = p.PId "
				+ "JOIN DOCTOR d ON a.DrId = d.DrId "
				+ "LEFT JOIN PRESCRIPTION pr ON i.PRId = pr.PRId "
				+ "LEFT JOIN MEDICAL_RECORD mr ON pr.MRId = mr.MRId "
				+ "WHERE i.INId = ?";

		try (Connection conn = DatabaseConnection.getConnection();
			 PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, invoiceId);
			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					info = new InvoiceDetailInfo();
					info.invoiceId = rs.getInt("INId");
					info.appointmentId = rs.getInt("APId");
					info.prescriptionId = (Integer) rs.getObject("PRId");
					info.totalPrice = rs.getDouble("INTotalPrice");
					info.paymentMethod = rs.getString("INPaymentMethod");
					info.status = rs.getString("INStatus");
					info.paidDate = rs.getTimestamp("INPaidDate") != null ? rs.getTimestamp("INPaidDate").toString() : null;
					info.patientName = rs.getString("PatientName");
					info.patientPhone = rs.getString("PPhone");
					info.patientInsurance = rs.getString("PInsurance");
					info.doctorName = rs.getString("DoctorName");
					info.doctorSpecialty = rs.getString("DrSpecialty");
					info.diagnosis = rs.getString("MRDiagnosis");
					info.doctorNote = rs.getString("PRDoctorNote");
					info.createdAt = rs.getTimestamp("PRCreatedAt") != null ? rs.getTimestamp("PRCreatedAt").toString() : null;
				}
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy chi tiết hóa đơn: " + e.getMessage());
			return null;
		}

		// Lấy danh sách thuốc trong đơn
		if (info != null && info.prescriptionId != null) {
			String medSql = "SELECT cm.CMName, pd.PDUnitPrice, pd.PDQuantity, pd.PDDuration, pd.PDGuide "
					+ "FROM PRESCRIPTION_DETAIL pd "
					+ "JOIN CATEGORY_MEDICINE cm ON pd.CMId = cm.CMId "
					+ "WHERE pd.PRId = ?";
			try (Connection conn = DatabaseConnection.getConnection();
				 PreparedStatement ps = conn.prepareStatement(medSql)) {
				ps.setInt(1, info.prescriptionId);
				try (ResultSet rs = ps.executeQuery()) {
					while (rs.next()) {
						info.medicines.add(new InvoiceMedicineItem(
							rs.getString("CMName"),
							rs.getDouble("PDUnitPrice"),
							rs.getInt("PDQuantity"),
							rs.getInt("PDDuration"),
							rs.getString("PDGuide")
						));
					}
				}
			} catch (SQLException e) {
				System.err.println("Lỗi lấy thuốc trong hóa đơn: " + e.getMessage());
			}
		}

		return info;
	}

	// Thanh toán hóa đơn
	public boolean payInvoice(int invoiceId, String paymentMethod) {
		String sql = "UPDATE INVOICE SET INStatus = N'Đã thanh toán', INPaymentMethod = ?, INPaidDate = GETDATE() WHERE INId = ? AND INStatus = N'Chưa thanh toán'";
		return executeUpdate(sql, paymentMethod, invoiceId);
	}

	// Thống kê cho Dashboard
	public static class DashboardStats {
		public int totalPatients;
		public int totalDoctors;
		public int totalAppointments;
		public int todayAppointments;
		public double totalRevenue;
		public double pendingAmount;

		public DashboardStats(int totalPatients, int totalDoctors, int totalAppointments, double totalRevenue, double pendingAmount) {
			this.totalPatients = totalPatients;
			this.totalDoctors = totalDoctors;
			this.totalAppointments = totalAppointments;
			this.todayAppointments = totalAppointments;
			this.totalRevenue = totalRevenue;
			this.pendingAmount = pendingAmount;
		}
	}

	public DashboardStats getDashboardStats() {
		int totalPatients = 0, totalDoctors = 0, todayAppointments = 0;
		double totalRevenue = 0, pendingAmount = 0;

		try (Connection conn = DatabaseConnection.getConnection()) {
			// Tổng bệnh nhân
			try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM PATIENT");
				 ResultSet rs = ps.executeQuery()) {
				if (rs.next()) totalPatients = rs.getInt(1);
			}
			// Tổng bác sĩ
			try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM DOCTOR");
				 ResultSet rs = ps.executeQuery()) {
				if (rs.next()) totalDoctors = rs.getInt(1);
			}
			// Lịch hẹn hôm nay
			try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM APPOINTMENT WHERE CAST(APDateTimes AS DATE) = CAST(GETDATE() AS DATE)");
				 ResultSet rs = ps.executeQuery()) {
				if (rs.next()) todayAppointments = rs.getInt(1);
			}
			// Tổng doanh thu (đã thanh toán)
			try (PreparedStatement ps = conn.prepareStatement("SELECT ISNULL(SUM(INTotalPrice), 0) FROM INVOICE WHERE INStatus = N'Đã thanh toán'");
				 ResultSet rs = ps.executeQuery()) {
				if (rs.next()) totalRevenue = rs.getDouble(1);
			}
			// Chưa thanh toán
			try (PreparedStatement ps = conn.prepareStatement("SELECT ISNULL(SUM(INTotalPrice), 0) FROM INVOICE WHERE INStatus = N'Chưa thanh toán'");
				 ResultSet rs = ps.executeQuery()) {
				if (rs.next()) pendingAmount = rs.getDouble(1);
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy thống kê dashboard: " + e.getMessage());
		}

		return new DashboardStats(totalPatients, totalDoctors, todayAppointments, totalRevenue, pendingAmount);
	}

	// DTO cho lượt khám theo ngày trong tuần
	public static class DailyVisitCount {
		public String day;
		public int patients;

		public DailyVisitCount(String day, int patients) {
			this.day = day;
			this.patients = patients;
		}
	}

	// Lấy lượt khám theo từng ngày trong tuần hiện tại hoặc tuần trước
	public List<DailyVisitCount> getWeeklyVisits(String week) {
		List<DailyVisitCount> result = new ArrayList<>();
		String sql = "DECLARE @startOfWeek DATE; "
				+ "SET DATEFIRST 1; "
				+ "IF ? = 'current' "
				+ "  SET @startOfWeek = DATEADD(DAY, 1 - DATEPART(WEEKDAY, GETDATE()), CAST(GETDATE() AS DATE)); "
				+ "ELSE "
				+ "  SET @startOfWeek = DATEADD(DAY, 1 - DATEPART(WEEKDAY, GETDATE()) - 7, CAST(GETDATE() AS DATE)); "
				+ "SELECT d.dayName, ISNULL(a.cnt, 0) AS patients "
				+ "FROM (VALUES (0, N'T2'), (1, N'T3'), (2, N'T4'), (3, N'T5'), (4, N'T6'), (5, N'T7'), (6, N'CN')) "
				+ "  AS d(dayOffset, dayName) "
				+ "LEFT JOIN ( "
				+ "  SELECT DATEDIFF(DAY, @startOfWeek, CAST(APDateTimes AS DATE)) AS dayOffset, COUNT(*) AS cnt "
				+ "  FROM APPOINTMENT "
				+ "  WHERE CAST(APDateTimes AS DATE) BETWEEN @startOfWeek AND DATEADD(DAY, 6, @startOfWeek) "
				+ "    AND APStatus != N'Đã hủy' "
				+ "  GROUP BY DATEDIFF(DAY, @startOfWeek, CAST(APDateTimes AS DATE)) "
				+ ") a ON d.dayOffset = a.dayOffset "
				+ "ORDER BY d.dayOffset";

		try (Connection conn = DatabaseConnection.getConnection();
			 PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setString(1, week);
			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					result.add(new DailyVisitCount(rs.getString("dayName"), rs.getInt("patients")));
				}
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy lượt khám tuần: " + e.getMessage());
		}

		// Fallback nếu query thất bại
		if (result.isEmpty()) {
			String[] days = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};
			for (String d : days) result.add(new DailyVisitCount(d, 0));
		}

		return result;
	}

	// Lấy danh sách phòng khám
	public static class ClinicRoomInfo {
		public int roomId;
		public String roomName;
		public String roomNumber;
		public int capacity;
		public String status;
		public String departmentName;

		public ClinicRoomInfo(int roomId, String roomName, String roomNumber, int capacity, String status, String departmentName) {
			this.roomId = roomId;
			this.roomName = roomName;
			this.roomNumber = roomNumber;
			this.capacity = capacity;
			this.status = status;
			this.departmentName = departmentName;
		}
	}

	public List<ClinicRoomInfo> getAllClinicRooms() {
		List<ClinicRoomInfo> list = new ArrayList<>();
		String sql = "SELECT cr.CRId, cr.CRName, cr.CRNumber, cr.CRCapacity, cr.CRStatus, dep.DName "
				+ "FROM CLINIC_ROOM cr LEFT JOIN DEPARTMENT dep ON cr.DId = dep.DId ORDER BY cr.CRId";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new ClinicRoomInfo(
					rs.getInt("CRId"), rs.getString("CRName"), rs.getString("CRNumber"),
					rs.getInt("CRCapacity"), rs.getString("CRStatus"), rs.getString("DName")
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách phòng khám: " + e.getMessage());
		}
		return list;
	}

	// Lấy danh sách khoa
	public List<Department> getAllDepartments() {
		List<Department> list = new ArrayList<>();
		String sql = "SELECT DId, DName, DStartDate FROM DEPARTMENT ORDER BY DId";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new Department(rs.getInt("DId"), rs.getString("DName"), rs.getDate("DStartDate")));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách khoa: " + e.getMessage());
		}
		return list;
	}

	// Lấy danh sách lịch làm việc
	public static class WorkScheduleInfo {
		public int wsId;
		public int drId;
		public String doctorName;
		public int crId;
		public String clinicRoomName;
		public String wsDay;
		public String wsStartTime;
		public String wsEndTime;
		public int wsMaxPatientSlot;

		public WorkScheduleInfo(int wsId, int drId, String doctorName, int crId, String clinicRoomName,
				String wsDay, String wsStartTime, String wsEndTime, int wsMaxPatientSlot) {
			this.wsId = wsId;
			this.drId = drId;
			this.doctorName = doctorName;
			this.crId = crId;
			this.clinicRoomName = clinicRoomName;
			this.wsDay = wsDay;
			this.wsStartTime = wsStartTime;
			this.wsEndTime = wsEndTime;
			this.wsMaxPatientSlot = wsMaxPatientSlot;
		}
	}

	public List<WorkScheduleInfo> getAllWorkSchedules() {
		List<WorkScheduleInfo> list = new ArrayList<>();
		String sql = "SELECT ws.WSId, ws.DrId, "
				+ "CONCAT(d.DrLastName, ' ', ISNULL(d.DrMiddleName + ' ', ''), d.DrFirstName) AS DoctorName, "
				+ "ws.CRId, cr.CRName, "
				+ "CONVERT(VARCHAR, ws.WSDay, 23) AS WSDay, "
				+ "CONVERT(VARCHAR, ws.WSStartime, 108) AS WSStartTime, "
				+ "CONVERT(VARCHAR, ws.WSEndtime, 108) AS WSEndTime, "
				+ "ws.WSMaxPatientSlot "
				+ "FROM WORK_SCHEDULE ws "
				+ "JOIN DOCTOR d ON ws.DrId = d.DrId "
				+ "JOIN CLINIC_ROOM cr ON ws.CRId = cr.CRId "
				+ "ORDER BY ws.WSDay DESC, ws.WSStartime";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new WorkScheduleInfo(
					rs.getInt("WSId"), rs.getInt("DrId"), rs.getString("DoctorName"),
					rs.getInt("CRId"), rs.getString("CRName"),
					rs.getString("WSDay"), rs.getString("WSStartTime"), rs.getString("WSEndTime"),
					rs.getInt("WSMaxPatientSlot")
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách lịch làm việc: " + e.getMessage());
		}
		return list;
	}

	// Lấy danh sách thuốc
	public static class MedicineInfo {
		public int medicineId;
		public String name;
		public int stockQuantity;
		public double price;
		public String note;

		public MedicineInfo(int medicineId, String name, int stockQuantity, double price, String note) {
			this.medicineId = medicineId;
			this.name = name;
			this.stockQuantity = stockQuantity;
			this.price = price;
			this.note = note;
		}
	}

	public List<MedicineInfo> getAllMedicines() {
		List<MedicineInfo> list = new ArrayList<>();
		String sql = "SELECT CMId, CMName, CMStockQuantity, CMPrice, CMNote FROM CATEGORY_MEDICINE ORDER BY CMId";
		try (Connection conn = DatabaseConnection.getConnection();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			while (rs.next()) {
				list.add(new MedicineInfo(
					rs.getInt("CMId"), rs.getString("CMName"), rs.getInt("CMStockQuantity"),
					rs.getDouble("CMPrice"), rs.getString("CMNote")
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy danh sách thuốc: " + e.getMessage());
		}
		return list;
	}

	// ===== Xếp hạng bác sĩ theo số lịch hẹn - Giải thuật Heap Sort =====

	// DTO chứa thông tin xếp hạng bác sĩ
	public static class DoctorAppointmentRanking {
		public int rank;
		public String doctorName;
		public int appointmentCount;

		public DoctorAppointmentRanking(int rank, String doctorName, int appointmentCount) {
			this.rank = rank;
			this.doctorName = doctorName;
			this.appointmentCount = appointmentCount;
		}
	}

	/**
	 * Đếm số lịch hẹn mỗi bác sĩ từ DB, sau đó dùng giải thuật Heap Sort
	 * để sắp xếp theo thứ tự giảm dần (bác sĩ nhiều lịch hẹn nhất đứng đầu).
	 */
	public List<DoctorAppointmentRanking> getDoctorRankingByHeapSort() {
		// Bước 1: Truy vấn đếm số lịch hẹn mỗi bác sĩ
		List<DoctorAppointmentRanking> list = new ArrayList<>();
		String sql = "SELECT CONCAT(d.DrLastName, ' ', ISNULL(d.DrMiddleName + ' ', ''), d.DrFirstName) AS DoctorName, "
				+ "COUNT(a.APId) AS AppointmentCount "
				+ "FROM DOCTOR d "
				+ "LEFT JOIN APPOINTMENT a ON d.DrId = a.DrId "
				+ "GROUP BY d.DrLastName, d.DrMiddleName, d.DrFirstName "
				+ "HAVING COUNT(a.APId) > 0";

		try (Connection conn = DatabaseConnection.getConnection();
			 PreparedStatement ps = conn.prepareStatement(sql);
			 ResultSet rs = ps.executeQuery()) {
			while (rs.next()) {
				// rank = 0 tạm thời, sẽ gán sau khi sắp xếp
				list.add(new DoctorAppointmentRanking(
					0, rs.getString("DoctorName"), rs.getInt("AppointmentCount")
				));
			}
		} catch (SQLException e) {
			System.err.println("Lỗi lấy xếp hạng bác sĩ: " + e.getMessage());
		}

		// Bước 2: Áp dụng giải thuật Heap Sort sắp xếp giảm dần theo appointmentCount
		HeapSort<DoctorAppointmentRanking> heapSort = new HeapSort<>(item -> item.appointmentCount);
		heapSort.sortDescending(list);

		// Bước 3: Gán thứ hạng sau khi đã sắp xếp
		for (int i = 0; i < list.size(); i++) {
			list.get(i).rank = i + 1;
		}

		return list;
	}

}
