create schema btl2;
use btl2;
create table `user` (
	ID int primary key auto_increment,
    Username varchar (30) not null unique,
    Email varchar(100) not null unique,
    `Password` varchar(255) not null,
    FName varchar (20) not null,
    LName varchar (20) not null,
    Created_date date not null,
    Address varchar (50) not null,
    Phonenumber char(10) not null,
    Profile_Picture varchar(255) not null,
    Bdate date not null
);

create table candidate (
	ID int primary key not null,
    constraint fk_u_c_id foreign key (ID) references user (ID) 
		on delete cascade
);

create table package (
	PackageName varchar (30) primary key,
    cost int not null default 0,
    desciption text,
    time int
); 

create table employer (
	ID int primary key not null,
    PackageName varchar (30),
    NumberOfOpenedJob int unsigned default 0,
    purchaseDate date not null,
    constraint fk_u_emp_id foreign key (ID) references user (ID) 
		on delete cascade,
    constraint fk_pack foreign key (PackageName) references package (PackageName) 
		on delete restrict
);

create table follow (
	CandidateID int not null,
    EmployerID int not null,
    primary key (CandidateID, EmployerID),
    constraint fk_emp_fl_id foreign key (EmployerID) references employer(ID)
		on delete cascade,
    constraint fk_can_fl_id foreign key (CandidateID) references candidate(ID)
		on delete cascade
);

create table social_media_link (
	SMLID int not null,
    UserID int not null,
    SMLlink varchar(255) not null unique,
    primary key (SMLID, UserID),
    constraint fk_user_sml_id foreign key (UserID) references user(ID)
		on delete cascade
);

create table feedback (
	FeedID int primary key,
    Image blob not null,
    Topic varchar(50) not null,
    Content varchar(200), 
    UserID int not null,
    constraint fk_user_feed_id foreign key (UserID) references user(ID)
		on delete cascade
);

create table inbox (
	MID int primary key,
	SenderID int not null,
    ReceiverID int not null,
    SenderRole varchar(20),
    Content varchar(500),
    TimeSent datetime,
    constraint fk_user_sen_id foreign key (SenderID) references user(ID)
		on delete cascade,
    constraint fk_user_re_id foreign key (ReceiverID) references user(ID)
		on delete cascade
);

create table review (
	rID int primary key,
    `Rank` tinyint unsigned not null check (`Rank` between 1 and 5),
    Content varchar(200),
    CandidateID int,
    EmployerID int not null,
    constraint fk_emp_r_id foreign key (EmployerID) references employer(ID)
		on delete cascade,
    constraint fk_can_r_id foreign key (CandidateID) references candidate(ID)
		on delete set null
);

create table `profile` (
	ProfileID int primary key,
    Award varchar(500),
    savedCv varchar(255) not null,
    YearOfExperience int not null default 0,
    CandidateID int not null,
    constraint fk_can_prf_id foreign key (CandidateID) references candidate(ID)
		on delete cascade
);

create table Foreign_Language (
	ProfileId int not null,
    `Name` varchar(30) not null,
    `Level` varchar(5) not null,
    primary key (ProfileID, `Name`, `Level`),
    constraint fk_prf_l_id foreign key (ProfileID) references `profile`(ProfileID)
		on delete cascade
);

create table company (
	CompanyID int primary key,
    CNationality varchar(10),
    CName varchar(50) not null,
    Website varchar(255) not null,
    Industry varchar(30) not null,
    CompanySize mediumint,
    Logo varchar(255) not null,
    `Description` varchar(200),
    TaxNumber int not null unique,
    EmployerID int not null,
    constraint fk_emp_c_id foreign key (EmployerID) references employer(ID)
		on delete cascade
);
	
create table job_history (
	HistoryID int not null,
	CompanyName varchar(50) not null,
    Starttime date not null,
    Endtime date not null,
    Position varchar(30) not null,
    ProfileID int not null,
    primary key (HistoryID, ProfileID),
    constraint ck_jh_time check (Starttime < Endtime),
    constraint fk_prf_j_id foreign key (ProfileID) references `profile`(ProfileID)
		on delete cascade
);

