USE HEALTHLINK_DB;
GO

-- =============================================
-- PART 1: DEPARTMENT, DOCTOR, PATIENT, CLINIC_ROOM
-- =============================================

-- 1. DEPARTMENT (20 khoa thực tế)
INSERT INTO DEPARTMENT (DName, DStartDate) VALUES
(N'Khoa Nội tổng quát',          '2015-01-10'),
(N'Khoa Nội tim mạch',           '2015-01-10'),
(N'Khoa Nội tiêu hóa',           '2015-02-01'),
(N'Khoa Nội thần kinh',          '2015-02-15'),
(N'Khoa Nội hô hấp',             '2015-03-01'),
(N'Khoa Nội tiết – Đái tháo đường','2015-03-20'),
(N'Khoa Ngoại tổng quát',        '2015-01-10'),
(N'Khoa Ngoại chấn thương chỉnh hình','2015-04-01'),
(N'Khoa Ngoại thần kinh',        '2015-04-15'),
(N'Khoa Sản phụ khoa',           '2015-01-10'),
(N'Khoa Nhi',                    '2015-01-10'),
(N'Khoa Hồi sức – Cấp cứu',     '2015-01-10'),
(N'Khoa Ung bướu',               '2015-05-01'),
(N'Khoa Da liễu',                '2015-06-01'),
(N'Khoa Mắt',                    '2015-06-15'),
(N'Khoa Tai mũi họng',           '2015-07-01'),
(N'Khoa Răng – Hàm – Mặt',      '2015-07-15'),
(N'Khoa Phục hồi chức năng',     '2016-01-10'),
(N'Khoa Truyền nhiễm',           '2015-08-01'),
(N'Khoa Y học cổ truyền',        '2016-03-01');
GO

-- 2. DOCTOR (100 bác sĩ, ~5 mỗi khoa)
INSERT INTO DOCTOR (DrFirstName, DrMiddleName, DrLastName, DrBirthday, DrSex, DrPhone, DrAddress, DrSpecialty, DId) VALUES
-- Khoa Nội tổng quát (DId=1)
(N'Minh',    N'Văn',      N'Nguyễn',  '1975-03-15', N'Nam', '0901000001', N'12 Lê Lợi, Q.1, TP.HCM',              N'Nội khoa tổng quát',           1),
(N'Lan',     N'Thị',      N'Trần',    '1980-07-22', N'Nữ',  '0901000002', N'34 Nguyễn Huệ, Q.1, TP.HCM',          N'Nội khoa tổng quát',           1),
(N'Hải',     N'Đức',      N'Lê',      '1978-05-10', N'Nam', '0901000003', N'56 Hai Bà Trưng, Q.3, TP.HCM',         N'Nội khoa tổng quát',           1),
(N'Tuyết',   N'Thị Kim',  N'Phạm',    '1983-09-18', N'Nữ',  '0901000004', N'78 Điện Biên Phủ, Q.3, TP.HCM',       N'Nội khoa tổng quát',           1),
(N'Cường',   N'Quốc',     N'Hoàng',   '1976-12-25', N'Nam', '0901000005', N'90 Pasteur, Q.3, TP.HCM',              N'Nội khoa tổng quát',           1),
-- Khoa Nội tim mạch (DId=2)
(N'Tuấn',    N'Anh',      N'Võ',      '1976-09-25', N'Nam', '0901000006', N'100 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM',  N'Tim mạch can thiệp',           2),
(N'Hằng',    N'Thị Thu',  N'Đặng',    '1982-04-14', N'Nữ',  '0901000007', N'102 Lý Tự Trọng, Q.1, TP.HCM',        N'Siêu âm tim',                  2),
(N'Phát',    N'Minh',     N'Bùi',     '1979-11-03', N'Nam', '0901000008', N'104 Trần Phú, Q.5, TP.HCM',            N'Rối loạn nhịp tim',            2),
(N'Diễm',    N'Thị Ngọc', N'Trương',  '1984-02-28', N'Nữ',  '0901000009', N'106 Nguyễn Trãi, Q.5, TP.HCM',        N'Tim mạch tổng quát',           2),
(N'Khải',    N'Văn',      N'Lý',      '1977-07-19', N'Nam', '0901000010', N'108 An Dương Vương, Q.5, TP.HCM',      N'Tim bẩm sinh',                 2),
-- Khoa Nội tiêu hóa (DId=3)
(N'Thảo',    N'Phương',   N'Ngô',     '1981-06-08', N'Nữ',  '0901000011', N'110 Hùng Vương, Q.5, TP.HCM',         N'Nội soi tiêu hóa',             3),
(N'Dũng',    N'Văn',      N'Đinh',    '1978-03-22', N'Nam', '0901000012', N'112 Lê Hồng Phong, Q.10, TP.HCM',     N'Bệnh gan mật',                 3),
(N'Uyên',    N'Thị Mỹ',   N'Dương',   '1985-10-15', N'Nữ',  '0901000013', N'114 Tô Hiến Thành, Q.10, TP.HCM',    N'Tiêu hóa tổng quát',           3),
(N'Bảo',     N'Quốc',     N'Vũ',      '1980-01-30', N'Nam', '0901000014', N'116 Sư Vạn Hạnh, Q.10, TP.HCM',      N'Viêm loét đại tràng',          3),
(N'Nhi',     N'Thị',      N'Tạ',      '1983-08-12', N'Nữ',  '0901000015', N'118 Cao Thắng, Q.3, TP.HCM',          N'Tiêu hóa tổng quát',           3),
-- Khoa Nội thần kinh (DId=4)
(N'Hùng',    N'Đức',      N'Phan',    '1974-04-05', N'Nam', '0901000016', N'120 Đinh Tiên Hoàng, Q.Bình Thạnh',   N'Thần kinh mạch máu não',       4),
(N'Liên',    N'Thị',      N'Mai',     '1982-12-20', N'Nữ',  '0901000017', N'122 Nơ Trang Long, Q.Bình Thạnh',     N'Động kinh – Giấc ngủ',         4),
(N'Sơn',     N'Văn',      N'Cao',     '1977-09-14', N'Nam', '0901000018', N'124 Bạch Đằng, Q.Bình Thạnh',         N'Thần kinh ngoại biên',         4),
(N'Nga',     N'Thị Kim',  N'Lâm',     '1984-06-07', N'Nữ',  '0901000019', N'126 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh',N'Đau đầu – Migraine',           4),
(N'Tài',     N'Minh',     N'Trịnh',   '1979-02-18', N'Nam', '0901000020', N'128 Phan Đăng Lưu, Q.Phú Nhuận',     N'Thần kinh tổng quát',          4),
-- Khoa Nội hô hấp (DId=5)
(N'Hoa',     N'Thị',      N'Hồ',      '1981-07-30', N'Nữ',  '0901000021', N'130 Hoàng Văn Thụ, Q.Tân Bình',      N'Bệnh phổi mãn tính',           5),
(N'Kiên',    N'Văn',      N'Tống',    '1976-05-16', N'Nam', '0901000022', N'132 Cộng Hòa, Q.Tân Bình',            N'Hen phế quản',                 5),
(N'Thúy',    N'Thị Bích', N'Lưu',     '1983-03-09', N'Nữ',  '0901000023', N'134 Trường Chinh, Q.Tân Bình',        N'Lao phổi',                     5),
(N'Quân',    N'Đức',      N'Đỗ',      '1978-11-25', N'Nam', '0901000024', N'136 Lý Thường Kiệt, Q.Tân Bình',     N'Hô hấp tổng quát',             5),
(N'Yến',     N'Thị',      N'Từ',      '1985-08-04', N'Nữ',  '0901000025', N'138 Nguyễn Thái Bình, Q.Tân Bình',   N'Hô hấp tổng quát',             5),
-- Khoa Nội tiết (DId=6)
(N'Long',    N'Văn',      N'Huỳnh',   '1977-01-22', N'Nam', '0901000026', N'140 Quang Trung, Q.Gò Vấp',           N'Đái tháo đường',               6),
(N'Phụng',   N'Thị',      N'Tăng',    '1982-10-11', N'Nữ',  '0901000027', N'142 Nguyễn Oanh, Q.Gò Vấp',           N'Tuyến giáp',                   6),
(N'Thịnh',   N'Quốc',     N'Diệp',    '1979-07-03', N'Nam', '0901000028', N'144 Phan Văn Trị, Q.Gò Vấp',          N'Rối loạn nội tiết',            6),
(N'Loan',    N'Thị Hồng', N'Trần',    '1984-04-28', N'Nữ',  '0901000029', N'146 Lê Đức Thọ, Q.Gò Vấp',           N'Nội tiết tổng quát',           6),
(N'Trung',   N'Văn',      N'Lê',      '1976-02-15', N'Nam', '0901000030', N'148 Phạm Văn Đồng, Q.Bình Thạnh',    N'Nội tiết tổng quát',           6),
-- Khoa Ngoại tổng quát (DId=7)
(N'Mạnh',    N'Văn',      N'Phùng',   '1975-08-19', N'Nam', '0901000031', N'150 Cách Mạng Tháng 8, Q.10',         N'Phẫu thuật tổng quát',         7),
(N'Hương',   N'Thị Mai',  N'Bình',    '1981-05-07', N'Nữ',  '0901000032', N'152 Nguyễn Thị Minh Khai, Q.1',      N'Phẫu thuật nội soi',           7),
(N'Hưng',    N'Đức',      N'Giang',   '1978-12-30', N'Nam', '0901000033', N'154 Võ Thị Sáu, Q.3',                 N'Phẫu thuật gan mật',           7),
(N'Thu',     N'Thị',      N'Lương',   '1983-09-22', N'Nữ',  '0901000034', N'156 Nguyễn Đình Chiểu, Q.3',          N'Phẫu thuật tiêu hóa',          7),
(N'Đạt',     N'Minh',     N'Nguyễn',  '1977-06-14', N'Nam', '0901000035', N'158 Trần Quốc Thảo, Q.3',             N'Phẫu thuật tổng quát',         7),
-- Khoa Ngoại chấn thương (DId=8)
(N'Nam',     N'Quốc',     N'Vương',   '1976-04-08', N'Nam', '0901000036', N'160 Lê Văn Sỹ, Q.Phú Nhuận',         N'Chấn thương chỉnh hình',       8),
(N'Trang',   N'Thị',      N'Phúc',    '1982-01-25', N'Nữ',  '0901000037', N'162 Phan Xích Long, Q.Phú Nhuận',    N'Phẫu thuật cột sống',          8),
(N'Bình',    N'Văn',      N'Hoàng',   '1979-10-17', N'Nam', '0901000038', N'164 Hoa Sứ, Q.Phú Nhuận',             N'Phẫu thuật khớp',              8),
(N'Chi',     N'Thị Lan',  N'Đoàn',    '1984-07-09', N'Nữ',  '0901000039', N'166 Thích Quảng Đức, Q.Phú Nhuận',  N'Chỉnh hình nhi',               8),
(N'Việt',    N'Anh',      N'Lưu',     '1977-03-02', N'Nam', '0901000040', N'168 Nguyễn Kiệm, Q.Phú Nhuận',       N'Chấn thương chỉnh hình',       8),
-- Khoa Ngoại thần kinh (DId=9)
(N'Khoa',    N'Minh',     N'Lê',      '1975-11-20', N'Nam', '0901000041', N'170 Phạm Ngọc Thạch, Q.3',            N'Phẫu thuật não',               9),
(N'Linh',    N'Thị Ngọc', N'Tô',      '1981-08-13', N'Nữ',  '0901000042', N'172 Ngô Gia Tự, Q.10',               N'Phẫu thuật tủy sống',          9),
(N'Phong',   N'Đức',      N'Trần',    '1978-05-06', N'Nam', '0901000043', N'174 Lê Hồng Phong, Q.10',             N'Thần kinh phẫu thuật',         9),
-- Khoa Sản phụ khoa (DId=10)
(N'Mai',     N'Thị',      N'Nguyễn',  '1980-02-28', N'Nữ',  '0901000044', N'176 Sư Vạn Hạnh, Q.10',              N'Sản khoa',                     10),
(N'Hạnh',    N'Thị Phương',N'Trần',   '1983-11-15', N'Nữ',  '0901000045', N'178 Cao Thắng, Q.3',                  N'Phụ khoa ung thư',             10),
(N'Quỳnh',   N'Thị',      N'Lê',      '1978-08-08', N'Nữ',  '0901000046', N'180 Đinh Tiên Hoàng, Q.1',            N'Sinh sản hỗ trợ',              10),
(N'Vân',     N'Thị Kim',  N'Phạm',    '1985-05-01', N'Nữ',  '0901000047', N'182 Nguyễn Bỉnh Khiêm, Q.1',         N'Sản phụ khoa tổng quát',       10),
(N'Như',     N'Thị',      N'Đặng',    '1981-01-24', N'Nữ',  '0901000048', N'184 Mạc Đĩnh Chi, Q.1',               N'Sản phụ khoa tổng quát',       10),
-- Khoa Nhi (DId=11)
(N'Khánh',   N'Văn',      N'Hoàng',   '1977-10-17', N'Nam', '0901000049', N'186 Nguyễn Du, Q.1',                  N'Nhi tổng quát',                11),
(N'Thùy',    N'Thị',      N'Bùi',     '1982-07-10', N'Nữ',  '0901000050', N'188 Đồng Khởi, Q.1',                 N'Sơ sinh',                      11),
(N'Nhật',    N'Minh',     N'Trương',  '1979-04-03', N'Nam', '0901000051', N'190 Hai Bà Trưng, Q.1',               N'Nhi tim mạch',                 11),
(N'Châu',    N'Thị Thu',  N'Vũ',      '1984-01-26', N'Nữ',  '0901000052', N'192 Lê Duẩn, Q.1',                   N'Nhi nội tiết',                 11),
(N'Phú',     N'Anh',      N'Đinh',    '1978-10-19', N'Nam', '0901000053', N'194 Nam Kỳ Khởi Nghĩa, Q.1',          N'Nhi tổng quát',                11),
-- Khoa Hồi sức cấp cứu (DId=12)
(N'Toàn',    N'Văn',      N'Ngô',     '1975-06-12', N'Nam', '0901000054', N'196 Nguyễn Thị Minh Khai, Q.3',      N'Hồi sức tích cực',             12),
(N'Hòa',     N'Thị',      N'Lý',      '1981-03-05', N'Nữ',  '0901000055', N'198 Trần Hưng Đạo, Q.5',             N'Cấp cứu nội khoa',             12),
(N'Duy',     N'Quốc',     N'Cao',     '1978-12-28', N'Nam', '0901000056', N'200 Châu Văn Liêm, Q.5',              N'Cấp cứu ngoại khoa',           12),
-- Khoa Ung bướu (DId=13)
(N'Ân',      N'Văn',      N'Lâm',     '1974-09-21', N'Nam', '0901000057', N'202 Nguyễn Trãi, Q.5',                N'Ung thư nội khoa',             13),
(N'Liên',    N'Thị Mỹ',   N'Đoàn',    '1980-06-14', N'Nữ',  '0901000058', N'204 Trần Bình Trọng, Q.5',           N'Xạ trị ung thư',               13),
(N'Thiện',   N'Minh',     N'Phan',    '1977-03-07', N'Nam', '0901000059', N'206 Hải Thượng Lãn Ông, Q.5',        N'Ung thư ngoại khoa',           13),
-- Khoa Da liễu (DId=14)
(N'Nga',     N'Thị',      N'Hà',      '1982-12-30', N'Nữ',  '0901000060', N'208 Triệu Quang Phục, Q.5',           N'Da liễu tổng quát',            14),
(N'Bách',    N'Văn',      N'Đào',     '1979-09-23', N'Nam', '0901000061', N'210 Lương Nhữ Học, Q.5',              N'Điều trị laser da',            14),
(N'Ly',      N'Thị Thu',  N'Châu',    '1984-06-16', N'Nữ',  '0901000062', N'212 Phùng Hưng, Q.5',                N'Dị ứng – Miễn dịch da',        14),
-- Khoa Mắt (DId=15)
(N'Đức',     N'Văn',      N'Trần',    '1976-03-09', N'Nam', '0901000063', N'214 Nguyễn Chí Thanh, Q.5',           N'Phẫu thuật mắt',               15),
(N'Ngân',    N'Thị',      N'Lê',      '1982-12-02', N'Nữ',  '0901000064', N'216 Trần Phú, Q.5',                   N'Nhãn khoa tổng quát',          15),
(N'Hậu',     N'Minh',     N'Phạm',    '1978-08-26', N'Nam', '0901000065', N'218 Lý Chiêu Hoàng, Q.6',             N'Glôcôm – Đục thủy tinh thể',  15),
-- Khoa Tai mũi họng (DId=16)
(N'Yên',     N'Thị',      N'Vương',   '1981-05-19', N'Nữ',  '0901000066', N'220 Phạm Đình Hổ, Q.6',               N'Tai mũi họng tổng quát',       16),
(N'Hào',     N'Văn',      N'Triệu',   '1977-02-11', N'Nam', '0901000067', N'222 Bình Tiên, Q.6',                   N'Phẫu thuật tai mũi họng',      16),
(N'Tâm',     N'Thị',      N'Nguyễn',  '1983-11-04', N'Nữ',  '0901000068', N'224 Hậu Giang, Q.6',                  N'Thính học',                    16),
-- Khoa Răng Hàm Mặt (DId=17)
(N'Khoa',    N'Văn',      N'Mai',     '1980-08-28', N'Nam', '0901000069', N'226 Ngô Quyền, Q.5',                   N'Nha khoa tổng quát',           17),
(N'Ly',      N'Thị',      N'Tôn',     '1984-05-21', N'Nữ',  '0901000070', N'228 Lý Nam Đế, Q.1',                  N'Chỉnh nha',                    17),
(N'Tín',     N'Minh',     N'Đỗ',      '1978-02-14', N'Nam', '0901000071', N'230 Đinh Lễ, Q.1',                    N'Phẫu thuật hàm mặt',           17),
-- Khoa Phục hồi chức năng (DId=18)
(N'Phương',  N'Thị',      N'Lưu',     '1982-11-07', N'Nữ',  '0901000072', N'232 Trần Quang Khải, Q.1',            N'Phục hồi chức năng tổng quát', 18),
(N'Bảo',     N'Văn',      N'Hoàng',   '1977-08-01', N'Nam', '0901000073', N'234 Nguyễn Hữu Cầu, Q.1',             N'Vật lý trị liệu',              18),
-- Khoa Truyền nhiễm (DId=19)
(N'Hải',     N'Thị',      N'Bùi',     '1980-04-24', N'Nữ',  '0901000074', N'236 Đặng Thị Nhu, Q.1',               N'Bệnh truyền nhiễm tổng quát',  19),
(N'Vinh',    N'Văn',      N'Trần',    '1976-01-17', N'Nam', '0901000075', N'238 Calmette, Q.1',                    N'Bệnh nhiệt đới',               19),
-- Khoa Y học cổ truyền (DId=20)
(N'Tâm',     N'Thị',      N'Lê',      '1975-10-10', N'Nữ',  '0901000076', N'240 Yersin, Q.1',                     N'Y học cổ truyền',              20),
(N'Đức',     N'Văn',      N'Đinh',    '1980-07-03', N'Nam', '0901000077', N'242 Phó Đức Chính, Q.1',              N'Châm cứu – Xoa bóp',           20),
-- Bổ sung thêm bác sĩ để đủ 100
(N'Quỳnh',   N'Thị',      N'Cao',     '1983-04-15', N'Nữ',  '0901000078', N'244 Nguyễn Công Trứ, Q.1',            N'Nội khoa tổng quát',           1),
(N'Lộc',     N'Văn',      N'Hà',      '1977-01-08', N'Nam', '0901000079', N'246 Huỳnh Thúc Kháng, Q.1',           N'Tim mạch can thiệp',           2),
(N'Cẩm',     N'Thị',      N'Tô',      '1981-10-01', N'Nữ',  '0901000080', N'248 Lê Thánh Tôn, Q.1',               N'Tiêu hóa tổng quát',           3),
(N'Hưng',    N'Văn',      N'Nguyễn',  '1976-06-24', N'Nam', '0901000081', N'250 Mạc Thị Bưởi, Q.1',               N'Thần kinh tổng quát',          4),
(N'Thoa',    N'Thị',      N'Trương',  '1982-03-17', N'Nữ',  '0901000082', N'252 Đông Du, Q.1',                    N'Hô hấp tổng quát',             5),
(N'Tú',      N'Anh',      N'Phan',    '1979-12-10', N'Nam', '0901000083', N'254 Ngô Đức Kế, Q.1',                 N'Đái tháo đường',               6),
(N'Liêm',    N'Văn',      N'Ngô',     '1975-09-03', N'Nam', '0901000084', N'256 Hồ Huấn Nghiệp, Q.1',             N'Phẫu thuật tổng quát',         7),
(N'Hậu',     N'Thị',      N'Đinh',    '1981-05-27', N'Nữ',  '0901000085', N'258 Thi Sách, Q.1',                   N'Chấn thương chỉnh hình',       8),
(N'Khang',   N'Minh',     N'Vũ',      '1978-02-20', N'Nam', '0901000086', N'260 Nguyễn Siêu, Q.1',                N'Phẫu thuật não',               9),
(N'Thi',     N'Thị',      N'Lê',      '1983-11-13', N'Nữ',  '0901000087', N'262 Thủ Khoa Huân, Q.1',              N'Sản phụ khoa tổng quát',       10),
(N'Khiêm',   N'Văn',      N'Trần',    '1977-08-06', N'Nam', '0901000088', N'264 Công Trường Quốc Tế, Q.3',        N'Nhi tổng quát',                11),
(N'Nhung',   N'Thị',      N'Phạm',    '1980-04-30', N'Nữ',  '0901000089', N'266 Mạc Đĩnh Chi, Q.1',               N'Hồi sức tích cực',             12),
(N'Cường',   N'Văn',      N'Đào',     '1975-01-23', N'Nam', '0901000090', N'268 Bà Huyện Thanh Quan, Q.3',        N'Ung thư nội khoa',             13),
(N'Trinh',   N'Thị',      N'Hồ',      '1981-10-16', N'Nữ',  '0901000091', N'270 Trương Định, Q.3',                N'Da liễu tổng quát',            14),
(N'Hoàng',   N'Minh',     N'Tống',    '1978-07-09', N'Nam', '0901000092', N'272 Nguyễn Phi Khanh, Q.1',           N'Nhãn khoa tổng quát',          15),
(N'Mơ',      N'Thị',      N'Lương',   '1983-04-02', N'Nữ',  '0901000093', N'274 Đinh Công Tráng, Q.1',            N'Tai mũi họng tổng quát',       16),
(N'Tuấn',    N'Văn',      N'Dương',   '1977-12-26', N'Nam', '0901000094', N'276 Nguyễn Thị Diệu, Q.3',            N'Nha khoa tổng quát',           17),
(N'Hiền',    N'Thị',      N'Trần',    '1982-09-19', N'Nữ',  '0901000095', N'278 Kỳ Đồng, Q.3',                   N'Vật lý trị liệu',              18),
(N'Tùng',    N'Văn',      N'Lê',      '1979-06-12', N'Nam', '0901000096', N'280 Trần Quý Cáp, Q.3',               N'Bệnh truyền nhiễm tổng quát',  19),
(N'Hương',   N'Thị',      N'Nguyễn',  '1984-03-05', N'Nữ',  '0901000097', N'282 Võ Văn Tần, Q.3',                N'Y học cổ truyền',              20),
(N'Sáng',    N'Văn',      N'Bùi',     '1976-12-28', N'Nam', '0901000098', N'284 Nam Kỳ Khởi Nghĩa, Q.3',          N'Nội khoa tổng quát',           1),
(N'Trâm',    N'Thị',      N'Đinh',    '1981-09-21', N'Nữ',  '0901000099', N'286 Lê Quý Đôn, Q.3',                N'Tim mạch tổng quát',           2),
(N'Đăng',    N'Minh',     N'Hà',      '1978-06-14', N'Nam', '0901000100', N'288 Nguyễn Đình Chiểu, Q.3',          N'Tiêu hóa tổng quát',           3);
GO

