package gr7.oop.HealthLink;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
	// 1. Cấu hình thông tin SQL Server
	private static final String SERVER_NAME = "localhost";
	private static final String PORT = "1433"; // Port mặc định của SQL Server
	private static final String DATABASE_NAME = "HEALTHLINK_DB"; // Tên database bạn đã tạo

	// username và password của database
	private static final String USERNAME = "sa";
	private static final String PASSWORD = "Pasword1234Ki";

	// thực hiện kết nối
	private static final String DB_URL = "jdbc:sqlserver://" + SERVER_NAME + ":" + PORT + ";databaseName="
			+ DATABASE_NAME + ";encrypt=true;trustServerCertificate=true;";

	// Đăng ký Driver 1 lần duy nhất khi class được load
	static {
		try {
			Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
		} catch (ClassNotFoundException e) {
			System.err.println("❌ Không tìm thấy thư viện JDBC. Hãy kiểm tra lại file pom.xml!");
			e.printStackTrace();
		}
	}

	// 2. Hàm lấy kết nối - tạo connection MỚI mỗi lần gọi
	// Mỗi request/thread sẽ có connection riêng, tránh race condition
	public static Connection getConnection() {
		try {
			Connection conn = DriverManager.getConnection(DB_URL, USERNAME, PASSWORD);
			return conn;
		} catch (SQLException e) {
			System.err.println("❌ Lỗi kết nối CSDL: " + e.getMessage());
			e.printStackTrace();
			return null;
		}
	}

//	3. test
//	public static void main(String[] args) {
//		Connection conn = DatabaseConnection.getConnection();
//		if (conn != null) {
//			System.out.println("Kết nối thành công");
//		}
//	}
}