create table project (
	`Name` varchar(50) not null,
    Link varchar(255) not null,
    `Role` varchar(20),
    Starttime date,
    Endtime date,
    HistoryID int not null,
    ProfileID int not null,
    primary key (`Name`, HistoryID, ProfileID),
    constraint ck_prj_time check (Starttime < Endtime),
    constraint fk_his_id foreign key (HistoryID, ProfileID) references job_history(HistoryID, ProfileID)
		on delete cascade
);

create table education (
	EduType varchar(10) not null,
    Address varchar(50) not null,
    EduName varchar(50) not null,
    primary key (EduType, Address, EduName)
);

create table study (
	ProfileID int not null,
    EduType varchar(10) not null,
    Address varchar(50) not null,
    EduName varchar(50) not null,
    Degree varchar(20),
    Major varchar(20),
    StartYear date not null,
    EndYear date,
    primary key (ProfileID, EduType, Address, EduName),
    constraint ck_std_time check (StartYear < EndYear),
    constraint fk_std_prf_id foreign key (ProfileID) references profile(ProfileID)
		on delete cascade,
    constraint fk_std_edu foreign key (EduType, Address, EduName) references education(EduType, Address, EduName)
		on delete cascade
);

create table skill (
	SkillName varchar(20) primary key,
    `Description` varchar(200) not null
);

create table include (
	SkillName varchar(20) not null,
    ProfileID int not null,
    primary key (SkillName, ProfileID),
    constraint fk_sk_n foreign key (SkillName) references skill(SkillName)
		on delete restrict,
    constraint fk_prf_i_id foreign key (ProfileID) references `profile`(ProfileID)
		on delete cascade
);

create table certificate (
	ProfileID int not null,
    CertID int not null,
    CertName varchar(30) not null,
    Score int not null,
    `Organization` varchar(50) not null,
    Link varchar(255),
    issueDate date not null,
    `Description` varchar(300),
    primary key (ProfileID, CertID),
    constraint fk_cert_prf_id foreign key (ProfileID) references `profile`(ProfileID)
		on delete cascade
);

create table job (
	JobID int primary key,
    JobName varchar(20) not null,
    JD varchar(500) not null,
    JobType varchar(20) not null,
    ContractType varchar(20) not null,
    `Level` varchar(20) not null,
    Quantity int unsigned not null check (Quantity >= 1),
    SalaryFrom int not null,
    SalaryTo int not null,
    RequiredExpYear int not null,
    Location varchar(30) not null,
    PostDate date not null,
    ExpireDate date not null,
    JobStatus varchar(10) not null,
    NumberOfApplicant int unsigned default 0,
    EmployerID int not null,
    constraint ck_j_time check (ExpireDate > PostDate),
    constraint ck_j_sl check (SalaryFrom > 0 and SalaryTo > SalaryFrom),
    constraint fk_emp_j_id foreign key (EmployerID) references employer(ID)
		on delete cascade
);

create table `require` (
	JobID int not null,
    SkillName varchar(20) not null,
    primary key (JobID, SkillName),
    constraint fk_j_r_id foreign key (JobID) references job(JobID)
		on delete cascade,
    constraint fk_sk_r_n foreign key (SkillName) references skill(SkillName)
		on delete restrict
);

create table job_category (
	JCName varchar(20) primary key,
    Specialty varchar(200) not null
);

create table related (
	JCName1 varchar(20) not null,
    JCName2 varchar(20) not null,
    primary key (JCName1, JCName2),
    constraint fk_relate_1 foreign key(JCName1) references job_category(JCName)
		on delete cascade,
    constraint fk_relate_2 foreign key(JCName2) references job_category(JCName)
		on delete cascade
);