-- 3. PATIENT (120 bệnh nhân)
INSERT INTO PATIENT (PFirstName, PMiddleName, PLastName, PBirthDate, PSex, PPhone, PAddress, PInsurance) VALUES
(N'An',      N'Văn',      N'Nguyễn',  '1990-02-14', N'Nam', '0921000001', N'12 Trần Hưng Đạo, Q.5',    'BH10000001'),
(N'Bình',    N'Thị',      N'Trần',    '1985-06-20', N'Nữ',  '0921000002', N'34 Nguyễn Trãi, Q.5',      'BH10000002'),
(N'Cường',   N'Đức',      N'Lê',      '1995-09-10', N'Nam', '0921000003', N'56 Lê Văn Sỹ, Q.PN',       'BH10000003'),
(N'Dung',    N'Thị Mai',  N'Phạm',    '1988-12-05', N'Nữ',  '0921000004', N'78 Phan Xích Long, Q.PN',  'BH10000004'),
(N'Em',      N'Hoàng',    N'Hoàng',   '2000-03-25', N'Nam', '0921000005', N'90 Hoàng Văn Thụ, Q.TB',   'BH10000005'),
(N'Phúc',    N'Ngọc',     N'Võ',      '1992-07-18', N'Nam', '0921000006', N'102 Cộng Hòa, Q.TB',       'BH10000006'),
(N'Giang',   N'Quốc',     N'Đặng',    '1998-11-30', N'Nam', '0921000007', N'114 Trường Chinh, Q.12',   'BH10000007'),
(N'Hạnh',    N'Phương',   N'Bùi',     '1987-04-22', N'Nữ',  '0921000008', N'126 Quang Trung, Q.GV',    'BH10000008'),
(N'Hương',   N'Minh',     N'Trương',  '1993-08-15', N'Nữ',  '0921000009', N'138 Phan Văn Trị, Q.GV',  'BH10000009'),
(N'Khánh',   N'Thị Hồng', N'Lý',      '1996-01-08', N'Nữ',  '0921000010', N'150 Nguyễn Oanh, Q.GV',   'BH10000010'),
(N'Long',    N'Văn',      N'Đinh',    '1989-05-12', N'Nam', '0921000011', N'162 Lê Đức Thọ, Q.GV',    'BH10000011'),
(N'Mỹ',      N'Thị',      N'Ngô',     '1994-10-28', N'Nữ',  '0921000012', N'174 Phạm Văn Đồng, Q.BT', 'BH10000012'),
(N'Nhân',    N'Đức',      N'Dương',   '1991-02-03', N'Nam', '0921000013', N'186 Xô Viết Nghệ Tĩnh, Q.BT','BH10000013'),
(N'Oanh',    N'Thị Kim',  N'Vũ',      '1986-06-17', N'Nữ',  '0921000014', N'198 Đinh Bộ Lĩnh, Q.BT',  'BH10000014'),
(N'Phong',   N'Anh',      N'Tạ',      '1997-09-21', N'Nam', '0921000015', N'210 Nơ Trang Long, Q.BT',  'BH10000015'),
(N'Quang',   N'Văn',      N'Mai',     '1990-04-05', N'Nam', '0921000016', N'15 Lê Lợi, Q.1',           'BH10000016'),
(N'Rin',     N'Thị',      N'Tôn',     '1983-07-19', N'Nữ',  '0921000017', N'22 Nguyễn Huệ, Q.1',       'BH10000017'),
(N'Sơn',     N'Minh',     N'Hà',      '1999-01-11', N'Nam', '0921000018', N'33 Hai Bà Trưng, Q.1',      'BH10000018'),
(N'Tâm',     N'Thị',      N'Cao',     '1984-10-24', N'Nữ',  '0921000019', N'44 Điện Biên Phủ, Q.3',    'BH10000019'),
(N'Uyên',    N'Thị Mỹ',   N'Bình',    '1996-03-07', N'Nữ',  '0921000020', N'55 Pasteur, Q.3',           'BH10000020'),
(N'Văn',     N'Đức',      N'Lê',      '1988-06-20', N'Nam', '0921000021', N'66 Võ Văn Tần, Q.3',        'BH10000021'),
(N'Wynn',    N'Thị',      N'Nguyễn',  '1993-09-03', N'Nữ',  '0921000022', N'77 Cách Mạng Tháng 8, Q.10','BH10000022'),
(N'Xuân',    N'Văn',      N'Trần',    '1980-12-16', N'Nam', '0921000023', N'88 Lý Thường Kiệt, Q.TB',  'BH10000023'),
(N'Yến',     N'Thị',      N'Lê',      '1994-02-28', N'Nữ',  '0921000024', N'99 Cộng Hòa, Q.TB',         'BH10000024'),
(N'Tuấn',    N'Văn',      N'Phạm',    '1987-05-11', N'Nam', '0921000025', N'110 Hoàng Văn Thụ, Q.TB',  'BH10000025'),
(N'Châu',    N'Thị',      N'Võ',      '1991-08-24', N'Nữ',  '0921000026', N'121 Trường Chinh, Q.TB',   'BH10000026'),
(N'Danh',    N'Văn',      N'Đặng',    '1982-11-07', N'Nam', '0921000027', N'132 Quang Trung, Q.GV',    'BH10000027'),
(N'Ếch',     N'Thị',      N'Bùi',     '1997-01-20', N'Nữ',  '0921000028', N'143 Nguyễn Oanh, Q.GV',   'BH10000028'),
(N'Gàu',     N'Minh',     N'Trương',  '1985-04-04', N'Nam', '0921000029', N'154 Phan Văn Trị, Q.GV',   'BH10000029'),
(N'Hào',     N'Thị Kim',  N'Lý',      '1990-07-17', N'Nam', '0921000030', N'165 Lê Đức Thọ, Q.GV',    'BH10000030'),
(N'Ích',     N'Văn',      N'Đinh',    '1983-10-30', N'Nam', '0921000031', N'176 Phạm Văn Đồng, Q.BT', 'BH10000031'),
(N'Khoa',    N'Thị',      N'Ngô',     '1994-01-12', N'Nữ',  '0921000032', N'187 Xô Viết Nghệ Tĩnh, Q.BT','BH10000032'),
(N'Lộc',     N'Đức',      N'Dương',   '1989-04-25', N'Nam', '0921000033', N'198 Đinh Bộ Lĩnh, Q.BT',  'BH10000033'),
(N'My',      N'Thị',      N'Vũ',      '1996-08-08', N'Nữ',  '0921000034', N'209 Nơ Trang Long, Q.BT',  'BH10000034'),
(N'Nghĩa',   N'Văn',      N'Tạ',      '1981-11-21', N'Nam', '0921000035', N'220 Bình Lợi, Q.BT',        'BH10000035'),
(N'Oanh',    N'Thị',      N'Mai',     '1992-02-04', N'Nữ',  '0921000036', N'231 Nguyễn Xí, Q.BT',       'BH10000036'),
(N'Phương',  N'Văn',      N'Hà',      '1986-05-17', N'Nam', '0921000037', N'242 Đặng Văn Bi, Q.TĐ',    'BH10000037'),
(N'Quỳnh',   N'Thị',      N'Bình',    '1998-08-30', N'Nữ',  '0921000038', N'253 Kha Vạn Cân, Q.TĐ',   'BH10000038'),
(N'Rồng',    N'Minh',     N'Cao',     '1984-12-13', N'Nam', '0921000039', N'264 Võ Văn Ngân, Q.TĐ',    'BH10000039'),
(N'Sáng',    N'Thị Kim',  N'Lê',      '1991-03-26', N'Nữ',  '0921000040', N'275 Lê Văn Việt, Q.9',     'BH10000040'),
(N'Thắng',   N'Văn',      N'Trần',    '1987-07-09', N'Nam', '0921000041', N'286 Nguyễn Xiển, Q.9',      'BH10000041'),
(N'Uyên',    N'Thị',      N'Phạm',    '1993-10-22', N'Nữ',  '0921000042', N'297 Long Bình, Q.9',        'BH10000042'),
(N'Vinh',    N'Đức',      N'Võ',      '1980-01-04', N'Nam', '0921000043', N'308 Nguyễn Duy Trinh, Q.9','BH10000043'),
(N'Xuân',    N'Thị',      N'Đặng',    '1995-04-17', N'Nữ',  '0921000044', N'319 Phú Hữu, Q.9',          'BH10000044'),
(N'Yên',     N'Văn',      N'Bùi',     '1982-07-30', N'Nam', '0921000045', N'330 Long Thuận, Q.9',        'BH10000045'),
(N'Zin',     N'Thị',      N'Trương',  '1997-11-12', N'Nữ',  '0921000046', N'341 Ngô Chí Quốc, Q.TĐ',  'BH10000046'),
(N'Ái',      N'Văn',      N'Lý',      '1985-02-25', N'Nam', '0921000047', N'352 Tân Phú, Q.TĐ',          'BH10000047'),
(N'Bông',    N'Thị',      N'Đinh',    '1990-06-08', N'Nữ',  '0921000048', N'363 Lê Thị Riêng, Q.12',   'BH10000048'),
(N'Cúc',     N'Minh',     N'Ngô',     '1983-09-21', N'Nữ',  '0921000049', N'374 Tô Ký, Q.12',            'BH10000049'),
(N'Dịu',     N'Thị',      N'Dương',   '1994-12-04', N'Nữ',  '0921000050', N'385 Nguyễn Ảnh Thủ, Q.12', 'BH10000050'),
(N'Đào',     N'Văn',      N'Vũ',      '1988-03-17', N'Nam', '0921000051', N'396 Hà Huy Giáp, Q.12',     'BH10000051'),
(N'Phúc',    N'Thị',      N'Tạ',      '1993-06-30', N'Nữ',  '0921000052', N'407 Lê Thị Hồng, Q.GV',    'BH10000052'),
(N'Giàu',    N'Văn',      N'Mai',     '1980-10-13', N'Nam', '0921000053', N'418 Dương Quảng Hàm, Q.GV','BH10000053'),
(N'Hiền',    N'Thị',      N'Hà',      '1995-01-26', N'Nữ',  '0921000054', N'429 Nguyễn Văn Khối, Q.GV','BH10000054'),
(N'Ích',     N'Minh',     N'Cao',     '1987-05-09', N'Nam', '0921000055', N'440 Lê Văn Thọ, Q.GV',      'BH10000055'),
(N'Kiều',    N'Thị Kim',  N'Lê',      '1992-08-22', N'Nữ',  '0921000056', N'451 Bùi Quang Là, Q.GV',   'BH10000056'),
(N'Lành',    N'Văn',      N'Trần',    '1984-12-05', N'Nam', '0921000057', N'462 Quang Trung, Q.GV',     'BH10000057'),
(N'Miên',    N'Thị',      N'Phạm',    '1991-03-19', N'Nữ',  '0921000058', N'473 Thống Nhất, Q.GV',      'BH10000058'),
(N'Niềm',    N'Đức',      N'Võ',      '1986-07-01', N'Nam', '0921000059', N'484 Lê Văn Sỹ, Q.3',        'BH10000059'),
(N'Ốc',      N'Thị',      N'Đặng',    '1996-10-14', N'Nữ',  '0921000060', N'495 Trần Quốc Toản, Q.3',  'BH10000060'),
(N'Phát',    N'Văn',      N'Bùi',     '1981-01-27', N'Nam', '0921000061', N'506 Nguyễn Thượng Hiền, Q.3','BH10000061'),
(N'Quyên',   N'Thị',      N'Trương',  '1994-05-10', N'Nữ',  '0921000062', N'517 Bà Huyện Thanh Quan, Q.3','BH10000062'),
(N'Rực',     N'Minh',     N'Lý',      '1982-08-23', N'Nam', '0921000063', N'528 Kỳ Đồng, Q.3',          'BH10000063'),
(N'Sáu',     N'Thị',      N'Đinh',    '1997-12-06', N'Nữ',  '0921000064', N'539 Trần Quý Cáp, Q.3',    'BH10000064'),
(N'Thanh',   N'Văn',      N'Ngô',     '1985-03-19', N'Nam', '0921000065', N'550 Võ Văn Tần, Q.3',       'BH10000065'),
(N'Uyển',    N'Thị',      N'Dương',   '1990-07-02', N'Nữ',  '0921000066', N'561 Nam Kỳ Khởi Nghĩa, Q.3','BH10000066'),
(N'Vũ',      N'Đức',      N'Vũ',      '1983-10-15', N'Nam', '0921000067', N'572 Đinh Tiên Hoàng, Q.1', 'BH10000067'),
(N'Xuân',    N'Thị Kim',  N'Tạ',      '1993-01-28', N'Nữ',  '0921000068', N'583 Nguyễn Bỉnh Khiêm, Q.1','BH10000068'),
(N'Yêu',     N'Văn',      N'Mai',     '1988-05-11', N'Nam', '0921000069', N'594 Mạc Đĩnh Chi, Q.1',     'BH10000069'),
(N'Ánh',     N'Thị',      N'Hà',      '1995-08-24', N'Nữ',  '0921000070', N'605 Nguyễn Du, Q.1',        'BH10000070'),
(N'Bảo',     N'Minh',     N'Cao',     '1980-12-07', N'Nam', '0921000071', N'616 Lê Duẩn, Q.1',          'BH10000071'),
(N'Chiến',   N'Thị',      N'Lê',      '1991-03-20', N'Nam', '0921000072', N'627 Nam Kỳ Khởi Nghĩa, Q.1','BH10000072'),
(N'Duyên',   N'Thị',      N'Trần',    '1986-07-03', N'Nữ',  '0921000073', N'638 Lý Tự Trọng, Q.1',     'BH10000073'),
(N'Đen',     N'Văn',      N'Phạm',    '1994-10-16', N'Nam', '0921000074', N'649 Hai Bà Trưng, Q.1',     'BH10000074'),
(N'Phượng',  N'Thị',      N'Võ',      '1982-01-29', N'Nữ',  '0921000075', N'660 Nguyễn Thị Minh Khai, Q.1','BH10000075'),
(N'Giỏi',    N'Văn',      N'Đặng',    '1997-05-12', N'Nam', '0921000076', N'671 Trần Hưng Đạo, Q.1',    'BH10000076'),
(N'Hiếu',    N'Thị',      N'Bùi',     '1984-08-25', N'Nữ',  '0921000077', N'682 Calmette, Q.1',          'BH10000077'),
(N'Iu',      N'Minh',     N'Trương',  '1989-12-08', N'Nam', '0921000078', N'693 Phó Đức Chính, Q.1',    'BH10000078'),
(N'Kiên',    N'Thị Kim',  N'Lý',      '1993-03-21', N'Nữ',  '0921000079', N'704 Yersin, Q.1',            'BH10000079'),
(N'Lam',     N'Văn',      N'Đinh',    '1981-07-04', N'Nam', '0921000080', N'715 Nguyễn Công Trứ, Q.1',  'BH10000080'),
(N'Muội',    N'Thị',      N'Ngô',     '1992-10-17', N'Nữ',  '0921000081', N'726 Huỳnh Thúc Kháng, Q.1','BH10000081'),
(N'Nở',      N'Đức',      N'Dương',   '1987-01-30', N'Nam', '0921000082', N'737 Lê Thánh Tôn, Q.1',     'BH10000082'),
(N'Ổi',      N'Thị',      N'Vũ',      '1996-05-13', N'Nữ',  '0921000083', N'748 Mạc Thị Bưởi, Q.1',    'BH10000083'),
(N'Quý',     N'Văn',      N'Tạ',      '1984-08-26', N'Nam', '0921000084', N'759 Đông Du, Q.1',           'BH10000084'),
(N'Rẻ',      N'Thị',      N'Mai',     '1991-12-09', N'Nữ',  '0921000085', N'770 Ngô Đức Kế, Q.1',       'BH10000085'),
(N'Sóng',    N'Minh',     N'Hà',      '1983-03-22', N'Nam', '0921000086', N'781 Hồ Huấn Nghiệp, Q.1',  'BH10000086'),
(N'Tâm',     N'Thị',      N'Cao',     '1994-07-05', N'Nữ',  '0921000087', N'792 Thi Sách, Q.1',          'BH10000087'),
(N'Ủy',      N'Văn',      N'Lê',      '1980-10-18', N'Nam', '0921000088', N'803 Nguyễn Siêu, Q.1',       'BH10000088'),
(N'Việt',    N'Thị',      N'Trần',    '1995-01-31', N'Nam', '0921000089', N'814 Thủ Khoa Huân, Q.1',    'BH10000089'),
(N'Xanh',    N'Đức',      N'Phạm',    '1988-05-14', N'Nam', '0921000090', N'825 Lê Lợi, Q.1',            'BH10000090'),
(N'Yêm',     N'Thị Kim',  N'Võ',      '1993-08-27', N'Nữ',  '0921000091', N'836 Nguyễn Huệ, Q.1',       'BH10000091'),
(N'Anh',     N'Văn',      N'Đặng',    '1981-12-10', N'Nam', '0921000092', N'847 Hai Bà Trưng, Q.1',      'BH10000092'),
(N'Bé',      N'Thị',      N'Bùi',     '1992-03-23', N'Nữ',  '0921000093', N'858 Điện Biên Phủ, Q.3',    'BH10000093'),
(N'Của',     N'Minh',     N'Trương',  '1986-07-06', N'Nam', '0921000094', N'869 Pasteur, Q.3',            'BH10000094'),
(N'Địa',     N'Thị',      N'Lý',      '1997-10-19', N'Nữ',  '0921000095', N'880 Võ Văn Tần, Q.3',       'BH10000095'),
(N'Ế',       N'Văn',      N'Đinh',    '1984-01-01', N'Nam', '0921000096', N'891 Cách Mạng Tháng 8, Q.10','BH10000096'),
(N'Phán',    N'Thị',      N'Ngô',     '1989-04-15', N'Nữ',  '0921000097', N'902 Lý Thường Kiệt, Q.10', 'BH10000097'),
(N'Ghét',    N'Đức',      N'Dương',   '1983-07-28', N'Nam', '0921000098', N'913 Cộng Hòa, Q.TB',         'BH10000098'),
(N'Hỏi',     N'Thị',      N'Vũ',      '1994-11-10', N'Nữ',  '0921000099', N'924 Hoàng Văn Thụ, Q.TB',  'BH10000099'),
(N'Ích',     N'Văn',      N'Tạ',      '1988-02-23', N'Nam', '0921000100', N'935 Trường Chinh, Q.TB',     'BH10000100'),
(N'Kỳ',      N'Thị',      N'Mai',     '1995-06-08', N'Nữ',  '0921000101', N'946 Quang Trung, Q.GV',     'BH10000101'),
(N'Lạnh',    N'Minh',     N'Hà',      '1982-09-20', N'Nam', '0921000102', N'957 Nguyễn Oanh, Q.GV',     'BH10000102'),
(N'Mới',     N'Thị',      N'Cao',     '1991-12-03', N'Nữ',  '0921000103', N'968 Phan Văn Trị, Q.GV',    'BH10000103'),
(N'Nắng',    N'Văn',      N'Lê',      '1986-03-16', N'Nam', '0921000104', N'979 Lê Đức Thọ, Q.GV',      'BH10000104'),
(N'Ớt',      N'Thị Kim',  N'Trần',    '1993-06-29', N'Nữ',  '0921000105', N'990 Phạm Văn Đồng, Q.BT',  'BH10000105'),
(N'Phơi',    N'Đức',      N'Phạm',    '1980-10-12', N'Nam', '0921000106', N'1001 Xô Viết Nghệ Tĩnh, Q.BT','BH10000106'),
(N'Quán',    N'Thị',      N'Võ',      '1995-01-25', N'Nữ',  '0921000107', N'1012 Đinh Bộ Lĩnh, Q.BT',  'BH10000107'),
(N'Roi',     N'Văn',      N'Đặng',    '1987-05-08', N'Nam', '0921000108', N'1023 Nơ Trang Long, Q.BT',  'BH10000108'),
(N'Sừng',    N'Thị',      N'Bùi',     '1992-08-21', N'Nữ',  '0921000109', N'1034 Bình Lợi, Q.BT',       'BH10000109'),
(N'Tăng',    N'Minh',     N'Trương',  '1984-12-04', N'Nam', '0921000110', N'1045 Nguyễn Xí, Q.BT',      'BH10000110'),
(N'Úc',      N'Thị',      N'Lý',      '1991-03-17', N'Nữ',  '0921000111', N'1056 Đặng Văn Bi, Q.TĐ',   'BH10000111'),
(N'Vượng',   N'Văn',      N'Đinh',    '1983-07-01', N'Nam', '0921000112', N'1067 Kha Vạn Cân, Q.TĐ',    'BH10000112'),
(N'Xứng',    N'Thị',      N'Ngô',     '1994-10-14', N'Nữ',  '0921000113', N'1078 Võ Văn Ngân, Q.TĐ',   'BH10000113'),
(N'Yêu',     N'Đức',      N'Dương',   '1988-01-27', N'Nam', '0921000114', N'1089 Lê Văn Việt, Q.9',     'BH10000114'),
(N'Ấm',      N'Thị Kim',  N'Vũ',      '1995-05-10', N'Nữ',  '0921000115', N'1100 Nguyễn Xiển, Q.9',    'BH10000115'),
(N'Bức',     N'Văn',      N'Tạ',      '1981-08-23', N'Nam', '0921000116', N'1111 Long Bình, Q.9',        'BH10000116'),
(N'Chắt',    N'Thị',      N'Mai',     '1992-12-06', N'Nữ',  '0921000117', N'1122 Nguyễn Duy Trinh, Q.9','BH10000117'),
(N'Dốt',     N'Minh',     N'Hà',      '1986-03-20', N'Nam', '0921000118', N'1133 Phú Hữu, Q.9',          'BH10000118'),
(N'Ếch',     N'Thị',      N'Cao',     '1997-07-02', N'Nữ',  '0921000119', N'1144 Long Thuận, Q.9',       'BH10000119'),
(N'Gà',      N'Văn',      N'Lê',      '1985-10-15', N'Nam', '0921000120', N'1155 Ngô Chí Quốc, Q.TĐ',  'BH10000120');
GO

