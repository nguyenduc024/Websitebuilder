USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'HEALTHLINK_DB')
BEGIN
    ALTER DATABASE HEALTHLINK_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HEALTHLINK_DB;
END
GO

CREATE DATABASE HEALTHLINK_DB;
GO

USE HEALTHLINK_DB;
GO

-- 1. Bảng Khoa (Department)
CREATE TABLE DEPARTMENT (
    DId INT PRIMARY KEY IDENTITY(1,1),
    DName NVARCHAR(100) NOT NULL,
    DStartDate DATE
);

-- 2. Bảng Bác sĩ (Doctor)
CREATE TABLE DOCTOR (
    DrId INT PRIMARY KEY IDENTITY(1,1),
    DrFirstName NVARCHAR(50) NOT NULL,
    DrMiddleName NVARCHAR(50),
    DrLastName NVARCHAR(50) NOT NULL,
    DrBirthday DATE,
    DrSex NVARCHAR(10),
    DrPhone VARCHAR(15),
    DrAddress NVARCHAR(200),
    DrSpecialty NVARCHAR(100),
    DId INT FOREIGN KEY REFERENCES DEPARTMENT(DId)
);
GO
-- Đảm bảo giới tính chỉ nằm trong các giá trị xác định
ALTER TABLE DOCTOR
ADD CONSTRAINT CHK_DrSex CHECK (DrSex IN (N'Nam', N'Nữ'));
-- Số điện thoại phải là duy nhất
ALTER TABLE DOCTOR
ADD CONSTRAINT UQ_DrPhone UNIQUE (DrPhone);
GO
--Ràng buộc khóa ngoại giữa bảng bác sĩ và bảng khoa: nếu xóa khoa, bác sĩ tạm thời để trống khoa (SET NULL)
ALTER TABLE DOCTOR
ADD CONSTRAINT FK_Doctor_Department FOREIGN KEY (DId) REFERENCES DEPARTMENT(DId) ON DELETE SET NULL;
GO

-- 3. Bảng Bệnh nhân (Patient)
CREATE TABLE PATIENT (
    PId INT PRIMARY KEY IDENTITY(1,1),
    PFirstName NVARCHAR(50) NOT NULL,
    PMiddleName NVARCHAR(50),
    PLastName NVARCHAR(50) NOT NULL,
    PBirthDate DATE,
    PSex NVARCHAR(10),
    PPhone VARCHAR(15),
    PAddress NVARCHAR(200),
    PInsurance VARCHAR(20) -- Số bảo hiểm y tế
);
GO
-- Đảm bảo giới tính chỉ nằm trong các giá trị xác định
ALTER TABLE PATIENT
ADD CONSTRAINT CHK_PSex CHECK (PSex IN (N'Nam', N'Nữ'));
-- Số điện thoại phải là duy nhất
ALTER TABLE PATIENT
ADD CONSTRAINT UQ_PPhone UNIQUE (PPhone);
GO

-- 4. Bảng Phòng khám (Clinic Room)
CREATE TABLE CLINIC_ROOM (
    CRId INT PRIMARY KEY IDENTITY(1,1),
    CRName NVARCHAR(100),
    DId INT FOREIGN KEY REFERENCES DEPARTMENT(DId),
    CRNumber VARCHAR(10),
    CRCapacity INT,
    CRStatus NVARCHAR(50) DEFAULT N'Trống'
);

GO
-- Sức chứa của phòng phải lớn hơn 0
ALTER TABLE CLINIC_ROOM
ADD CONSTRAINT CHK_CRCapacity CHECK (CRCapacity > 0);
-- Trạng thái của phòng khám nằm trong các trạng thái xác định
ALTER TABLE CLINIC_ROOM
ADD CONSTRAINT CHK_CRStatus CHECK (CRStatus IN (N'Trống', N'Đang sử dụng', N'Bảo trì'));
-- Ràng buộc khóa ngoại giữa bảng phòng khám và bảng khoa, nếu xóa khoa thì xóa luôn phòng khám thuộc khoa đó
ALTER TABLE CLINIC_ROOM
ADD CONSTRAINT FK_ClinicRoom_Department 
FOREIGN KEY (DId) REFERENCES DEPARTMENT(DId)
ON DELETE CASCADE;

GO
-- 5. Bảng Lịch làm việc (Work Schedule)
CREATE TABLE WORK_SCHEDULE (
    WSId INT PRIMARY KEY IDENTITY(1,1),
    DrId INT FOREIGN KEY REFERENCES DOCTOR(DrId),
    CRId INT FOREIGN KEY REFERENCES CLINIC_ROOM(CRId),
    WSDay DATE,
    WSStartime TIME,
    WSEndtime TIME,
    WSMaxPatientSlot INT
);