create table `in` (
	JobID int not null,
    JCName varchar(20) not null,
    primary key (JobID, JCName),
    constraint fk_in_job foreign key (JobID) references job(JobID)
		on delete cascade,
    constraint fk_in_jc foreign key (JCName) references job_category(JCName)
		on delete cascade
);

create table notification (
	nID int primary key,
    Title varchar(30) not null,
    Content varchar(200) not null,
    `Time` datetime not null,
    CandidateID int not null,
    EmployerID int not null,
    JobID int not null,
    constraint fk_can_noti foreign key (CandidateID) references candidate(ID),
    constraint fk_emp_noti foreign key (EmployerID) references employer(ID),
    constraint fk_j_noti foreign key (JobID) references job(JobID)
);

create table favourite (
	CandidateID int not null,
    JobID int not null,
    `Date` date not null,
    primary key (CandidateID, JobID),
    constraint fk_can_fv foreign key (CandidateID) references candidate(ID)
		on delete cascade,
    constraint fk_j_fv foreign key (JobID) references job(JobID)
		 on delete cascade
);

create table apply (
	CandidateID int not null,
    JobID int not null,
    upLoadCV varchar(50) not null,
    CoverLetter varchar(50),
    Status_apply varchar(20) not null default 'Dang duyet',
    primary key (CandidateID, JobID, upLoadCV),
    constraint fk_can_a foreign key (CandidateID) references candidate(ID)
		on delete cascade,
    constraint fk_j_a foreign key (JobID) references job(JobID)
		on delete cascade
);

create table personal_project (
	`Name` varchar(50) not null,
    Link varchar(255) not null,
    `Role` varchar(20),
    Starttime date,
    Endtime date,
    ProfileID int not null,
    primary key (`Name`, ProfileID),
    constraint ck_per_time check (Starttime < Endtime),
    constraint fk_per_prf_id foreign key (ProfileID) references profile(ProfileID)
		on delete cascade
);

use btl2;
DELIMITER $$
create trigger RB1 before insert on `user`
for each row
begin 
	if now() - Bdate < 18 then signal sqlstate '45000' set message_text = 'nguoi dung nho hon 18 tuoi';
    end if;
end $$

create trigger RB2 before insert on apply
for each row
begin
	declare cvPath varchar(255);
	if new.upLoadCV is null or new.upLoadCV = ' ' then
		select savedCV into cvPath
        from `profile`
        where CandidateID = new.CandidateID;
        set new.upLoadCV = cvPath;
    end if;
end $$

create trigger RB3 before insert on `user`
for each row
begin
	if new.Phonenumber not regexp '^0[0-9]{9}$' then 
		signal sqlstate '45000' set message_text = 'So dien thoai khong hop le.';
	end if;
	if new.Email not regexp '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$' then
		signal sqlstate '45000' set message_text = 'Email khong hop le.';
	end if;
end $$

create trigger RB6 before insert on apply
for each row
begin
	declare stt varchar(10);
    select JobStatus into stt
    from job
    where JobID = new.JobID;
    if stt = 'Đã đóng' then signal sqlstate '45000' set message_text = 'Khong the ung tuyen vi job da dong';
    end if;
    if curdate() > ExpireDate then signal sqlstate '45000' set message_text = 'Khong the ung tuyen vi job da het han';
    end if;
end $$

create trigger RB7 before insert on apply
for each row
begin
	declare prf_id int;
    declare missing int default 0;
    
    select ProfileID into prf_id
    from `profile`
    where CandidateID = new.CandidateID
    limit 1;
    
    select count(*) into missing
    from `require` r
    where r.JobID = new.JobID and 
		not exists (
			select 1 from include i 
            where i.SkillName = r.SkillName and i.ProfileID = prf_id);
	
    if missing > 0  then signal sqlstate '45000' set message_text = 'Ung cu vien khong du dieu kien de ung tuyen';
    end if;
end $$