-- 4. CLINIC_ROOM (60 phòng khám)
INSERT INTO CLINIC_ROOM (CRName, DId, CRNumber, CRCapacity, CRStatus) VALUES
-- Khoa Nội tổng quát (DId=1) - 4 phòng
(N'Phòng khám Nội tổng quát 1',  1, 'N1-01', 20, N'Đang sử dụng'),
(N'Phòng khám Nội tổng quát 2',  1, 'N1-02', 18, N'Đang sử dụng'),
(N'Phòng khám Nội tổng quát 3',  1, 'N1-03', 15, N'Trống'),
(N'Phòng thủ thuật Nội',         1, 'N1-04', 10, N'Trống'),
-- Khoa Nội tim mạch (DId=2) - 3 phòng
(N'Phòng khám Tim mạch 1',       2, 'TM-01', 15, N'Đang sử dụng'),
(N'Phòng khám Tim mạch 2',       2, 'TM-02', 12, N'Đang sử dụng'),
(N'Phòng siêu âm tim',           2, 'TM-03', 8,  N'Trống'),
-- Khoa Nội tiêu hóa (DId=3) - 3 phòng
(N'Phòng khám Tiêu hóa 1',       3, 'TH-01', 18, N'Đang sử dụng'),
(N'Phòng khám Tiêu hóa 2',       3, 'TH-02', 15, N'Trống'),
(N'Phòng nội soi tiêu hóa',      3, 'TH-03', 6,  N'Đang sử dụng'),
-- Khoa Nội thần kinh (DId=4) - 3 phòng
(N'Phòng khám Thần kinh 1',      4, 'TK-01', 15, N'Đang sử dụng'),
(N'Phòng khám Thần kinh 2',      4, 'TK-02', 12, N'Trống'),
(N'Phòng điện não đồ',           4, 'TK-03', 5,  N'Trống'),
-- Khoa Nội hô hấp (DId=5) - 3 phòng
(N'Phòng khám Hô hấp 1',         5, 'HH-01', 20, N'Đang sử dụng'),
(N'Phòng khám Hô hấp 2',         5, 'HH-02', 15, N'Trống'),
(N'Phòng đo chức năng hô hấp',   5, 'HH-03', 8,  N'Bảo trì'),
-- Khoa Nội tiết (DId=6) - 3 phòng
(N'Phòng khám Nội tiết 1',       6, 'NT-01', 18, N'Đang sử dụng'),
(N'Phòng khám Nội tiết 2',       6, 'NT-02', 15, N'Trống'),
(N'Phòng tư vấn đái tháo đường', 6, 'NT-03', 10, N'Trống'),
-- Khoa Ngoại tổng quát (DId=7) - 3 phòng
(N'Phòng khám Ngoại 1',          7, 'NG-01', 15, N'Đang sử dụng'),
(N'Phòng khám Ngoại 2',          7, 'NG-02', 12, N'Trống'),
(N'Phòng thay băng – tiểu thủ thuật',7,'NG-03',8, N'Đang sử dụng'),
-- Khoa Ngoại chấn thương (DId=8) - 3 phòng
(N'Phòng khám Chấn thương 1',    8, 'CT-01', 15, N'Đang sử dụng'),
(N'Phòng khám Chấn thương 2',    8, 'CT-02', 12, N'Trống'),
(N'Phòng bó bột – nẹp',          8, 'CT-03', 8,  N'Đang sử dụng'),
-- Khoa Ngoại thần kinh (DId=9) - 2 phòng
(N'Phòng khám Ngoại thần kinh 1',9, 'NTK-01',12, N'Đang sử dụng'),
(N'Phòng khám Ngoại thần kinh 2',9, 'NTK-02',10, N'Trống'),
-- Khoa Sản phụ khoa (DId=10) - 4 phòng
(N'Phòng khám Sản 1',            10,'S-01',  15, N'Đang sử dụng'),
(N'Phòng khám Sản 2',            10,'S-02',  12, N'Đang sử dụng'),
(N'Phòng siêu âm sản khoa',      10,'S-03',  6,  N'Đang sử dụng'),
(N'Phòng tư vấn tiền sản',       10,'S-04',  8,  N'Trống'),
-- Khoa Nhi (DId=11) - 4 phòng
(N'Phòng khám Nhi 1',            11,'NH-01', 25, N'Đang sử dụng'),
(N'Phòng khám Nhi 2',            11,'NH-02', 20, N'Đang sử dụng'),
(N'Phòng khám Nhi 3',            11,'NH-03', 18, N'Trống'),
(N'Phòng tiêm chủng trẻ em',     11,'NH-04', 15, N'Đang sử dụng'),
-- Khoa Hồi sức cấp cứu (DId=12) - 2 phòng
(N'Phòng cấp cứu tổng hợp',      12,'CC-01', 20, N'Đang sử dụng'),
(N'Phòng hồi sức tích cực',      12,'CC-02', 10, N'Đang sử dụng'),
-- Khoa Ung bướu (DId=13) - 2 phòng
(N'Phòng khám Ung bướu 1',       13,'UB-01', 15, N'Đang sử dụng'),
(N'Phòng khám Ung bướu 2',       13,'UB-02', 12, N'Trống'),
-- Khoa Da liễu (DId=14) - 2 phòng
(N'Phòng khám Da liễu 1',        14,'DL-01', 15, N'Đang sử dụng'),
(N'Phòng khám Da liễu 2',        14,'DL-02', 12, N'Trống'),
-- Khoa Mắt (DId=15) - 3 phòng
(N'Phòng khám Mắt 1',            15,'M-01',  12, N'Đang sử dụng'),
(N'Phòng khám Mắt 2',            15,'M-02',  10, N'Trống'),
(N'Phòng đo khúc xạ mắt',        15,'M-03',  6,  N'Đang sử dụng'),
-- Khoa Tai mũi họng (DId=16) - 3 phòng
(N'Phòng khám TMH 1',            16,'TMH-01',12, N'Đang sử dụng'),
(N'Phòng khám TMH 2',            16,'TMH-02',10, N'Trống'),
(N'Phòng thính học',             16,'TMH-03', 6, N'Trống'),
-- Khoa Răng Hàm Mặt (DId=17) - 3 phòng
(N'Phòng khám Răng 1',           17,'RHM-01',10, N'Đang sử dụng'),
(N'Phòng khám Răng 2',           17,'RHM-02', 8, N'Đang sử dụng'),
(N'Phòng chỉnh nha',             17,'RHM-03', 8, N'Trống'),
-- Khoa Phục hồi chức năng (DId=18) - 2 phòng
(N'Phòng vật lý trị liệu 1',     18,'PHCN-01',15,N'Đang sử dụng'),
(N'Phòng vật lý trị liệu 2',     18,'PHCN-02',12,N'Trống'),
-- Khoa Truyền nhiễm (DId=19) - 2 phòng
(N'Phòng khám Truyền nhiễm 1',   19,'TN-01', 10, N'Đang sử dụng'),
(N'Phòng khám Truyền nhiễm 2',   19,'TN-02',  8, N'Trống'),
-- Khoa Y học cổ truyền (DId=20) - 2 phòng
(N'Phòng khám YHCT 1',           20,'YHCT-01',15,N'Đang sử dụng'),
(N'Phòng châm cứu – xoa bóp',    20,'YHCT-02',12,N'Trống');
GO