GO
-- Giờ kết thúc phải sau giờ bắt đầu
ALTER TABLE WORK_SCHEDULE
ADD CONSTRAINT CHK_WSTime CHECK (WSEndtime > WSStartime);
-- Số lượng bệnh nhân tối đa không được âm
ALTER TABLE WORK_SCHEDULE
ADD CONSTRAINT CHK_WSMaxSlot CHECK (WSMaxPatientSlot > 0);
--Ràng buộc khóa ngoại giữa bảng lịch làm việc và bảng bác sĩ, nếu bác sĩ nghỉ việc (xóa hồ sơ), toàn bộ lịch làm việc của bác sĩ đó cũng bị hủy bỏ
ALTER TABLE WORK_SCHEDULE
ADD CONSTRAINT FK_WorkSchedule_Doctor 
FOREIGN KEY (DrId) REFERENCES DOCTOR(DrId)
ON DELETE CASCADE;
--Ràng buộc khóa ngoại giữa bảng lịch làm việc và bảng phòng khám, nếu phòng khám bị xóa (ngừng hoạt động), các lịch làm việc tại phòng đó cũng tự động bị xóa
ALTER TABLE WORK_SCHEDULE
ADD CONSTRAINT FK_WorkSchedule_ClinicRoom 
FOREIGN KEY (CRId) REFERENCES CLINIC_ROOM(CRId)
ON DELETE CASCADE;

