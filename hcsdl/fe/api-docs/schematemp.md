
CREATE SCHEMA IF NOT EXISTS btl2;
USE btl2;

-- 1. Base User Table
CREATE TABLE `user` (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(30) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    `Password` VARCHAR(255) NOT NULL,
    FName VARCHAR(20) NOT NULL,
    LName VARCHAR(20) NOT NULL,
    Created_date DATE NOT NULL,
    Address VARCHAR(50) NOT NULL,
    Phonenumber CHAR(10) NOT NULL,
    Profile_Picture VARCHAR(255) NOT NULL,
    Bdate DATE NOT NULL
);

-- 2. Candidate
CREATE TABLE candidate (
    ID INT PRIMARY KEY NOT NULL,
    CONSTRAINT fk_u_c_id FOREIGN KEY (ID) REFERENCES `user` (ID) 
        ON DELETE CASCADE
);

-- 3. Package
CREATE TABLE package (
    PackageName VARCHAR(30) PRIMARY KEY,
    cost INT NOT NULL DEFAULT 0,
    desciption TEXT,
    time INT
);

-- 4. Employer
CREATE TABLE employer (
    ID INT PRIMARY KEY NOT NULL,
    PackageName VARCHAR(30),
    NumberOfOpenedJob INT UNSIGNED DEFAULT 0,
    purchaseDate DATE NOT NULL,
    CONSTRAINT fk_u_emp_id FOREIGN KEY (ID) REFERENCES `user` (ID) 
        ON DELETE CASCADE,
    CONSTRAINT fk_pack FOREIGN KEY (PackageName) REFERENCES package (PackageName) 
        ON DELETE RESTRICT
);

-- 5. Company
CREATE TABLE company (
    CompanyID INT PRIMARY KEY,
    CNationality VARCHAR(10),
    CName VARCHAR(50) NOT NULL,
    Website VARCHAR(255) NOT NULL,
    Industry VARCHAR(30) NOT NULL,
    CompanySize MEDIUMINT,
    Logo VARCHAR(255) NOT NULL,
    `Description` VARCHAR(200),
    TaxNumber INT NOT NULL UNIQUE,
    EmployerID INT NOT NULL,
    CONSTRAINT fk_emp_c_id FOREIGN KEY (EmployerID) REFERENCES employer(ID)
        ON DELETE CASCADE
);

-- 6. Social Media Link
CREATE TABLE social_media_link (
    SMLID INT NOT NULL,
    UserID INT NOT NULL,
    SMLlink VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (SMLID, UserID),
    CONSTRAINT fk_user_sml_id FOREIGN KEY (UserID) REFERENCES `user`(ID)
        ON DELETE CASCADE
);

-- 7. Feedback
CREATE TABLE feedback (
    FeedID INT PRIMARY KEY,
    Image BLOB NOT NULL,
    Topic VARCHAR(50) NOT NULL,
    Content VARCHAR(200),
    UserID INT NOT NULL,
    CONSTRAINT fk_user_feed_id FOREIGN KEY (UserID) REFERENCES `user`(ID)
        ON DELETE CASCADE
);