-- =============================================
-- PART 2: WORK_SCHEDULE, APPOINTMENT, MEDICAL_RECORD,
--         PRESCRIPTION, CATEGORY_MEDICINE,
--         PRESCRIPTION_DETAIL, INVOICE, INVOICE_DETAIL
-- =============================================

-- 5. WORK_SCHEDULE
-- Lịch làm việc 4 tuần (07/04/2026 – 01/05/2026)
-- Mỗi bác sĩ có lịch sáng HOẶC chiều mỗi ngày làm việc (Thứ 2 – Thứ 7)
-- Để gọn, chèn theo từng tuần cho ~30 bác sĩ đại diện

-- TUẦN 1: 07/04 – 11/04/2026
INSERT INTO WORK_SCHEDULE (DrId, CRId, WSDay, WSStartime, WSEndtime, WSMaxPatientSlot) VALUES
(1,  1,  '2026-04-07','08:00','12:00',20),(2,  1,  '2026-04-07','13:00','17:00',20),
(3,  2,  '2026-04-07','08:00','12:00',18),(6,  5,  '2026-04-07','08:00','12:00',15),
(7,  5,  '2026-04-07','13:00','17:00',15),(11, 8,  '2026-04-07','08:00','12:00',18),
(16, 11, '2026-04-07','08:00','12:00',15),(21, 14, '2026-04-07','08:00','12:00',20),
(26, 17, '2026-04-07','08:00','12:00',18),(31, 20, '2026-04-07','13:00','17:00',15),
(44, 28, '2026-04-07','08:00','12:00',15),(49, 31, '2026-04-07','08:00','12:00',25),
(54, 36, '2026-04-07','08:00','12:00',20),(57, 38, '2026-04-07','13:00','17:00',15),
(60, 40, '2026-04-07','08:00','12:00',15),(63, 42, '2026-04-07','08:00','12:00',12),
(66, 44, '2026-04-07','08:00','12:00',12),(69, 46, '2026-04-07','08:00','12:00',10),
(72, 47, '2026-04-07','08:00','12:00',10),(76, 50, '2026-04-07','08:00','12:00',15),

(1,  1,  '2026-04-08','08:00','12:00',20),(4,  2,  '2026-04-08','13:00','17:00',18),
(6,  5,  '2026-04-08','08:00','12:00',15),(8,  6,  '2026-04-08','13:00','17:00',12),
(11, 8,  '2026-04-08','08:00','12:00',18),(12, 9,  '2026-04-08','13:00','17:00',15),
(16, 11, '2026-04-08','08:00','12:00',15),(17, 12, '2026-04-08','13:00','17:00',12),
(21, 14, '2026-04-08','08:00','12:00',20),(22, 15, '2026-04-08','13:00','17:00',15),
(26, 17, '2026-04-08','08:00','12:00',18),(44, 28, '2026-04-08','13:00','17:00',15),
(49, 31, '2026-04-08','08:00','12:00',25),(50, 32, '2026-04-08','13:00','17:00',20),

(2,  1,  '2026-04-09','08:00','12:00',20),(5,  3,  '2026-04-09','13:00','17:00',15),
(7,  5,  '2026-04-09','08:00','12:00',15),(9,  7,  '2026-04-09','13:00','17:00',12),
(11, 8,  '2026-04-09','08:00','12:00',18),(13, 10, '2026-04-09','08:00','12:00',6),
(16, 11, '2026-04-09','08:00','12:00',15),(19, 13, '2026-04-09','13:00','17:00',8),
(21, 14, '2026-04-09','08:00','12:00',20),(23, 16, '2026-04-09','13:00','17:00',10),
(26, 17, '2026-04-09','08:00','12:00',18),(44, 28, '2026-04-09','08:00','12:00',15),
(49, 31, '2026-04-09','08:00','12:00',25),(51, 33, '2026-04-09','13:00','17:00',18),

(3,  2,  '2026-04-10','08:00','12:00',18),(6,  5,  '2026-04-10','08:00','12:00',15),
(11, 8,  '2026-04-10','08:00','12:00',18),(16, 11, '2026-04-10','08:00','12:00',15),
(21, 14, '2026-04-10','08:00','12:00',20),(26, 17, '2026-04-10','13:00','17:00',18),
(44, 28, '2026-04-10','08:00','12:00',15),(49, 31, '2026-04-10','08:00','12:00',25),

(1,  1,  '2026-04-11','08:00','12:00',20),(6,  5,  '2026-04-11','08:00','12:00',15),
(11, 8,  '2026-04-11','08:00','12:00',18),(16, 11, '2026-04-11','08:00','12:00',15),
(21, 14, '2026-04-11','08:00','12:00',20),(44, 28, '2026-04-11','08:00','12:00',15);

-- TUẦN 2: 14/04 – 18/04/2026
INSERT INTO WORK_SCHEDULE (DrId, CRId, WSDay, WSStartime, WSEndtime, WSMaxPatientSlot) VALUES
(1,  1,  '2026-04-14','08:00','12:00',20),(2,  1,  '2026-04-14','13:00','17:00',20),
(6,  5,  '2026-04-14','08:00','12:00',15),(7,  5,  '2026-04-14','13:00','17:00',15),
(11, 8,  '2026-04-14','08:00','12:00',18),(12, 9,  '2026-04-14','13:00','17:00',15),
(16, 11, '2026-04-14','08:00','12:00',15),(17, 12, '2026-04-14','13:00','17:00',12),
(21, 14, '2026-04-14','08:00','12:00',20),(22, 15, '2026-04-14','13:00','17:00',15),
(26, 17, '2026-04-14','08:00','12:00',18),(31, 20, '2026-04-14','13:00','17:00',15),
(44, 28, '2026-04-14','08:00','12:00',15),(49, 31, '2026-04-14','08:00','12:00',25),
(54, 36, '2026-04-14','08:00','12:00',20),(57, 38, '2026-04-14','13:00','17:00',15),
(60, 40, '2026-04-14','08:00','12:00',15),(63, 42, '2026-04-14','08:00','12:00',12),
(66, 44, '2026-04-14','08:00','12:00',12),(69, 46, '2026-04-14','08:00','12:00',10),

(3,  2,  '2026-04-15','08:00','12:00',18),(4,  2,  '2026-04-15','13:00','17:00',18),
(8,  6,  '2026-04-15','08:00','12:00',12),(9,  7,  '2026-04-15','13:00','17:00',12),
(13, 10, '2026-04-15','08:00','12:00',6), (11, 8,  '2026-04-15','08:00','12:00',18),
(16, 11, '2026-04-15','08:00','12:00',15),(18, 13, '2026-04-15','13:00','17:00',5),
(21, 14, '2026-04-15','08:00','12:00',20),(23, 16, '2026-04-15','13:00','17:00',10),
(26, 17, '2026-04-15','08:00','12:00',18),(44, 28, '2026-04-15','08:00','12:00',15),
(50, 32, '2026-04-15','08:00','12:00',20),(52, 34, '2026-04-15','13:00','17:00',15),

(1,  1,  '2026-04-16','08:00','12:00',20),(2,  1,  '2026-04-16','13:00','17:00',20),
(5,  3,  '2026-04-16','08:00','12:00',15),(6,  5,  '2026-04-16','08:00','12:00',15),
(7,  5,  '2026-04-16','13:00','17:00',15),(11, 8,  '2026-04-16','08:00','12:00',18),
(16, 11, '2026-04-16','08:00','12:00',15),(21, 14, '2026-04-16','08:00','12:00',20),
(26, 17, '2026-04-16','08:00','12:00',18),(31, 20, '2026-04-16','13:00','17:00',15),
(44, 28, '2026-04-16','08:00','12:00',15),(49, 31, '2026-04-16','08:00','12:00',25),

(3,  2,  '2026-04-17','08:00','12:00',18),(4,  2,  '2026-04-17','13:00','17:00',18),
(6,  5,  '2026-04-17','08:00','12:00',15),(8,  6,  '2026-04-17','13:00','17:00',12),
(11, 8,  '2026-04-17','08:00','12:00',18),(16, 11, '2026-04-17','08:00','12:00',15),
(21, 14, '2026-04-17','08:00','12:00',20),(26, 17, '2026-04-17','08:00','12:00',18),
(44, 28, '2026-04-17','08:00','12:00',15),(49, 31, '2026-04-17','08:00','12:00',25),
(54, 36, '2026-04-17','13:00','17:00',20),(57, 38, '2026-04-17','08:00','12:00',15),

(1,  1,  '2026-04-18','08:00','12:00',20),(2,  1,  '2026-04-18','13:00','17:00',20),
(6,  5,  '2026-04-18','08:00','12:00',15),(11, 8,  '2026-04-18','08:00','12:00',18),
(16, 11, '2026-04-18','08:00','12:00',15),(21, 14, '2026-04-18','08:00','12:00',20),
(44, 28, '2026-04-18','08:00','12:00',15),(49, 31, '2026-04-18','08:00','12:00',25);

-- TUẦN 3: 21/04 – 25/04/2026
INSERT INTO WORK_SCHEDULE (DrId, CRId, WSDay, WSStartime, WSEndtime, WSMaxPatientSlot) VALUES
(1,  1,  '2026-04-21','08:00','12:00',20),(2,  1,  '2026-04-21','13:00','17:00',20),
(6,  5,  '2026-04-21','08:00','12:00',15),(11, 8,  '2026-04-21','08:00','12:00',18),
(16, 11, '2026-04-21','08:00','12:00',15),(21, 14, '2026-04-21','08:00','12:00',20),
(26, 17, '2026-04-21','08:00','12:00',18),(44, 28, '2026-04-21','08:00','12:00',15),
(49, 31, '2026-04-21','08:00','12:00',25),(54, 36, '2026-04-21','08:00','12:00',20),
(3,  2,  '2026-04-22','08:00','12:00',18),(7,  5,  '2026-04-22','13:00','17:00',15),
(11, 8,  '2026-04-22','08:00','12:00',18),(16, 11, '2026-04-22','08:00','12:00',15),
(21, 14, '2026-04-22','08:00','12:00',20),(26, 17, '2026-04-22','13:00','17:00',18),
(44, 28, '2026-04-22','08:00','12:00',15),(49, 31, '2026-04-22','08:00','12:00',25),
(1,  1,  '2026-04-23','08:00','12:00',20),(6,  5,  '2026-04-23','08:00','12:00',15),
(11, 8,  '2026-04-23','08:00','12:00',18),(16, 11, '2026-04-23','08:00','12:00',15),
(21, 14, '2026-04-23','08:00','12:00',20),(44, 28, '2026-04-23','08:00','12:00',15),
(2,  1,  '2026-04-24','13:00','17:00',20),(7,  5,  '2026-04-24','08:00','12:00',15),
(11, 8,  '2026-04-24','08:00','12:00',18),(16, 11, '2026-04-24','08:00','12:00',15),
(21, 14, '2026-04-24','08:00','12:00',20),(49, 31, '2026-04-24','08:00','12:00',25),
(1,  1,  '2026-04-25','08:00','12:00',20),(6,  5,  '2026-04-25','08:00','12:00',15),
(11, 8,  '2026-04-25','08:00','12:00',18),(16, 11, '2026-04-25','08:00','12:00',15),
(44, 28, '2026-04-25','08:00','12:00',15),(49, 31, '2026-04-25','08:00','12:00',25);