create trigger RB11 before insert on review
for each row
begin
	declare rvcname varchar(50);
    declare counthiscname int;
    
    select CName into rvcname
    from company
    where EmployerID = new.EmployerID;
    
    select count(jh.HistoryID) into counthiscname
    from job_history jh join profile p on jh.ProfileID = p.ProfileID
    where p.CandidateID = new.CandidateID and jh.CompanyName = rvcname;
   
	if counthiscname = 0 then signal sqlstate '45000' set message_text = 'Khong du dieu kien de danh gia';
    end if;
end $$

create trigger RB14 before insert on inbox
for each row
begin
	declare checksendertype int;
    
    select count(ID) into checksendertype
    from employer 
    where ID = new.SenderID;

    if checksendertype = 0 then
		if not exists (select 1 from inbox 
			where SenderID = new.ReceiverID
              AND ReceiverID = new.SenderID
              AND SenderRole = 'employer')
		then signal sqlstate '45000' set message_text = 'Ung cu vien khong the gui tin nhan truoc';
        else set new.SenderRole = 'candidate';
        end if;
	else set new.SenderRole = 'employer';
    end if;
end $$

create trigger RB13b before insert on inbox
for each row
begin
	declare purchaseday date;
    declare timegold int;
    
    select max(purchaseDate) into purchaseday
    from employer
    where PackageName = 'Gold' and (ID = new.SenderID or ID = new.ReceiverID);
    
    select time into timegold
    from package
    where PackageName = 'Gold';
        
    if purchaseday is null then signal sqlstate '45000' set message_text = 'Khong du dieu kien de thuc hien gui tin nhan';
    end if;
	if curdate() > purchaseday + interval timegold day then signal sqlstate '45000' set message_text = 'Khong du dieu kien de thuc hien gui tin nhan';
	end if;
	
end $$ 

create trigger RB13a before insert on job
for each row
begin
	declare purchaseday date;
    declare timepackage int;
    declare pname varchar(30);
    
    select purchaseDate, PackageName into purchaseday, pname
    from employer
    where ID = new.EmployerID
    order by purchaseDate desc limit 1;
    
    select time into timepackage
    from package
    where PackageName = pname;
    
    if curdate() > purchaseday + interval timepackage day then signal sqlstate '45000' set message_text = 'Khong du dieu kien de thuc hien dang bai';
	end if;
end $$

create trigger RB4 before insert on apply
for each row
begin
	declare check_per int;
    declare check_cer int;
    declare check_std int;
    declare check_fl int;
    declare check_inc int;
    declare prfid int;
    
    select ProfileID into prfid
    from profile
    where CandidateID = new.CandidateID;
    
    select count(ProfileID) into check_per
    from personal_project
    where ProfileID = prfid;
    
    select count(ProfileID) into check_cer
    from certificate
    where ProfileID = prfid;
    
    select count(ProfileID) into check_fl
    from foreign_language
    where ProfileID = prfid;
    
    select count(ProfileID) into check_std
    from study
    where ProfileID = prfid;
    
    select count(ProfileID) into check_inc
    from include
    where ProfileID = prfid;
    
    if check_jh = 0 or check_cer = 0 or check_std = 0 or check_fl = 0 or check_inc = 0
		then signal sqlstate '45000' set message_text = 'Ung cu vien chua hoan thanh ly lich';
	end if;
end $$

create trigger increase_opened_job after insert on job
for each row
begin
    update employer
    set NumberOfOpenedJob = NumberOfOpenedJob + 1
    where ID = NEW.EmployerID;
end $$

create trigger increase_year_of_experience after insert on job_history
for each row
begin
    update profile
    set YearOfExperience = YearOfExperience + TIMESTAMPDIFF(YEAR, NEW.Starttime, NEW.Endtime)
    where ProfileID = NEW.ProfileID;
end $$

create trigger increase_applicant after insert on apply
for each row
begin
	update job
    set NumberOfApplicant = NumberOfApplicant + 1
    where JobID = new.JobID;
end $$