-- 8. Inbox
CREATE TABLE inbox (
    MID INT PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    SenderRole VARCHAR(20),
    Content VARCHAR(500),
    TimeSent DATETIME,
    CONSTRAINT fk_user_sen_id FOREIGN KEY (SenderID) REFERENCES `user`(ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_re_id FOREIGN KEY (ReceiverID) REFERENCES `user`(ID)
        ON DELETE CASCADE
);

-- 9. Review
CREATE TABLE review (
    rID INT PRIMARY KEY,
    `Rank` TINYINT UNSIGNED NOT NULL CHECK (`Rank` BETWEEN 1 AND 5),
    Content VARCHAR(200),
    CandidateID INT,
    EmployerID INT NOT NULL,
    CONSTRAINT fk_emp_r_id FOREIGN KEY (EmployerID) REFERENCES employer(ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_can_r_id FOREIGN KEY (CandidateID) REFERENCES candidate(ID)
        ON DELETE SET NULL
);

-- 10. Follow
CREATE TABLE follow (
    CandidateID INT NOT NULL,
    EmployerID INT NOT NULL,
    PRIMARY KEY (CandidateID, EmployerID),
    CONSTRAINT fk_emp_fl_id FOREIGN KEY (EmployerID) REFERENCES employer(ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_can_fl_id FOREIGN KEY (CandidateID) REFERENCES candidate(ID)
        ON DELETE CASCADE
);

-- 11. Profile
CREATE TABLE `profile` (
    ProfileID INT PRIMARY KEY,
    Award VARCHAR(500),
    savedCv VARCHAR(255) NOT NULL,
    YearOfExperience INT NOT NULL DEFAULT 0,
    CandidateID INT NOT NULL,
    CONSTRAINT fk_can_prf_id FOREIGN KEY (CandidateID) REFERENCES candidate(ID)
        ON DELETE CASCADE
);

-- 12. Foreign Language
CREATE TABLE Foreign_Language (
    ProfileId INT NOT NULL,
    `Name` VARCHAR(30) NOT NULL,
    `Level` VARCHAR(5) NOT NULL,
    PRIMARY KEY (ProfileID, `Name`, `Level`),
    CONSTRAINT fk_prf_l_id FOREIGN KEY (ProfileID) REFERENCES `profile`(ProfileID)
        ON DELETE CASCADE
);

-- 13. Job History
CREATE TABLE job_history (
    HistoryID INT NOT NULL,
    CompanyName VARCHAR(50) NOT NULL,
    Starttime DATE NOT NULL,
    Endtime DATE NOT NULL,
    Position VARCHAR(30) NOT NULL,
    ProfileID INT NOT NULL,
    PRIMARY KEY (HistoryID, ProfileID),
    CONSTRAINT ck_jh_time CHECK (Starttime < Endtime),
    CONSTRAINT fk_prf_j_id FOREIGN KEY (ProfileID) REFERENCES `profile`(ProfileID)
        ON DELETE CASCADE
);

-- 14. Project (Job History related)
CREATE TABLE project (
    `Name` VARCHAR(50) NOT NULL,
    Link VARCHAR(255) NOT NULL,
    `Role` VARCHAR(20),
    Starttime DATE,
    Endtime DATE,
    HistoryID INT NOT NULL,
    ProfileID INT NOT NULL,
    PRIMARY KEY (`Name`, HistoryID, ProfileID),
    CONSTRAINT ck_prj_time CHECK (Starttime < Endtime),
    CONSTRAINT fk_his_id FOREIGN KEY (HistoryID, ProfileID) REFERENCES job_history(HistoryID, ProfileID)
        ON DELETE CASCADE
);

-- 15. Education
CREATE TABLE education (
    EduType VARCHAR(10) NOT NULL,
    Address VARCHAR(50) NOT NULL,
    EduName VARCHAR(50) NOT NULL,
    PRIMARY KEY (EduType, Address, EduName)
);

-- 16. Study
CREATE TABLE study (
    ProfileID INT NOT NULL,
    EduType VARCHAR(10) NOT NULL,
    Address VARCHAR(50) NOT NULL,
    EduName VARCHAR(50) NOT NULL,
    Degree VARCHAR(20),
    Major VARCHAR(20),
    StartYear DATE NOT NULL,
    EndYear DATE,
    PRIMARY KEY (ProfileID, EduType, Address, EduName),
    CONSTRAINT ck_std_time CHECK (StartYear < EndYear),
    CONSTRAINT fk_std_prf_id FOREIGN KEY (ProfileID) REFERENCES `profile`(ProfileID)
        ON DELETE CASCADE,
    CONSTRAINT fk_std_edu FOREIGN KEY (EduType, Address, EduName) REFERENCES education(EduType, Address, EduName)
        ON DELETE CASCADE
);

-- 17. Skill
CREATE TABLE skill (
    SkillName VARCHAR(20) PRIMARY KEY,
    `Description` VARCHAR(200) NOT NULL
);

-- 18. Include (Profile Skills)
CREATE TABLE include (
    SkillName VARCHAR(20) NOT NULL,
    ProfileID INT NOT NULL,
    PRIMARY KEY (SkillName, ProfileID),
    CONSTRAINT fk_sk_n FOREIGN KEY (SkillName) REFERENCES skill(SkillName)
        ON DELETE RESTRICT,
    CONSTRAINT fk_prf_i_id FOREIGN KEY (ProfileID) REFERENCES `profile`(ProfileID)
        ON DELETE CASCADE
);

-- 19. Certificate
CREATE TABLE certificate (
    ProfileID INT NOT NULL,
    CertID INT NOT NULL,
    CertName VARCHAR(30) NOT NULL,
    Score INT NOT NULL,
    `Organization` VARCHAR(50) NOT NULL,
    Link VARCHAR(255),
    issueDate DATE NOT NULL,
    `Description` VARCHAR(300),
    PRIMARY KEY (ProfileID, CertID),
    CONSTRAINT fk_cert_prf_id FOREIGN KEY (ProfileID) REFERENCES `profile`(ProfileID)
        ON DELETE CASCADE
);

-- 20. Personal Project
CREATE TABLE personal_project (
    `Name` VARCHAR(50) NOT NULL,
    Link VARCHAR(255) NOT NULL,
    `Role` VARCHAR(20),
    Starttime DATE,
    Endtime DATE,
    ProfileID INT NOT NULL,
    PRIMARY KEY (`Name`, ProfileID),
    CONSTRAINT ck_per_time CHECK (Starttime < Endtime),
    CONSTRAINT fk_per_prf_id FOREIGN KEY (ProfileID) REFERENCES `profile`(ProfileID)
        ON DELETE CASCADE
);

-- 21. Job
CREATE TABLE job (
    JobID INT PRIMARY KEY,
    JobName VARCHAR(20) NOT NULL,
    JD VARCHAR(500) NOT NULL,
    JobType VARCHAR(20) NOT NULL,
    ContractType VARCHAR(20) NOT NULL,
    `Level` VARCHAR(20) NOT NULL,
    Quantity INT UNSIGNED NOT NULL CHECK (Quantity >= 1),
    SalaryFrom INT NOT NULL,
    SalaryTo INT NOT NULL,
    RequiredExpYear INT NOT NULL,
    Location VARCHAR(30) NOT NULL,
    PostDate DATE NOT NULL,
    ExpireDate DATE NOT NULL,
    JobStatus VARCHAR(10) NOT NULL,
    NumberOfApplicant INT UNSIGNED DEFAULT 0,
    EmployerID INT NOT NULL,
    CONSTRAINT ck_j_time CHECK (ExpireDate > PostDate),
    CONSTRAINT ck_j_sl CHECK (SalaryFrom > 0 AND SalaryTo > SalaryFrom),
    CONSTRAINT fk_emp_j_id FOREIGN KEY (EmployerID) REFERENCES employer(ID)
        ON DELETE CASCADE
);

-- 22. Require (Job Skills)
CREATE TABLE `require` (
    JobID INT NOT NULL,
    SkillName VARCHAR(20) NOT NULL,
    PRIMARY KEY (JobID, SkillName),
    CONSTRAINT fk_j_r_id FOREIGN KEY (JobID) REFERENCES job(JobID)
        ON DELETE CASCADE,
    CONSTRAINT fk_sk_r_n FOREIGN KEY (SkillName) REFERENCES skill(SkillName)
        ON DELETE RESTRICT
);

-- 23. Job Category
CREATE TABLE job_category (
    JCName VARCHAR(20) PRIMARY KEY,
    Specialty VARCHAR(200) NOT NULL
);

-- 24. Related (Category Relations)
CREATE TABLE related (
    JCName1 VARCHAR(20) NOT NULL,
    JCName2 VARCHAR(20) NOT NULL,
    PRIMARY KEY (JCName1, JCName2),
    CONSTRAINT fk_relate_1 FOREIGN KEY(JCName1) REFERENCES job_category(JCName)
        ON DELETE CASCADE,
    CONSTRAINT fk_relate_2 FOREIGN KEY(JCName2) REFERENCES job_category(JCName)
        ON DELETE CASCADE
);

-- 25. In (Job in Category)
CREATE TABLE `in` (
    JobID INT NOT NULL,
    JCName VARCHAR(20) NOT NULL,
    PRIMARY KEY (JobID, JCName),
    CONSTRAINT fk_in_job FOREIGN KEY (JobID) REFERENCES job(JobID)
        ON DELETE CASCADE,
    CONSTRAINT fk_in_jc FOREIGN KEY (JCName) REFERENCES job_category(JCName)
        ON DELETE CASCADE
);

-- 26. Notification
CREATE TABLE notification (
    nID INT PRIMARY KEY,
    Title VARCHAR(30) NOT NULL,
    Content VARCHAR(200) NOT NULL,
    `Time` DATETIME NOT NULL,
    CandidateID INT NOT NULL,
    EmployerID INT NOT NULL,
    JobID INT NOT NULL,
    CONSTRAINT fk_can_noti FOREIGN KEY (CandidateID) REFERENCES candidate(ID),
    CONSTRAINT fk_emp_noti FOREIGN KEY (EmployerID) REFERENCES employer(ID),
    CONSTRAINT fk_j_noti FOREIGN KEY (JobID) REFERENCES job(JobID)
);

-- 27. Favourite
CREATE TABLE favourite (
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    `Date` DATE NOT NULL,
    PRIMARY KEY (CandidateID, JobID),
    CONSTRAINT fk_can_fv FOREIGN KEY (CandidateID) REFERENCES candidate(ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_j_fv FOREIGN KEY (JobID) REFERENCES job(JobID)
         ON DELETE CASCADE
);

-- 28. Apply
CREATE TABLE apply (
    CandidateID INT NOT NULL,
    JobID INT NOT NULL,
    upLoadCV VARCHAR(50) NOT NULL,
    CoverLetter VARCHAR(50),
    Status_apply VARCHAR(20) NOT NULL DEFAULT 'Dang duyet',
    PRIMARY KEY (CandidateID, JobID, upLoadCV),
    CONSTRAINT fk_can_a FOREIGN KEY (CandidateID) REFERENCES candidate(ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_j_a FOREIGN KEY (JobID) REFERENCES job(JobID)
        ON DELETE CASCADE
);