-- TUẦN 4: 28/04 – 01/05/2026
INSERT INTO WORK_SCHEDULE (DrId, CRId, WSDay, WSStartime, WSEndtime, WSMaxPatientSlot) VALUES
(1,  1,  '2026-04-28','08:00','12:00',20),(3,  2,  '2026-04-28','08:00','12:00',18),
(6,  5,  '2026-04-28','08:00','12:00',15),(11, 8,  '2026-04-28','08:00','12:00',18),
(16, 11, '2026-04-28','08:00','12:00',15),(21, 14, '2026-04-28','08:00','12:00',20),
(26, 17, '2026-04-28','08:00','12:00',18),(44, 28, '2026-04-28','08:00','12:00',15),
(49, 31, '2026-04-28','08:00','12:00',25),(54, 36, '2026-04-28','13:00','17:00',20),
(2,  1,  '2026-04-29','13:00','17:00',20),(7,  5,  '2026-04-29','08:00','12:00',15),
(11, 8,  '2026-04-29','08:00','12:00',18),(16, 11, '2026-04-29','08:00','12:00',15),
(21, 14, '2026-04-29','08:00','12:00',20),(44, 28, '2026-04-29','08:00','12:00',15),
(1,  1,  '2026-04-30','08:00','12:00',20),(6,  5,  '2026-04-30','08:00','12:00',15),
(11, 8,  '2026-04-30','08:00','12:00',18),(16, 11, '2026-04-30','08:00','12:00',15),
(21, 14, '2026-04-30','08:00','12:00',20),(49, 31, '2026-04-30','08:00','12:00',25),
(1,  1,  '2026-05-01','08:00','12:00',20),(6,  5,  '2026-05-01','08:00','12:00',15),
(44, 28, '2026-05-01','08:00','12:00',15),(49, 31, '2026-05-01','08:00','12:00',25);
GO

-- 6. APPOINTMENT
SET DATEFORMAT YMD;
GO

INSERT INTO APPOINTMENT (DrId, PId, CRId, APStatus, APReason, APDateTimes, APCreateAt, APUpdateAt) VALUES
-- ===== TUẦN TRƯỚC (09/04 – 15/04) – Phần lớn Hoàn thành =====
(1,  1,  1,  N'Hoàn thành', N'Đau bụng, khó tiêu kéo dài',           '2026-04-09 08:30:00','2026-04-07 09:00:00','2026-04-09 10:30:00'),
(2,  2,  1,  N'Hoàn thành', N'Ho kéo dài 2 tuần',                     '2026-04-09 09:00:00','2026-04-07 10:00:00','2026-04-09 11:00:00'),
(6,  3,  5,  N'Hoàn thành', N'Đau ngực khi gắng sức',                 '2026-04-09 09:30:00','2026-04-07 11:00:00','2026-04-09 11:30:00'),
(7,  4,  5,  N'Hoàn thành', N'Hồi hộp, khó thở về đêm',              '2026-04-09 10:00:00','2026-04-07 14:00:00','2026-04-09 12:00:00'),
(11, 5,  8,  N'Hoàn thành', N'Đau thượng vị sau ăn',                  '2026-04-09 10:30:00','2026-04-08 08:00:00','2026-04-09 12:30:00'),
(12, 6,  9,  N'Hoàn thành', N'Ợ chua, buồn nôn',                      '2026-04-09 13:30:00','2026-04-08 09:00:00','2026-04-09 15:30:00'),
(16, 7,  11, N'Hoàn thành', N'Đau đầu tái phát nhiều lần',             '2026-04-09 14:00:00','2026-04-08 10:00:00','2026-04-09 16:00:00'),
(21, 8,  14, N'Hoàn thành', N'Khó thở, thở rít',                      '2026-04-09 14:30:00','2026-04-08 11:00:00','2026-04-09 16:30:00'),
(26, 9,  17, N'Hoàn thành', N'Mệt mỏi, sụt cân',                      '2026-04-09 15:00:00','2026-04-08 14:00:00','2026-04-09 17:00:00'),
(44, 10, 28, N'Hoàn thành', N'Khám thai định kỳ tháng thứ 6',          '2026-04-10 08:30:00','2026-04-08 15:00:00','2026-04-10 10:30:00'),
(49, 11, 31, N'Hoàn thành', N'Trẻ sốt cao 3 ngày không hạ',           '2026-04-10 09:00:00','2026-04-09 08:00:00','2026-04-10 11:00:00'),
(50, 12, 32, N'Hoàn thành', N'Trẻ tiêu chảy 2 ngày',                  '2026-04-10 09:30:00','2026-04-09 09:00:00','2026-04-10 11:30:00'),
(54, 13, 36, N'Hoàn thành', N'Chấn thương gối do tai nạn',             '2026-04-10 10:00:00','2026-04-09 10:00:00','2026-04-10 12:00:00'),
(57, 14, 38, N'Hoàn thành', N'Vết thương ngoài da nhiễm trùng',        '2026-04-10 10:30:00','2026-04-09 11:00:00','2026-04-10 12:30:00'),
(60, 15, 40, N'Hoàn thành', N'Khối u vú cần theo dõi',                 '2026-04-10 13:30:00','2026-04-09 14:00:00','2026-04-10 15:30:00'),
(1,  16, 1,  N'Hoàn thành', N'Kiểm tra sức khỏe định kỳ',             '2026-04-10 14:00:00','2026-04-09 15:00:00','2026-04-10 16:00:00'),
(3,  17, 2,  N'Hoàn thành', N'Đau bụng quanh rốn từng cơn',           '2026-04-10 14:30:00','2026-04-09 16:00:00','2026-04-10 16:30:00'),
(6,  18, 5,  N'Hoàn thành', N'Phù chân, khó thở khi nằm',             '2026-04-11 08:30:00','2026-04-09 17:00:00','2026-04-11 10:30:00'),
(16, 19, 11, N'Hoàn thành', N'Tê tay phải, yếu cơ',                    '2026-04-11 09:00:00','2026-04-10 08:00:00','2026-04-11 11:00:00'),
(21, 20, 14, N'Hoàn thành', N'Khò khè khi thay đổi thời tiết',         '2026-04-11 09:30:00','2026-04-10 09:00:00','2026-04-11 11:30:00'),
(26, 21, 17, N'Hoàn thành', N'Tăng đường huyết, khát nhiều uống nhiều','2026-04-11 10:00:00','2026-04-10 10:00:00','2026-04-11 12:00:00'),
(44, 22, 28, N'Hoàn thành', N'Đau bụng dưới, ra khí hư bất thường',   '2026-04-11 10:30:00','2026-04-10 11:00:00','2026-04-11 12:30:00'),
(49, 23, 31, N'Hoàn thành', N'Trẻ viêm tai giữa tái phát',             '2026-04-11 13:30:00','2026-04-10 14:00:00','2026-04-11 15:30:00'),
(54, 24, 36, N'Hoàn thành', N'Đau lưng sau khi nâng vật nặng',         '2026-04-11 14:00:00','2026-04-10 15:00:00','2026-04-11 16:00:00'),
(63, 25, 42, N'Hoàn thành', N'Nhìn mờ một mắt',                        '2026-04-14 08:30:00','2026-04-11 08:00:00','2026-04-14 10:30:00'),
(66, 26, 44, N'Hoàn thành', N'Nghe kém, ù tai',                        '2026-04-14 09:00:00','2026-04-11 09:00:00','2026-04-14 11:00:00'),
(69, 27, 46, N'Hoàn thành', N'Đau răng, sưng nướu',                    '2026-04-14 09:30:00','2026-04-11 10:00:00','2026-04-14 11:30:00'),
(72, 28, 47, N'Hoàn thành', N'Đau vai sau tai nạn giao thông',          '2026-04-14 10:00:00','2026-04-11 11:00:00','2026-04-14 12:00:00'),
(76, 29, 50, N'Hoàn thành', N'Ngứa ngoài da, nổi mề đay',              '2026-04-14 10:30:00','2026-04-11 14:00:00','2026-04-14 12:30:00'),
(1,  30, 1,  N'Hoàn thành', N'Đau đầu, chóng mặt thường xuyên',       '2026-04-14 13:30:00','2026-04-12 08:00:00','2026-04-14 15:30:00'),
(2,  31, 1,  N'Hoàn thành', N'Huyết áp cao, theo dõi định kỳ',         '2026-04-14 14:00:00','2026-04-12 09:00:00','2026-04-14 16:00:00'),
(6,  32, 5,  N'Hoàn thành', N'Nhịp tim nhanh, đánh trống ngực',        '2026-04-14 14:30:00','2026-04-12 10:00:00','2026-04-14 16:30:00'),
(11, 33, 8,  N'Hoàn thành', N'Đau thượng vị, nôn sau ăn',              '2026-04-15 08:30:00','2026-04-12 11:00:00','2026-04-15 10:30:00'),
(16, 34, 11, N'Hoàn thành', N'Tê liệt nửa người sau đột quỵ',          '2026-04-15 09:00:00','2026-04-12 14:00:00','2026-04-15 11:00:00'),
(21, 35, 14, N'Hoàn thành', N'Khó thở khi nằm ngửa',                   '2026-04-15 09:30:00','2026-04-12 15:00:00','2026-04-15 11:30:00'),
(44, 36, 28, N'Hoàn thành', N'Khám thai tháng thứ 8, chuẩn bị sinh',   '2026-04-15 10:00:00','2026-04-13 08:00:00','2026-04-15 12:00:00'),
(49, 37, 31, N'Hoàn thành', N'Trẻ biếng ăn, chậm tăng cân',           '2026-04-15 10:30:00','2026-04-13 09:00:00','2026-04-15 12:30:00'),
(54, 38, 36, N'Hoàn thành', N'Gãy xương cổ tay cần kiểm tra',          '2026-04-15 13:30:00','2026-04-13 10:00:00','2026-04-15 15:30:00'),
(57, 39, 38, N'Hoàn thành', N'Thoát vị đĩa đệm cột sống thắt lưng',   '2026-04-15 14:00:00','2026-04-13 11:00:00','2026-04-15 16:00:00'),
(60, 40, 40, N'Hoàn thành', N'Hóa trị chu kỳ 3',                       '2026-04-15 14:30:00','2026-04-13 14:00:00','2026-04-15 16:30:00'),

-- ===== NGÀY 16/04 (Ngày hiện tại) =====
(1,  41, 1,  N'Đang khám',  N'Đau bụng quanh rốn',                     '2026-04-16 08:30:00','2026-04-14 08:00:00','2026-04-16 08:30:00'),
(2,  42, 1,  N'Đã xác nhận',N'Khó thở khi leo cầu thang',              '2026-04-16 09:00:00','2026-04-14 09:00:00','2026-04-15 10:00:00'),
(5,  43, 3,  N'Đã xác nhận',N'Đau dạ dày sau khi uống rượu',           '2026-04-16 09:30:00','2026-04-14 10:00:00','2026-04-15 11:00:00'),
(6,  44, 5,  N'Đã xác nhận',N'Đau tức ngực trái lan lên vai',           '2026-04-16 10:00:00','2026-04-14 11:00:00','2026-04-15 14:00:00'),
(7,  45, 5,  N'Chờ xác nhận',N'Huyết áp dao động thất thường',         '2026-04-16 10:30:00','2026-04-15 08:00:00', NULL),
(11, 46, 8,  N'Chờ xác nhận',N'Buồn nôn, đầy hơi liên tục',            '2026-04-16 13:30:00','2026-04-15 09:00:00', NULL),
(16, 47, 11, N'Đã xác nhận',N'Đau đầu dữ dội kèm nôn',                 '2026-04-16 14:00:00','2026-04-14 14:00:00','2026-04-15 16:00:00'),
(21, 48, 14, N'Đã xác nhận',N'Khò khè ban đêm ở trẻ 5 tuổi',           '2026-04-16 14:30:00','2026-04-14 15:00:00','2026-04-15 17:00:00'),
(26, 49, 17, N'Chờ xác nhận',N'Kiểm tra đường huyết định kỳ',           '2026-04-16 15:00:00','2026-04-15 10:00:00', NULL),
(44, 50, 28, N'Đã xác nhận',N'Khám thai tuần 32',                       '2026-04-16 15:30:00','2026-04-14 16:00:00','2026-04-15 09:00:00'),