GO
-- 6. Bảng Cuộc hẹn (Appointment)
CREATE TABLE APPOINTMENT (
    APId INT PRIMARY KEY IDENTITY(1,1),
    DrId INT FOREIGN KEY REFERENCES DOCTOR(DrId),
    PId INT FOREIGN KEY REFERENCES PATIENT(PId),
    CRId INT FOREIGN KEY REFERENCES CLINIC_ROOM(CRId),
    APStatus NVARCHAR(50) DEFAULT N'Chờ xác nhận',
    APReason NVARCHAR(MAX),
    APDateTimes DATETIME,
    APCreateAt DATETIME DEFAULT GETDATE(),
    APUpdateAt DATETIME
);
GO
-- Trạng thái cuộc hẹn chỉ bao gồm các bước quy định
ALTER TABLE APPOINTMENT
ADD CONSTRAINT CHK_APStatus 
CHECK (APStatus IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đang khám', N'Hoàn thành', N'Đã hủy'));
-- Ngày hẹn không được là ngày trong quá khứ khi tạo mới
ALTER TABLE APPOINTMENT
ADD CONSTRAINT CHK_APDateTimes CHECK (APDateTimes >= APCreateAt);
--Ràng buộc khóa ngoại giữa bảng lịch khám với bảng bác sĩ, ngăn xóa bác sĩ nếu bác sĩ đó đang có lịch hẹn với bệnh nhân để đảm bảo lịch sử khám
ALTER TABLE APPOINTMENT
ADD CONSTRAINT FK_Appointment_Doctor 
FOREIGN KEY (DrId) REFERENCES DOCTOR(DrId);
--Ràng buộc ngoái ngoại giữa bảng lịch khám với bảng bệnh nhân, ngăn xóa bệnh nhân nếu họ đã từng có cuộc hẹn, nhằm bảo vệ dữ liệu y tế
ALTER TABLE APPOINTMENT
ADD CONSTRAINT FK_Appointment_Patient 
FOREIGN KEY (PId) REFERENCES PATIENT(PId);
--Ràng buộc ngoái ngoại giữa bảng lịch khám với bảng phòng khám, không cho xóa phòng khám nếu đang có các cuộc hẹn được sắp xếp tại phòng đó
ALTER TABLE APPOINTMENT
ADD CONSTRAINT FK_Appointment_ClinicRoom 
FOREIGN KEY (CRId) REFERENCES CLINIC_ROOM(CRId);
GO

-- 7. Bảng Hồ sơ bệnh án (Medical Record)
CREATE TABLE MEDICAL_RECORD (
    MRId INT PRIMARY KEY IDENTITY(1,1),
    DrId INT FOREIGN KEY REFERENCES DOCTOR(DrId),
    PId INT FOREIGN KEY REFERENCES PATIENT(PId),
    APId INT UNIQUE FOREIGN KEY REFERENCES APPOINTMENT(APId), -- Quan hệ 1-1
    MRDiagnosis NVARCHAR(MAX),
    MRMethod NVARCHAR(MAX),
    MRTestResult NVARCHAR(MAX),
    MRVisitedDate DATE DEFAULT CAST(GETDATE() AS DATE),
    MRCreatedAt DATETIME DEFAULT GETDATE()
);
GO
--Ràng buộc khóa ngoại giữa bảng hồ sơ bệnh án với bảng lịch khám, đảm bảo mỗi hồ sơ bệnh án phải gắn liền với một cuộc hẹn cụ thể và không thể xóa cuộc hẹn nếu đã có bệnh án
ALTER TABLE MEDICAL_RECORD
ADD CONSTRAINT FK_MedicalRecord_Appointment 
FOREIGN KEY (APId) REFERENCES APPOINTMENT(APId);
--Ràng buộc khóa ngoại giữa bảng hồ sơ bệnh án với bảng bác sĩ, ngăn xóa bác sĩ nếu bác sĩ này đã có dữ liệu bệnh án đã ký. Bảo vệ tính pháp lý của hồ sơ
ALTER TABLE MEDICAL_RECORD
ADD CONSTRAINT FK_MedicalRecord_Doctor 
FOREIGN KEY (DrId) REFERENCES DOCTOR(DrId)
ON DELETE NO ACTION;
--Ràng buộc khóa ngoại giữa bảng hồ sơ bệnh án với bảng bệnh nhân, tuyệt đối không cho xóa bệnh nhân nếu hồ sơ bệnh án của họ vẫn còn tồn tại trong hệ thống
ALTER TABLE MEDICAL_RECORD
ADD CONSTRAINT FK_MedicalRecord_Patient 
FOREIGN KEY (PId) REFERENCES PATIENT(PId)
ON DELETE NO ACTION;
--Ràng buộc duy nhất (Quan hệ 1-1 với Cuộc hẹn), đảm bảo một cuộc hẹn chỉ có tối đa 1 hồ sơ bệnh án, không thể có 2 chẩn đoán khác nhau cho cùng 1 lần khám
ALTER TABLE MEDICAL_RECORD
ADD CONSTRAINT UQ_MedicalRecord_Appointment 
UNIQUE (APId);

GO
-- 8. Bảng Đơn thuốc (Prescription)
CREATE TABLE PRESCRIPTION (
    PRId INT PRIMARY KEY IDENTITY(1,1),
    MRId INT UNIQUE FOREIGN KEY REFERENCES MEDICAL_RECORD(MRId), -- Quan hệ 1-1
    PRDoctorNote NVARCHAR(MAX),
    PRCreatedAt DATETIME DEFAULT GETDATE()
);
GO
--Ràng buộc khóa ngoại giữa bảng đơn thuốc với bảng hồ sơ bệnh án, nếu hồ sơ bệnh án bị xóa, đơn thuốc liên quan cũng sẽ bị xóa tự động để tránh sai lệch dữ liệu điều trị
ALTER TABLE PRESCRIPTION
ADD CONSTRAINT FK_Prescription_MedicalRecord 
FOREIGN KEY (MRId) REFERENCES MEDICAL_RECORD(MRId)
ON DELETE CASCADE;
--Ràng buộc duy nhất (Quan hệ 1-1 với Hồ sơ bệnh án),đảm bảo mỗi hồ sơ bệnh án chỉ được phép có duy nhất một đơn thuốc đi kèm
ALTER TABLE PRESCRIPTION
ADD CONSTRAINT UQ_Prescription_MedicalRecord 
UNIQUE (MRId);
GO
-- 9. Bảng Danh mục thuốc (Category Medicine)
CREATE TABLE CATEGORY_MEDICINE (
    CMId INT PRIMARY KEY IDENTITY(1,1),
    CMName NVARCHAR(100) NOT NULL,
    CMStockQuantity INT DEFAULT 0,
    CMPrice DECIMAL(18, 2),
    CMNote NVARCHAR(MAX)
);
-- Giá thuốc và số lượng tồn kho không được âm
ALTER TABLE CATEGORY_MEDICINE
ADD CONSTRAINT CHK_CMPrice CHECK (CMPrice >= 0);
ALTER TABLE CATEGORY_MEDICINE
ADD CONSTRAINT CHK_CMStock CHECK (CMStockQuantity >= 0);

-- 10. Chi tiết đơn thuốc (Prescription Detail)
CREATE TABLE PRESCRIPTION_DETAIL (
    PDId INT PRIMARY KEY IDENTITY(1,1),
    PRId INT FOREIGN KEY REFERENCES PRESCRIPTION(PRId),
    CMId INT FOREIGN KEY REFERENCES CATEGORY_MEDICINE(CMId),
    PDUnitPrice DECIMAL(18, 2),
    PDQuantity INT,
    PDDuration INT,
    PDGuide NVARCHAR(MAX)
);
GO
-- Liều lượng thuốc phải ít nhất là 1
ALTER TABLE PRESCRIPTION_DETAIL
ADD CONSTRAINT CHK_PDQuantity CHECK (PDQuantity > 0);
-- Số ngày sử dụng thuốc lớn hơn 0
ALTER TABLE PRESCRIPTION_DETAIL
ADD CONSTRAINT CHK_PDDuration CHECK (PDDuration > 0);
--Ràng buộc khóa ngoại giữa bảng chi tiết đơn thuốc với bảng đơn thuốc, khi xóa một đơn thuốc, tất cả các danh mục thuốc chi tiết bên trong đơn đó phải bị xóa theo
ALTER TABLE PRESCRIPTION_DETAIL
ADD CONSTRAINT FK_PresDetail_Prescription 
FOREIGN KEY (PRId) REFERENCES PRESCRIPTION(PRId)
ON DELETE CASCADE;
--Ràng buộc khóa ngoại giữa bảng chi tiết đơn thuốc với bảng danh mục thuốc, ngăn xóa thông tin loại thuốc khỏi danh mục nếu thuốc đó đã được kê trong một đơn thuốc bất kỳ (để giữ lịch sử kê đơn)
ALTER TABLE PRESCRIPTION_DETAIL
ADD CONSTRAINT FK_PresDetail_Medicine 
FOREIGN KEY (CMId) REFERENCES CATEGORY_MEDICINE(CMId)
ON DELETE NO ACTION;

GO
-- 11. Bảng Hóa đơn (Invoice)
CREATE TABLE INVOICE (
    INId INT PRIMARY KEY IDENTITY(1,1),
    APId INT UNIQUE FOREIGN KEY REFERENCES APPOINTMENT(APId), -- Quan hệ 1-1
    PRId INT UNIQUE FOREIGN KEY REFERENCES PRESCRIPTION(PRId), -- Quan hệ 1-1
    INTotalPrice DECIMAL(18, 2) DEFAULT 0,
    INPaymentMethod NVARCHAR(50),
    INStatus NVARCHAR(50) DEFAULT N'Chưa thanh toán',
    INPaidDate DATETIME
);
GO
-- Tổng tiền không được âm
ALTER TABLE INVOICE
ADD CONSTRAINT CHK_INTotalPrice CHECK (INTotalPrice >= 0);
-- Trạng thái thanh toán trong những trạng thái xác định
ALTER TABLE INVOICE
ADD CONSTRAINT CHK_INStatus CHECK (INStatus IN (N'Chưa thanh toán', N'Đã thanh toán'));
--Ràng buộc khóa ngoại giữa bảng thanh toán với bảng bảng lịch khám, ngăn xóa cuộc hẹn nếu đã xuất hóa đơn. Điều này quan trọng để phục vụ công tác kế toán và đối soát tài chính
ALTER TABLE INVOICE
ADD CONSTRAINT FK_Invoice_Appointment 
FOREIGN KEY (APId) REFERENCES APPOINTMENT(APId)
ON DELETE NO ACTION;
--Ràng buộc khóa ngoại giữa bảng thanh toán với bảng đơn thuốc, không cho phép xóa đơn thuốc nếu hóa đơn thanh toán cho đơn thuốc đó đã tồn tại
ALTER TABLE INVOICE
ADD CONSTRAINT FK_Invoice_Prescription 
FOREIGN KEY (PRId) REFERENCES PRESCRIPTION(PRId)
ON DELETE NO ACTION;
---Ràng buộc duy nhất (Quan hệ 1-1)
ALTER TABLE INVOICE
ADD CONSTRAINT UQ_Invoice_Appointment UNIQUE (APId); -- Mỗi cuộc hẹn chỉ có duy nhất một hóa đơn tổng
ALTER TABLE INVOICE
ADD CONSTRAINT UQ_Invoice_Prescription UNIQUE (PRId); -- Mỗi đơn thuốc chỉ được tính vào một hóa đơn duy nhất

-- 12. Chi tiết hóa đơn (Invoice Detail)
CREATE TABLE INVOICE_DETAIL (
    INDId INT PRIMARY KEY IDENTITY(1,1),
    INId INT FOREIGN KEY REFERENCES INVOICE(INId),
    INDPatientPaid DECIMAL(18, 2) DEFAULT 0,
    INDMedicinePrice DECIMAL(18, 2) DEFAULT 0,
    INDInsurancePaid DECIMAL(18, 2) DEFAULT 0
);
GO
-- Kiểm tra số tiền không được âm
ALTER TABLE INVOICE_DETAIL
ADD CONSTRAINT CHK_INDAmounts CHECK (INDPatientPaid >= 0 AND INDMedicinePrice >= 0 AND INDInsurancePaid >= 0);
--Ràng buộc khóa ngoại giữa bảng chi tiết hóa đơn và bảng hóa đơn, nếu xóa hóa đơn tổng (do sai sót), toàn bộ chi tiết thanh toán bên trong cũng bị xóa sạch để đảm bảo cân đối dữ liệu
ALTER TABLE INVOICE_DETAIL
ADD CONSTRAINT FK_InvoiceDetail_Invoice 
FOREIGN KEY (INId) REFERENCES INVOICE(INId)
ON DELETE CASCADE;