-- ===== TUẦN SAU (17/04 – 25/04) =====
(3,  51, 2,  N'Đã xác nhận',N'Đau bụng âm ỉ vùng gan',                 '2026-04-17 08:30:00','2026-04-14 08:30:00','2026-04-15 08:00:00'),
(6,  52, 5,  N'Đã xác nhận',N'Khám theo dõi nhịp tim',                  '2026-04-17 09:00:00','2026-04-14 09:30:00','2026-04-15 09:00:00'),
(8,  53, 6,  N'Chờ xác nhận',N'Siêu âm tim định kỳ',                    '2026-04-17 09:30:00','2026-04-15 10:00:00', NULL),
(11, 54, 8,  N'Đã xác nhận',N'Viêm dạ dày mạn tính tái khám',           '2026-04-17 10:00:00','2026-04-14 11:00:00','2026-04-15 11:00:00'),
(16, 55, 11, N'Chờ xác nhận',N'Động kinh – tái khám sau 1 tháng',       '2026-04-17 10:30:00','2026-04-15 12:00:00', NULL),
(21, 56, 14, N'Đã xác nhận',N'Hen phế quản tái phát',                    '2026-04-17 13:30:00','2026-04-14 14:00:00','2026-04-15 14:00:00'),
(26, 57, 17, N'Chờ xác nhận',N'Tư vấn tiêm insulin',                    '2026-04-17 14:00:00','2026-04-15 15:00:00', NULL),
(44, 58, 28, N'Đã xác nhận',N'Ra huyết âm đạo bất thường',              '2026-04-17 14:30:00','2026-04-14 15:00:00','2026-04-15 15:00:00'),
(49, 59, 31, N'Chờ xác nhận',N'Trẻ phát ban toàn thân',                 '2026-04-17 15:00:00','2026-04-15 16:00:00', NULL),
(54, 60, 36, N'Chờ xác nhận',N'Đau xương chậu sau ngã',                  '2026-04-17 15:30:00','2026-04-15 17:00:00', NULL),
(1,  61, 1,  N'Đã xác nhận',N'Theo dõi huyết áp cao',                   '2026-04-18 08:30:00','2026-04-15 08:00:00','2026-04-16 08:00:00'),
(2,  62, 1,  N'Chờ xác nhận',N'Đau ngực khi nghỉ ngơi',                 '2026-04-18 09:00:00','2026-04-16 09:00:00', NULL),
(6,  63, 5,  N'Đã xác nhận',N'Tái khám sau đặt stent mạch vành',        '2026-04-18 09:30:00','2026-04-15 10:00:00','2026-04-16 10:00:00'),
(11, 64, 8,  N'Chờ xác nhận',N'Đau bụng dưới phải cấp',                 '2026-04-18 10:00:00','2026-04-16 11:00:00', NULL),
(16, 65, 11, N'Chờ xác nhận',N'Khám sau phẫu thuật u não',               '2026-04-18 10:30:00','2026-04-16 14:00:00', NULL),
(21, 66, 14, N'Đã xác nhận',N'Tắc nghẽn phổi mạn tính COPD',            '2026-04-18 13:30:00','2026-04-15 11:00:00','2026-04-16 15:00:00'),
(44, 67, 28, N'Chờ xác nhận',N'Khám sức khỏe tiền hôn nhân',            '2026-04-18 14:00:00','2026-04-16 15:00:00', NULL),
(49, 68, 31, N'Chờ xác nhận',N'Trẻ sốt xuất huyết nghi ngờ',            '2026-04-18 14:30:00','2026-04-16 16:00:00', NULL),
(54, 69, 36, N'Đã xác nhận',N'Viêm khớp gối mạn',                        '2026-04-18 15:00:00','2026-04-15 14:00:00','2026-04-16 17:00:00'),
(63, 70, 42, N'Chờ xác nhận',N'Mờ mắt tiến triển',                      '2026-04-18 15:30:00','2026-04-16 17:00:00', NULL),
(1,  71, 1,  N'Chờ xác nhận',N'Khó ngủ, mệt mỏi kéo dài',              '2026-04-21 08:30:00','2026-04-16 08:00:00', NULL),
(6,  72, 5,  N'Đã xác nhận',N'Nhịp tim chậm, khám lại',                 '2026-04-21 09:00:00','2026-04-16 09:00:00','2026-04-17 09:00:00'),
(11, 73, 8,  N'Chờ xác nhận',N'Đau thượng vị sau ăn',                   '2026-04-21 09:30:00','2026-04-17 10:00:00', NULL),
(16, 74, 11, N'Chờ xác nhận',N'Run tay chân, khám Parkinson',            '2026-04-21 10:00:00','2026-04-17 11:00:00', NULL),
(21, 75, 14, N'Đã xác nhận',N'Viêm phổi – tái khám sau 1 tuần',         '2026-04-21 10:30:00','2026-04-16 14:00:00','2026-04-17 14:00:00'),
(44, 76, 28, N'Chờ xác nhận',N'Siêu âm kiểm tra u nang buồng trứng',    '2026-04-21 13:30:00','2026-04-17 15:00:00', NULL),
(49, 77, 31, N'Chờ xác nhận',N'Trẻ chậm nói, khám phát triển',          '2026-04-21 14:00:00','2026-04-17 16:00:00', NULL),
(54, 78, 36, N'Đã xác nhận',N'Tái khám sau phẫu thuật thay khớp háng',  '2026-04-22 08:30:00','2026-04-16 10:00:00','2026-04-17 10:00:00'),
(57, 79, 38, N'Chờ xác nhận',N'Đau thắt lưng lan xuống chân',           '2026-04-22 09:00:00','2026-04-18 09:00:00', NULL),
(60, 80, 40, N'Đã xác nhận',N'Hóa trị chu kỳ 4',                        '2026-04-22 09:30:00','2026-04-16 11:00:00','2026-04-18 10:00:00')
GO


-- ── Tiếp APPOINTMENT (AP 81 – 120) ──────────────────────────
INSERT INTO APPOINTMENT (DrId, PId, CRId, APStatus, APReason, APDateTimes, APCreateAt, APUpdateAt) VALUES
(57, 81, 38, N'Chờ xác nhận', N'Đau thắt lưng lan xuống chân',            '2026-04-22 09:00:00','2026-04-18 09:00:00', NULL),
(60, 82, 40, N'Đã xác nhận',  N'Hóa trị chu kỳ 4',                        '2026-04-22 09:30:00','2026-04-16 11:00:00','2026-04-17 11:00:00'),
(63, 83, 42, N'Chờ xác nhận', N'Mắt đỏ, chảy nước mắt',                   '2026-04-22 10:00:00','2026-04-18 10:00:00', NULL),
(66, 84, 44, N'Đã xác nhận',  N'Viêm mũi dị ứng mạn tính',                '2026-04-22 10:30:00','2026-04-17 08:00:00','2026-04-18 08:00:00'),
(69, 85, 46, N'Chờ xác nhận', N'Nhổ răng khôn',                            '2026-04-22 13:30:00','2026-04-18 11:00:00', NULL),
(72, 86, 47, N'Chờ xác nhận', N'Tập phục hồi sau đột quỵ',                '2026-04-22 14:00:00','2026-04-18 14:00:00', NULL),
(76, 87, 50, N'Đã xác nhận',  N'Viêm da dị ứng tái phát',                  '2026-04-22 14:30:00','2026-04-17 10:00:00','2026-04-18 10:00:00'),
(1,  88, 1,  N'Chờ xác nhận', N'Đau bụng vùng hạ sườn phải',              '2026-04-23 08:30:00','2026-04-18 15:00:00', NULL),
(6,  89, 5,  N'Chờ xác nhận', N'Theo dõi sau cấy máy tạo nhịp',           '2026-04-23 09:00:00','2026-04-18 16:00:00', NULL),
(11, 90, 8,  N'Đã xác nhận',  N'Viêm loét đại tràng – tái khám',           '2026-04-23 09:30:00','2026-04-17 11:00:00','2026-04-18 11:00:00'),
(16, 91, 11, N'Chờ xác nhận', N'Mất ngủ kéo dài 3 tháng',                 '2026-04-23 10:00:00','2026-04-19 08:00:00', NULL),
(21, 92, 14, N'Chờ xác nhận', N'Khó thở khi nằm, phù chân',               '2026-04-23 10:30:00','2026-04-19 09:00:00', NULL),
(26, 93, 17, N'Đã xác nhận',  N'Kiểm tra HbA1c định kỳ',                   '2026-04-23 13:30:00','2026-04-17 14:00:00','2026-04-18 14:00:00'),
(44, 94, 28, N'Chờ xác nhận', N'Đau bụng kinh dữ dội',                     '2026-04-23 14:00:00','2026-04-19 10:00:00', NULL),
(49, 95, 31, N'Chờ xác nhận', N'Trẻ nôn trớ liên tục',                     '2026-04-23 14:30:00','2026-04-19 11:00:00', NULL),
(54, 96, 36, N'Đã xác nhận',  N'Đau khớp vai sau chấn thương',             '2026-04-24 08:30:00','2026-04-17 15:00:00','2026-04-18 15:00:00'),
(57, 97, 38, N'Chờ xác nhận', N'Cột sống cổ thoái hóa',                    '2026-04-24 09:00:00','2026-04-19 13:00:00', NULL),
(60, 98, 40, N'Đã xác nhận',  N'Tư vấn điều trị ung thư giai đoạn 2',     '2026-04-24 09:30:00','2026-04-17 16:00:00','2026-04-18 16:00:00'),
(63, 99, 42, N'Chờ xác nhận', N'Kiểm tra mắt cận thị tiến triển',          '2026-04-24 10:00:00','2026-04-20 08:00:00', NULL),
(66,100, 44, N'Chờ xác nhận', N'Polyp mũi tái phát',                        '2026-04-24 10:30:00','2026-04-20 09:00:00', NULL),
(1,  101,1,  N'Đã xác nhận',  N'Theo dõi sau xuất viện',                   '2026-04-25 08:30:00','2026-04-18 08:00:00','2026-04-19 08:00:00'),
(2,  102,1,  N'Chờ xác nhận', N'Đánh trống ngực khi nghỉ ngơi',           '2026-04-25 09:00:00','2026-04-21 09:00:00', NULL),
(6,  103,5,  N'Đã xác nhận',  N'Tái khám sau nhồi máu cơ tim',             '2026-04-25 09:30:00','2026-04-18 10:00:00','2026-04-19 10:00:00'),
(11, 104,8,  N'Chờ xác nhận', N'Đau bụng sau ăn đồ lạnh',                  '2026-04-25 10:00:00','2026-04-21 10:00:00', NULL),
(16, 105,11, N'Chờ xác nhận', N'Yếu cơ tứ chi tiến triển',                 '2026-04-25 10:30:00','2026-04-21 11:00:00', NULL),
(26, 106,17, N'Đã xác nhận',  N'Tư vấn biến chứng tiểu đường',             '2026-04-25 13:30:00','2026-04-18 14:00:00','2026-04-19 14:00:00'),
(44, 107,28, N'Chờ xác nhận', N'Siêu âm thai tuần 36',                     '2026-04-25 14:00:00','2026-04-21 14:00:00', NULL),
(49, 108,31, N'Chờ xác nhận', N'Trẻ chậm phát triển chiều cao',            '2026-04-25 14:30:00','2026-04-21 15:00:00', NULL);
GO

-- ── 7. MEDICAL_RECORD (40 hồ sơ cho APId 1–40 – tất cả Hoàn thành) ──
INSERT INTO MEDICAL_RECORD (DrId, PId, APId, MRDiagnosis, MRMethod, MRTestResult, MRVisitedDate, MRCreatedAt) VALUES
(1,  1,  1,  N'Viêm dạ dày cấp',                         N'Thuốc ức chế acid + kháng sinh diệt H.Pylori',        N'Nội soi: Viêm niêm mạc hang vị độ II, HP(+)',           '2026-04-09','2026-04-09 10:30:00'),
(2,  2,  2,  N'Viêm phế quản cấp',                        N'Kháng sinh, long đờm, nghỉ ngơi',                    N'X-quang phổi: Tăng đậm phế quản 2 bên',                 '2026-04-09','2026-04-09 11:00:00'),
(6,  3,  3,  N'Đau thắt ngực ổn định',                    N'Nitrate tác dụng ngắn + statin + aspirin',            N'ECG: ST chênh xuống V4-V5, Echo: EF 55%',               '2026-04-09','2026-04-09 11:30:00'),
(7,  4,  4,  N'Rung nhĩ cơn',                             N'Thuốc kiểm soát nhịp + chống đông',                  N'Holter ECG 24h: Rung nhĩ cơn kéo dài 3h',               '2026-04-09','2026-04-09 12:00:00'),
(11, 5,  5,  N'Loét dạ dày tá tràng',                     N'PPI liều cao + kháng sinh phác đồ 3 thuốc',           N'Nội soi: Ổ loét hành tá tràng D1, HP(+)',               '2026-04-09','2026-04-09 12:30:00'),
(12, 6,  6,  N'Trào ngược dạ dày thực quản (GERD)',        N'PPI, domperidone, thay đổi lối sống',                N'Nội soi: Viêm thực quản độ A theo LA',                  '2026-04-09','2026-04-09 15:30:00'),
(16, 7,  7,  N'Migraine có tiền triệu',                    N'Triptan + NSAIDs, phòng ngừa bằng propranolol',       N'MRI não: Không có tổn thương thực thể',                 '2026-04-09','2026-04-09 16:00:00'),
(21, 8,  8,  N'Hen phế quản bậc 3',                        N'ICS + LABA dạng hít, cắt cơn bằng SABA',             N'Spirometry: FEV1/FVC = 65%, test hồi phục (+)',         '2026-04-09','2026-04-09 16:30:00'),
(26, 9,  9,  N'Suy giáp tự miễn (Hashimoto)',              N'Levothyroxine thay thế, theo dõi TSH',                N'TSH=12.4 mIU/L, FT4 thấp, Anti-TPO(+)',                 '2026-04-09','2026-04-09 17:00:00'),
(44, 10, 10, N'Thai 26 tuần, thai kỳ nguy cơ thấp',       N'Bổ sung acid folic, sắt, canxi. Theo dõi định kỳ',   N'Siêu âm: Thai ổn, tim thai 148l/ph, ối đủ',             '2026-04-10','2026-04-10 10:30:00'),
(49, 11, 11, N'Sốt siêu vi – Viêm amidan cấp',            N'Hạ sốt, kháng sinh, súc miệng nước muối',            N'BC tăng 13.2G/L, CRP 32mg/L, cấy họng: S.pyogenes',    '2026-04-10','2026-04-10 11:00:00'),
(50, 12, 12, N'Tiêu chảy cấp do Rotavirus',               N'Bù dịch ORS, kẽm, men vi sinh',                      N'Test nhanh Rotavirus(+), soi phân: không có máu',       '2026-04-10','2026-04-10 11:30:00'),
(54, 13, 13, N'Rách dây chằng chéo trước gối phải',       N'Bất động, RICE, giảm đau NSAID, phẫu thuật nội soi', N'MRI gối: Rách hoàn toàn ACL, phù tủy xương',           '2026-04-10','2026-04-10 12:00:00'),
(57, 14, 14, N'Viêm mô tế bào – nhiễm trùng vết thương',  N'Kháng sinh IV, rửa vết thương, thay băng hàng ngày', N'BC 15.8G/L, cấy dịch: Staph.aureus nhạy oxacillin',    '2026-04-10','2026-04-10 12:30:00'),
(60, 15, 15, N'Ung thư vú giai đoạn IIA',                  N'Hóa trị AC x4, sau đó Taxol x4, đánh giá lại',       N'Sinh thiết: IDC grade 2, ER(+) PR(+) HER2(-)',          '2026-04-10','2026-04-10 15:30:00'),
(1,  16, 16, N'Tăng huyết áp độ I, chưa có biến chứng',   N'Amlodipine 5mg, thay đổi lối sống, tái khám 1 tháng',N'HA 152/94mmHg, ECG bình thường, creatinine bình thường','2026-04-10','2026-04-10 16:00:00'),
(3,  17, 17, N'Đau bụng do sỏi túi mật',                   N'NSAID, tư vấn phẫu thuật nội soi cắt túi mật',       N'Siêu âm bụng: Sỏi túi mật 1.2cm, thành dày',           '2026-04-10','2026-04-10 16:30:00'),
(6,  18, 18, N'Suy tim phân suất tống máu giảm (EF=35%)', N'Furosemide + ACEI + Beta-blocker + Spironolactone',   N'Echo: EF 35%, giãn thất trái, NT-proBNP 3200pg/mL',    '2026-04-11','2026-04-11 10:30:00'),
(16, 19, 19, N'Hội chứng ống cổ tay',                      N'Nẹp cổ tay đêm, corticoid tại chỗ, xem xét mổ',     N'EMG: Giảm tốc độ dẫn truyền thần kinh giữa phải',      '2026-04-11','2026-04-11 11:00:00'),
(21, 20, 20, N'Hen phế quản bậc 2',                        N'ICS liều thấp + SABA khi cần',                        N'PEFR đạt 72% dự đoán, test dị nguyên(+) mạt bụi nhà', '2026-04-11','2026-04-11 11:30:00'),
(26, 21, 21, N'Đái tháo đường type 2 mới phát hiện',       N'Metformin 500mg x2, tư vấn chế độ ăn, tập thể dục',  N'HbA1c 9.2%, glucose đói 11.4mmol/L, lipid tăng nhẹ',  '2026-04-11','2026-04-11 12:00:00'),
(44, 22, 22, N'Viêm âm đạo do Candida',                    N'Fluconazole 150mg liều duy nhất + đặt thuốc tại chỗ', N'Soi tươi: Nấm Candida(+), pH âm đạo 4.0',              '2026-04-11','2026-04-11 12:30:00'),
(49, 23, 23, N'Viêm tai giữa cấp tính',                    N'Amoxicillin 7 ngày, nhỏ tai, giảm đau',               N'Nội soi tai: Màng nhĩ đục, căng phồng, sung huyết',    '2026-04-11','2026-04-11 15:30:00'),
(54, 24, 24, N'Thoát vị đĩa đệm L4-L5',                    N'NSAID, giãn cơ, vật lý trị liệu, có thể xem xét PT', N'MRI cột sống: Thoát vị đĩa đệm L4-L5 chèn rễ S1 (P)',  '2026-04-11','2026-04-11 16:00:00'),
(63, 25, 25, N'Viêm kết mạc dị ứng',                       N'Nhỏ mắt kháng histamine + nhỏ nước mắt nhân tạo',    N'Khám đèn khe:乳头 nhú gai, không loét giác mạc',      '2026-04-14','2026-04-14 10:30:00'),
(66, 26, 26, N'Điếc tiếp âm tần số cao – Presbycusis',    N'Tư vấn máy trợ thính, hạn chế tiếng ồn',             N'Audiogram: Ngưỡng nghe 55dB tần số 4000Hz',            '2026-04-14','2026-04-14 11:00:00'),
(69, 27, 27, N'Viêm quanh răng cấp – áp xe nha chu',       N'Rạch thoát mủ, kháng sinh, vệ sinh răng miệng',       N'X-quang OPG: Tiêu xương ổ răng 46, áp xe vùng chóp',  '2026-04-14','2026-04-14 11:30:00'),
(72, 28, 28, N'Rách chóp xoay vai (Rotator Cuff Tear)',    N'Vật lý trị liệu, NSAID, xem xét phẫu thuật nội soi', N'MRI vai: Rách chóp xoay gân trên gai vai (P)',          '2026-04-14','2026-04-14 12:00:00'),
(76, 29, 29, N'Mề đay mạn tính',                            N'Kháng histamine H1 không an thần, tránh dị nguyên',   N'Test áp bì: (+) với phấn hoa, IgE tổng 420 IU/mL',    '2026-04-14','2026-04-14 12:30:00'),
(1,  30, 30, N'Chóng mặt tư thế lành tính (BPPV)',         N'Thủ thuật Epley, không dùng thuốc lâu dài',           N'Test Dix-Hallpike (+) bên phải',                        '2026-04-14','2026-04-14 15:30:00'),
(2,  31, 31, N'Tăng huyết áp độ II – cơn cao huyết áp',   N'Amlodipine + Losartan, hạ áp khẩn cấp bằng IV',      N'HA 178/106mmHg, Creatinine 1.4mg/dL, protein niệu (+)','2026-04-14','2026-04-14 16:00:00'),
(6,  32, 32, N'Nhịp nhanh thất trên (SVT)',                 N'Adenosine IV cắt cơn, Flecainide duy trì',            N'ECG: P bất thường, QRS hẹp, nhịp 180l/ph',             '2026-04-14','2026-04-14 16:30:00'),
(11, 33, 33, N'Viêm dạ dày mạn tính – Loét hang vị',       N'PPI dài ngày + kháng sinh diệt HP 14 ngày',           N'CLO test(+), Nội soi: Loét hang vị 0.8cm',             '2026-04-15','2026-04-15 10:30:00'),
(16, 34, 34, N'Di chứng đột quỵ nhồi máu não – Phục hồi', N'Phục hồi chức năng vận động, ngôn ngữ, chống tái phát',N'MRI não: Ổ nhồi máu cũ thùy trán-đỉnh (T), khu trú', '2026-04-15','2026-04-15 11:00:00'),
(21, 35, 35, N'Suy tim sung huyết mạn – EF giảm',          N'Tối ưu hóa thuốc, hạn chế muối, theo dõi cân nặng',  N'NT-proBNP 5400, Echo: EF 30%, tràn dịch màng phổi ít','2026-04-15','2026-04-15 11:30:00'),
(44, 36, 36, N'Thai 34 tuần – Tiền sản giật nhẹ',          N'MgSO4 phòng co giật, Methyldopa hạ áp, nhập viện',   N'HA 148/96, Protein niệu 24h: 0.5g, PLT bình thường',  '2026-04-15','2026-04-15 12:00:00'),
(49, 37, 37, N'Còi xương – Thiếu Vitamin D',               N'Vitamin D3 liều cao 4 tuần, canxi, ánh nắng mặt trời',N'25-OH VitD = 8ng/mL (thấp), ALP tăng 320U/L',         '2026-04-15','2026-04-15 12:30:00'),
(54, 38, 38, N'Gãy đầu dưới xương quay không di lệch',     N'Bó bột cẳng tay tròn 6 tuần, giảm đau',               N'X-quang: Gãy không di lệch đầu dưới xương quay (P)',   '2026-04-15','2026-04-15 15:30:00'),
(57, 39, 39, N'Thoát vị đĩa đệm L5-S1 có chèn ép rễ',     N'NSAID + giãn cơ + vật lý trị liệu 4 tuần, xem xét mổ',N'MRI: Thoát vị đĩa đệm L5-S1 chèn rễ S1 (T) nặng',   '2026-04-15','2026-04-15 16:00:00'),
(60, 40, 40, N'Ung thư đại trực tràng giai đoạn III – Hóa trị',N'FOLFOX x 8 chu kỳ, đánh giá sau 4 chu kỳ',      N'CEA 45ng/mL, CT bụng: Hạch mạc treo (+), không di căn xa','2026-04-15','2026-04-15 16:30:00');
GO

-- ── 8. PRESCRIPTION (40 đơn thuốc – MRId 1–40) ─────────────
INSERT INTO PRESCRIPTION (MRId, PRDoctorNote, PRCreatedAt) VALUES
(1,  N'Uống thuốc đúng giờ sau ăn. Tái khám sau 4 tuần hoặc khi triệu chứng nặng hơn.',    '2026-04-09 10:45:00'),
(2,  N'Uống đủ nước, nghỉ ngơi. Tái khám ngay nếu khó thở hoặc sốt trên 39°C.',            '2026-04-09 11:15:00'),
(3,  N'Kiêng muối, mỡ động vật. Tập nhẹ mỗi ngày 30 phút. Tái khám 1 tháng.',              '2026-04-09 11:45:00'),
(4,  N'Uống thuốc đều đặn, không bỏ liều. Đo nhịp tim hàng ngày. Tái khám 2 tuần.',        '2026-04-09 12:15:00'),
(5,  N'Ăn nhỏ nhiều bữa, tránh đồ cay chua. Không uống rượu bia. Tái khám 4 tuần.',        '2026-04-09 12:45:00'),
(6,  N'Nâng đầu giường 15cm. Không ăn 3h trước khi ngủ. Tái khám 1 tháng.',                '2026-04-09 15:45:00'),
(7,  N'Tránh ánh sáng mạnh, tiếng ồn lớn khi có cơn đau. Ngủ đủ giấc. Tái khám 1 tháng.', '2026-04-09 16:15:00'),
(8,  N'Mang theo ống hít cắt cơn bên người. Tránh khói bụi, lạnh. Tái khám 1 tháng.',      '2026-04-09 16:45:00'),
(9,  N'Uống thuốc cùng giờ mỗi ngày. Tái khám kiểm tra TSH sau 6 tuần.',                   '2026-04-09 17:15:00'),
(10, N'Bổ sung acid folic 5mg/ngày. Tái khám sản khoa sau 4 tuần.',                         '2026-04-10 10:45:00'),
(11, N'Cho trẻ uống đủ nước, súc họng nước muối. Không dùng aspirin cho trẻ em.',           '2026-04-10 11:15:00'),
(12, N'Bù nước bằng ORS sau mỗi lần đi ngoài. Không dùng cầm tiêu chảy.',                  '2026-04-10 11:45:00'),
(13, N'Bất động khớp gối, chườm đá. Không chịu lực. Tái khám phẫu thuật sau 2 tuần.',      '2026-04-10 12:15:00'),
(14, N'Rửa vết thương bằng nước muối sinh lý 2 lần/ngày. Không tự ý băng kín.',             '2026-04-10 12:45:00'),
(15, N'Nghỉ ngơi sau truyền hóa chất. Uống đủ nước, ăn giàu đạm. Tái khám 3 tuần.',        '2026-04-10 15:45:00'),
(16, N'Hạn chế muối < 5g/ngày. Tập aerobic 30 phút/ngày. Đo HA tại nhà sáng tối.',         '2026-04-10 16:15:00'),
(17, N'Ăn nhạt, ít dầu mỡ. Tránh nhịn đói. Tái khám sau 4 tuần, xem xét mổ.',             '2026-04-10 16:45:00'),
(18, N'Cân nặng mỗi sáng, ghi lại. Nếu tăng > 2kg trong 2 ngày, đến khám ngay.',           '2026-04-11 10:45:00'),
(19, N'Đeo nẹp ban đêm ít nhất 8 tiếng. Không gõ nhiều bàn phím. Tái khám 1 tháng.',       '2026-04-11 11:15:00'),
(20, N'Xịt thuốc đúng kỹ thuật. Tránh dị nguyên. Tái khám 2 tháng.',                       '2026-04-11 11:45:00'),
(21, N'Kiêng đường, tinh bột trắng. Đi bộ 30 phút/ngày. Tái khám kiểm tra HbA1c sau 3 tháng.',N'2026-04-11 12:15:00'),
(22, N'Mặc đồ lót cotton, thoáng. Tái khám sau 1 tuần nếu không hết triệu chứng.',         '2026-04-11 12:45:00'),
(23, N'Cho trẻ uống đủ thuốc, không bỏ liều. Không để nước vào tai khi tắm.',              '2026-04-11 15:45:00'),
(24, N'Nằm giường phẳng, không gối cao. Tập kéo giãn cơ lưng nhẹ. Tái khám 1 tháng.',     '2026-04-11 16:15:00'),
(25, N'Nhỏ mắt đúng cách, không dụi mắt. Đeo kính chống nắng. Tái khám 2 tuần.',           '2026-04-14 10:45:00'),
(26, N'Tư vấn máy trợ thính. Tái khám kiểm tra thính lực sau 3 tháng.',                    '2026-04-14 11:15:00'),
(27, N'Súc miệng nước muối 3 lần/ngày. Không hút thuốc. Tái khám nha chu sau 1 tuần.',     '2026-04-14 11:45:00'),
(28, N'Treo tay cao khi ngủ. Tập vật lý trị liệu vai. Tái khám 1 tháng.',                  '2026-04-14 12:15:00'),
(29, N'Tránh tiếp xúc dị nguyên. Ghi nhật ký triệu chứng. Tái khám 1 tháng.',              '2026-04-14 12:45:00'),
(30, N'Tránh thay đổi tư thế đột ngột. Thực hiện bài tập Epley tại nhà 3 lần/ngày.',       '2026-04-14 15:45:00'),
(31, N'Đo huyết áp 2 lần/ngày, ghi lại. Hạn chế muối, căng thẳng. Tái khám 2 tuần.',      '2026-04-14 16:15:00'),
(32, N'Tránh caffeine, rượu bia. Theo dõi nhịp tim tại nhà. Tái khám 1 tháng.',             '2026-04-14 16:45:00'),
(33, N'Ăn chín uống sôi. Không dùng NSAID, rượu bia. Tái khám kiểm tra HP sau 4 tuần.',   '2026-04-15 10:45:00'),
(34, N'Tập vật lý trị liệu đều đặn mỗi ngày. Không bỏ tập. Tái khám thần kinh 1 tháng.', '2026-04-15 11:15:00'),
(35, N'Cân nặng hàng ngày. Hạn chế nước < 1.5L/ngày nếu phù. Nhập viện nếu khó thở tăng.','2026-04-15 11:45:00'),
(36, N'Nằm nghiêng trái, nghỉ ngơi. Theo dõi thai máy, HA. Tái khám sản 1 tuần.',          '2026-04-15 12:15:00'),
(37, N'Cho trẻ ra nắng sáng 15-20 phút/ngày. Bổ sung thêm canxi từ sữa.',                  '2026-04-15 12:45:00'),
(38, N'Không để ướt bột. Nâng tay cao khi ngồi, nằm. Tái khám X-quang sau 3 tuần.',        '2026-04-15 15:45:00'),
(39, N'Nằm phẳng, đi lại nhẹ nhàng. Tránh nâng vật nặng, cúi gập người. Tái khám 1 tháng.',N'2026-04-15 16:15:00'),
(40, N'Uống nhiều nước, ăn giàu chất xơ. Theo dõi CEA sau 3 chu kỳ hóa trị. Tái khám 3 tuần.',N'2026-04-15 16:45:00');
GO

-- ── 9. CATEGORY_MEDICINE (40 thuốc thực tế) ─────────────────
INSERT INTO CATEGORY_MEDICINE (CMName, CMStockQuantity, CMPrice, CMNote) VALUES
-- Tiêu hóa
(N'Omeprazole 20mg',           500, 2500,  N'Ức chế bơm proton, trị loét dạ dày'),
(N'Esomeprazole 40mg',         400, 4500,  N'PPI thế hệ mới, viêm thực quản trào ngược'),
(N'Domperidone 10mg',          500, 1500,  N'Chống nôn, tăng nhu động ruột'),
(N'Metronidazole 500mg',       300, 2000,  N'Kháng sinh diệt H.Pylori và kỵ khí'),
(N'Clarithromycin 500mg',      250, 5500,  N'Kháng sinh macrolide, phác đồ diệt HP'),
(N'Mesalazine 400mg',          200, 8000,  N'Viêm đại tràng, bệnh Crohn'),
-- Tim mạch
(N'Amlodipine 5mg',            600, 1200,  N'Chẹn kênh canxi, hạ huyết áp'),
(N'Losartan 50mg',             500, 3500,  N'Ức chế thụ thể Angiotensin, hạ HA'),
(N'Bisoprolol 5mg',            400, 2800,  N'Chẹn beta chọn lọc, suy tim, tăng HA'),
(N'Furosemide 40mg',           600, 800,   N'Lợi tiểu quai, phù, suy tim'),
(N'Spironolactone 25mg',       300, 2000,  N'Lợi tiểu giữ kali, suy tim'),
(N'Aspirin 81mg',              800, 800,   N'Chống kết tập tiểu cầu'),
(N'Atorvastatin 10mg',         500, 5000,  N'Hạ mỡ máu nhóm statin'),
(N'Isosorbide dinitrate 5mg',  300, 3500,  N'Giãn mạch vành, đau thắt ngực'),
(N'Flecainide 100mg',          150, 12000, N'Chống loạn nhịp nhóm IC'),
(N'Digoxin 0.25mg',            200, 1500,  N'Glycoside tim, rung nhĩ, suy tim'),
-- Hô hấp
(N'Salbutamol 100mcg MDI',     400, 45000, N'SABA, cắt cơn hen và COPD'),
(N'Budesonide/Formoterol MDI', 250, 180000,N'ICS+LABA, kiểm soát hen, COPD'),
(N'Montelukast 10mg',          300, 6500,  N'Kháng leukotriene, hen dị ứng'),
(N'Ambroxol 30mg',             400, 1200,  N'Long đờm, giảm nhớt đờm'),
-- Thần kinh
(N'Sumatriptan 50mg',          200, 25000, N'Triptan, cắt cơn migraine'),
(N'Propranolol 40mg',          350, 1800,  N'Phòng migraine, hồi hộp'),
(N'Pregabalin 75mg',           250, 8000,  N'Đau thần kinh, động kinh'),
(N'Baclofen 10mg',             200, 3500,  N'Giãn cơ trung ương, co cứng cơ'),
-- Nội tiết
(N'Metformin 500mg',           700, 1500,  N'Biguanide, hạ đường huyết ĐTĐ type 2'),
(N'Levothyroxine 50mcg',       400, 3000,  N'Hormone giáp thay thế'),
(N'Glibenclamide 5mg',         300, 1200,  N'Sulfonylurea, kích thích tiết insulin'),
(N'Insulin Glargine 100U/mL',  100, 250000,N'Insulin nền tác dụng kéo dài 24h'),
-- Xương khớp / Giảm đau
(N'Diclofenac 50mg',           600, 3000,  N'NSAID, giảm đau kháng viêm'),
(N'Celecoxib 200mg',           300, 6000,  N'NSAID COX-2 chọn lọc, ít hại dạ dày'),
(N'Paracetamol 500mg',        1000, 500,   N'Hạ sốt giảm đau, an toàn cho mọi đối tượng'),
(N'Etoricoxib 60mg',           250, 8500,  N'NSAID, thoái hóa khớp, viêm khớp dạng thấp'),
(N'Methylprednisolone 16mg',   200, 5000,  N'Corticoid, kháng viêm mạnh'),
-- Kháng sinh / Kháng nấm
(N'Amoxicillin 500mg',         500, 2000,  N'Kháng sinh nhóm penicillin phổ rộng'),
(N'Azithromycin 500mg',        350, 8000,  N'Macrolide, viêm phổi, họng, tai'),
(N'Fluconazole 150mg',         250, 15000, N'Kháng nấm, Candida âm đạo'),
-- Sản khoa / Nhi
(N'Acid folic 5mg',            600, 500,   N'Phòng dị tật ống thần kinh thai nhi'),
(N'Ferrous Fumarate 200mg',    500, 1200,  N'Bổ sung sắt cho bà mẹ mang thai'),
(N'Calcium 600mg + Vit D3',    600, 2000,  N'Bổ sung canxi và vitamin D'),
(N'Vitamin D3 50000 IU',       200, 35000, N'Điều trị thiếu Vitamin D');
GO

-- ── 10. PRESCRIPTION_DETAIL (~100 records) ─────────────────
-- PRId 1 – Viêm dạ dày H.Pylori
INSERT INTO PRESCRIPTION_DETAIL (PRId,CMId,PDUnitPrice,PDQuantity,PDDuration,PDGuide) VALUES
(1,  1, 2500,  28, 14, N'1 viên x 2 lần/ngày, trước ăn 30 phút'),
(1,  4, 2000,  28, 14, N'1 viên x 2 lần/ngày, sau ăn'),
(1,  5, 5500,  28, 14, N'1 viên x 2 lần/ngày, sau ăn'),
-- PRId 2 – Viêm phế quản
(2, 34, 2000,  21,  7, N'1 viên x 3 lần/ngày, sau ăn'),
(2, 20, 1200,  21,  7, N'1 viên x 3 lần/ngày, sau ăn'),
(2, 31,  500,  15,  5, N'1-2 viên khi sốt trên 38.5°C, cách 4-6 giờ'),
-- PRId 3 – Đau thắt ngực
(3, 14, 3500,  30, 30, N'1 viên ngậm dưới lưỡi khi đau ngực'),
(3, 12,  800,  30, 30, N'1 viên/ngày sau ăn sáng'),
(3, 13, 5000,  30, 30, N'1 viên/ngày, buổi tối'),
(3,  7, 1200,  30, 30, N'1 viên/ngày, buổi sáng'),
-- PRId 4 – Rung nhĩ
(4,  9, 2800,  30, 30, N'1 viên/ngày, uống đúng giờ'),
(4, 15,12000,  30, 30, N'1 viên x 2 lần/ngày, sau ăn'),
(4, 12,  800,  30, 30, N'1 viên/ngày, buổi sáng'),
-- PRId 5 – Loét dạ dày tá tràng
(5,  2, 4500,  56, 28, N'1 viên/ngày, trước ăn 30 phút'),
(5,  4, 2000,  28, 14, N'1 viên x 2 lần/ngày, sau ăn'),
(5,  5, 5500,  28, 14, N'1 viên x 2 lần/ngày, sau ăn'),
-- PRId 6 – GERD
(6,  1, 2500,  28, 14, N'1 viên/ngày trước ăn sáng 30 phút'),
(6,  3, 1500,  21,  7, N'1 viên x 3 lần/ngày trước ăn 15 phút'),
-- PRId 7 – Migraine
(7, 21,25000,   5,  5, N'1 viên uống khi có cơn, tối đa 2 viên/ngày'),
(7, 22, 1800,  30, 30, N'1 viên x 2 lần/ngày, phòng ngừa'),
-- PRId 8 – Hen phế quản bậc 3
(8, 17,45000,   1, 30, N'2 nhát xịt khi khó thở, tối đa 8 nhát/ngày'),
(8, 18,180000,  1, 30, N'2 nhát xịt x 2 lần/ngày sáng tối, đều đặn'),
(8, 19, 6500,  30, 30, N'1 viên/ngày buổi tối'),
-- PRId 9 – Suy giáp Hashimoto
(9, 26, 3000,  30, 30, N'1 viên/ngày, uống lúc bụng đói trước ăn 30 phút'),
-- PRId 10 – Thai kỳ 26 tuần
(10,37,  500,  90, 90, N'1 viên/ngày sau ăn sáng'),
(10,38, 1200,  60, 60, N'1 viên/ngày sau ăn trưa'),
(10,39, 2000,  60, 60, N'1 viên/ngày sau ăn tối'),
-- PRId 11 – Viêm amidan cấp (trẻ em)
(11,34, 2000,  21,  7, N'1 viên x 3 lần/ngày sau ăn'),
(11,31,  500,  15,  5, N'1 viên khi sốt trên 38.5°C'),
-- PRId 12 – Tiêu chảy Rotavirus (trẻ em)
(12,31,  500,   9,  3, N'1 viên x 3 lần/ngày khi sốt'),
-- PRId 13 – Rách dây chằng ACL
(13,29, 3000,  14,  7, N'1 viên x 2 lần/ngày sau ăn'),
(13,31,  500,  10,  5, N'1-2 viên khi đau, tối đa 8 viên/ngày'),
-- PRId 14 – Nhiễm trùng vết thương
(14,34, 2000,  21,  7, N'1 viên x 3 lần/ngày sau ăn'),
(14,31,  500,  15,  5, N'1-2 viên khi đau hoặc sốt'),
-- PRId 15 – Ung thư vú (hóa trị)
(15,31,  500,  30, 30, N'1-2 viên khi đau, tối đa 8 viên/ngày'),
-- PRId 16 – Tăng huyết áp độ I
(16, 7, 1200,  30, 30, N'1 viên/ngày buổi sáng'),
-- PRId 17 – Sỏi túi mật
(17,29, 3000,  10,  5, N'1 viên x 2 lần/ngày sau ăn khi đau'),
-- PRId 18 – Suy tim EF giảm
(18, 9, 2800,  30, 30, N'1 viên/ngày buổi sáng'),
(18, 8, 3500,  30, 30, N'1 viên/ngày buổi sáng'),
(18,10,  800,  30, 30, N'1 viên/ngày buổi sáng'),
(18,11, 2000,  30, 30, N'1 viên/ngày sau ăn tối'),
-- PRId 19 – Hội chứng ống cổ tay
(19,29, 3000,  10,  5, N'1 viên x 2 lần/ngày sau ăn khi đau'),
-- PRId 20 – Hen bậc 2
(20,17,45000,   1, 30, N'2 nhát xịt khi khó thở, tối đa 8 nhát/ngày'),
(20,19, 6500,  30, 30, N'1 viên/ngày buổi tối'),
-- PRId 21 – ĐTĐ type 2
(21,25, 1500,  60, 30, N'1 viên x 2 lần/ngày sau ăn sáng tối'),
-- PRId 22 – Viêm âm đạo Candida
(22,36,15000,   1,  1, N'Uống 1 viên duy nhất'),
-- PRId 23 – Viêm tai giữa trẻ em
(23,35, 8000,  21,  7, N'1 viên/ngày sau ăn'),
(23,31,  500,   9,  3, N'1 viên khi sốt trên 38.5°C'),
-- PRId 24 – Thoát vị đĩa đệm L4-L5
(24,30, 6000,  14,  7, N'1 viên/ngày sau ăn'),
(24,24, 3500,  14,  7, N'1 viên x 2 lần/ngày trước khi ngủ và buổi sáng'),
-- PRId 25 – Viêm kết mạc dị ứng
(25,29, 3000,   6,  3, N'1 viên/ngày sau ăn khi ngứa nhiều'),
-- PRId 26 – Điếc tiếp âm (Presbycusis) – không kê thuốc chính, tư vấn
(26,31,  500,   5,  5, N'1 viên khi đau đầu, chóng mặt'),
-- PRId 27 – Viêm quanh răng – áp xe
(27,34, 2000,  14,  7, N'1 viên x 2 lần/ngày sau ăn'),
(27,31,  500,  10,  5, N'1-2 viên khi đau, cách 6 giờ'),
-- PRId 28 – Rách chóp xoay vai
(28,29, 3000,  14,  7, N'1 viên x 2 lần/ngày sau ăn'),
(28,31,  500,  14,  7, N'1-2 viên khi đau nhiều'),
-- PRId 29 – Mề đay mạn
(29,19, 6500,  30, 30, N'1 viên/ngày buổi tối'),
-- PRId 30 – BPPV
(30,31,  500,   5,  3, N'1 viên khi chóng mặt nặng'),
-- PRId 31 – THA độ II
(31, 7, 1200,  30, 30, N'1 viên/ngày buổi sáng'),
(31, 8, 3500,  30, 30, N'1 viên/ngày buổi sáng'),
-- PRId 32 – SVT
(32,15,12000,  30, 30, N'1 viên x 2 lần/ngày sau ăn'),
-- PRId 33 – Loét hang vị
(33, 2, 4500,  56, 28, N'1 viên/ngày trước ăn sáng 30 phút'),
(33, 4, 2000,  28, 14, N'1 viên x 2 lần/ngày sau ăn'),
(33, 5, 5500,  28, 14, N'1 viên x 2 lần/ngày sau ăn'),
-- PRId 34 – Di chứng đột quỵ
(34,12,  800,  30, 30, N'1 viên/ngày buổi sáng – phòng tái phát'),
(34,13, 5000,  30, 30, N'1 viên/ngày buổi tối'),
-- PRId 35 – Suy tim mạn
(35, 9, 2800,  30, 30, N'1 viên/ngày buổi sáng'),
(35,10,  800,  30, 30, N'1 viên/ngày buổi sáng'),
(35, 8, 3500,  30, 30, N'1 viên/ngày buổi sáng'),
-- PRId 36 – Tiền sản giật nhẹ
(36,31,  500,  30, 30, N'2 viên x 4 lần/ngày khi đau đầu'),
-- PRId 37 – Còi xương thiếu Vit D (trẻ em)
(37,40,35000,   4,  4, N'1 viên/tuần x 4 tuần (uống vào buổi sáng)'),
(37,39, 2000,  60, 60, N'1 viên/ngày sau ăn'),
-- PRId 38 – Gãy đầu dưới xương quay
(38,31,  500,  15,  5, N'1-2 viên khi đau, cách 6 giờ'),
(38,29, 3000,   7,  7, N'1 viên/ngày sau ăn (7 ngày đầu)'),
-- PRId 39 – Thoát vị đĩa đệm L5-S1
(39,30, 6000,  14,  7, N'1 viên/ngày sau ăn'),
(39,24, 3500,  14,  7, N'1 viên x 2 lần/ngày'),
(39,29, 3000,  14,  7, N'1 viên x 2 lần/ngày sau ăn'),
-- PRId 40 – Ung thư đại trực tràng
(40,31,  500,  60, 30, N'1-2 viên khi đau, tối đa 8 viên/ngày');
GO

-- ── 11. INVOICE (40 hóa đơn cho APId 1–40) ─────────────────
-- Tính INTotalPrice = tổng (PDUnitPrice * PDQuantity) của từng đơn
INSERT INTO INVOICE (APId, PRId, INTotalPrice, INPaymentMethod, INStatus, INPaidDate) VALUES
(1,  1,  196000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-09 11:00:00'),
(2,  2,   86500,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-09 11:30:00'),
(3,  3,  324000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-09 12:00:00'),
(4,  4,  564000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-09 12:30:00'),
(5,  5,  448000,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-09 13:00:00'),
(6,  6,   80500,  N'Tiền mặt',     N'Đã thanh toán','2026-04-09 16:00:00'),
(7,  7,  179000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-09 16:30:00'),
(8,  8,  231500,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-09 17:00:00'),
(9,  9,   90000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-09 17:30:00'),
(10, 10, 208000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-10 11:00:00'),
(11, 11,  64500,  N'Tiền mặt',     N'Đã thanh toán','2026-04-10 11:30:00'),
(12, 12,   4500,  N'Tiền mặt',     N'Đã thanh toán','2026-04-10 12:00:00'),
(13, 13,  47000,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-10 12:30:00'),
(14, 14,  49500,  N'Tiền mặt',     N'Đã thanh toán','2026-04-10 13:00:00'),
(15, 15,  15000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-10 16:00:00'),
(16, 16,  36000,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-10 16:30:00'),
(17, 17,  30000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-10 17:00:00'),
(18, 18, 306000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-11 11:00:00'),
(19, 19,  30000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-11 11:30:00'),
(20, 20,  51500,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-11 12:00:00'),
(21, 21,  90000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-11 12:30:00'),
(22, 22,  15000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-11 13:00:00'),
(23, 23,  68500,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-11 16:00:00'),
(24, 24, 133000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-11 16:30:00'),
(25, 25,  18000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-14 11:00:00'),
(26, 26,   2500,  N'Tiền mặt',     N'Đã thanh toán','2026-04-14 11:30:00'),
(27, 27,  33000,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-14 12:00:00'),
(28, 28,  47000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-14 12:30:00'),
(29, 29,  195000, N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-14 13:00:00'),
(30, 30,   2500,  N'Tiền mặt',     N'Đã thanh toán','2026-04-14 16:00:00'),
(31, 31,  141000, N'Chuyển khoản', N'Đã thanh toán','2026-04-14 16:30:00'),
(32, 32,  360000, N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-14 17:00:00'),
(33, 33,  448000, N'Chuyển khoản', N'Đã thanh toán','2026-04-15 11:00:00'),
(34, 34,  174000, N'Tiền mặt',     N'Đã thanh toán','2026-04-15 11:30:00'),
(35, 35,  231000, N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-15 12:00:00'),
(36, 36,  15000,  N'Tiền mặt',     N'Đã thanh toán','2026-04-15 12:30:00'),
(37, 37,  260000, N'Chuyển khoản', N'Đã thanh toán','2026-04-15 13:00:00'),
(38, 38,  28500,  N'Thẻ ngân hàng',N'Đã thanh toán','2026-04-15 16:00:00'),
(39, 39,  182000, N'Tiền mặt',     N'Đã thanh toán','2026-04-15 16:30:00'),
(40, 40,  30000,  N'Chuyển khoản', N'Đã thanh toán','2026-04-15 17:00:00');
GO

-- ── 12. INVOICE_DETAIL (40 records – phân chia BHYT/BN/thuốc) ──
-- Quy ước: BHYT chi trả 80% phí khám (50.000đ/lượt),
--          BN tự trả phần còn lại + 20% phí khám
--          INDMedicinePrice = tổng tiền thuốc trong đơn
INSERT INTO INVOICE_DETAIL (INId, INDPatientPaid, INDMedicinePrice, INDInsurancePaid) VALUES
(1,  166000, 196000,  40000),
(2,   66500,  86500,  40000),
(3,  284000, 324000,  40000),
(4,  524000, 564000,  40000),
(5,  408000, 448000,  40000),
(6,   50500,  80500,  40000),
(7,  139000, 179000,  40000),
(8,  191500, 231500,  40000),
(9,   50000,  90000,  40000),
(10, 168000, 208000,  40000),
(11,  24500,  64500,  40000),
(12,       0,  4500,  40000),
(13,  17000,  47000,  40000),
(14,  19500,  49500,  40000),
(15,       0,  15000,  40000),
(16,   6000,  36000,  40000),
(17,       0,  30000,  40000),
(18, 266000, 306000,  40000),
(19,       0,  30000,  40000),
(20,  11500,  51500,  40000),
(21,  50000,  90000,  40000),
(22,       0,  15000,  40000),
(23,  28500,  68500,  40000),
(24,  93000, 133000,  40000),
(25,       0,  18000,  40000),
(26,       0,   2500,  40000),
(27,       0,  33000,  40000),
(28,  17000,  47000,  40000),
(29, 155000, 195000,  40000),
(30,       0,   2500,  40000),
(31, 101000, 141000,  40000),
(32, 320000, 360000,  40000),
(33, 408000, 448000,  40000),
(34, 134000, 174000,  40000),
(35, 191000, 231000,  40000),
(36,       0,  15000,  40000),
(37, 220000, 260000,  40000),
(38,       0,  28500,  40000),
(39, 142000, 182000,  40000),
(40,       0,  30000,  40000);
