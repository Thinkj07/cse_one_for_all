```

---

# EMPLOYER DASHBOARD APIs

## 9. GET /api/employer/:employerId/stats - Lấy thống kê dashboard nhà tuyển dụng

### Request
- **Method:** GET
- **URL:** `/api/employer/:employerId/stats`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "openJobs": 589,
    "NumberOfOpenedJob": 589,
    "savedCandidates": 2517,
    "totalFollowers": 2517,
    "totalApplications": 12543,
    "newApplicationsToday": 87,
    "activeJobs": 542,
    "expiredJobs": 47
  },
  "message": "Stats retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  e.NumberOfOpenedJob,
  COUNT(DISTINCT f.CandidateID) as totalFollowers,
  COUNT(DISTINCT a.CandidateID) as totalApplications,
  SUM(CASE WHEN j.JobStatus = 'Active' AND j.ExpireDate > CURDATE() THEN 1 ELSE 0 END) as activeJobs,
  SUM(CASE WHEN j.JobStatus = 'Expired' OR j.ExpireDate <= CURDATE() THEN 1 ELSE 0 END) as expiredJobs
FROM employer e
LEFT JOIN follow f ON e.ID = f.EmployerID
LEFT JOIN job j ON e.ID = j.EmployerID
LEFT JOIN apply a ON j.JobID = a.JobID
WHERE e.ID = ?
GROUP BY e.ID;
```

## 10. GET /api/employer/:employerId/jobs - Lấy danh sách tin tuyển dụng của nhà tuyển dụng

### Request
- **Method:** GET
- **URL:** `/api/employer/:employerId/jobs?page=1&limit=10&status=all`
- **Headers:** 
  - `Authorization: Bearer {token}`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` ('active', 'expired', 'all')

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "JobID": 1,
        "JobName": "UI/UX Designer",
        "JobType": "Full Time",
        "ContractType": "Permanent",
        "Level": "Senior",
        "PostDate": "2025-11-01",
        "ExpireDate": "2025-12-24",
        "JobStatus": "Active",
        "NumberOfApplicant": 798,
        "Location": "Hà Nội",
        "SalaryFrom": 15000000,
        "SalaryTo": 25000000,
        "Quantity": 2,
        "RequiredExpYear": 3
      }
    ],
    "pagination": {
      "total": 589,
      "page": 1,
      "totalPages": 59,
      "limit": 10
    }
  },
  "message": "Jobs retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  j.JobID,
  j.JobName,
  j.JobType,
  j.ContractType,
  j.Level,
  j.PostDate,
  j.ExpireDate,
  j.JobStatus,
  j.NumberOfApplicant,
  j.Location,
  j.SalaryFrom,
  j.SalaryTo,
  j.Quantity,
  j.RequiredExpYear
FROM job j
WHERE j.EmployerID = ?
  AND (? = 'all' OR 
       (? = 'active' AND j.JobStatus = 'Active' AND j.ExpireDate > CURDATE()) OR
       (? = 'expired' AND (j.JobStatus = 'Expired' OR j.ExpireDate <= CURDATE())))
ORDER BY j.PostDate DESC
LIMIT ? OFFSET ?;
```

## 11. GET /api/jobs/:jobId/applications - Lấy danh sách ứng tuyển cho 1 tin

### Request
- **Method:** GET
- **URL:** `/api/jobs/:jobId/applications?page=1&limit=20&status=all`
- **Headers:** 
  - `Authorization: Bearer {token}`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `status` ('Dang duyet', 'Duyet', 'Tu choi', 'all')

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "CandidateID": 1,
        "JobID": 1,
        "upLoadCV": "cv_file.pdf",
        "CoverLetter": "cover_letter.pdf",
        "Status_apply": "Dang duyet",
        "AppliedDate": "2025-11-20",
        "candidate": {
          "FName": "Nguyen",
          "LName": "Van A",
          "Email": "nguyenvana@email.com",
          "Phonenumber": "0123456789",
          "Profile_Picture": "avatar.jpg",
          "Address": "Hà Nội"
        },
        "profile": {
          "YearOfExperience": 3,
          "savedCv": "resume.pdf"
        }
      }
    ],
    "pagination": {
      "total": 798,
      "page": 1,
      "totalPages": 40,
      "limit": 20
    },
    "statistics": {
      "total": 798,
      "pending": 650,
      "approved": 100,
      "rejected": 48
    }
  },
  "message": "Applications retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  a.CandidateID,
  a.JobID,
  a.upLoadCV,
  a.CoverLetter,
  a.Status_apply,
  u.FName,
  u.LName,
  u.Email,
  u.Phonenumber,
  u.Profile_Picture,
  u.Address,
  p.YearOfExperience,
  p.savedCv
FROM apply a
JOIN candidate c ON a.CandidateID = c.ID
JOIN user u ON c.ID = u.ID
LEFT JOIN profile p ON c.ID = p.CandidateID
WHERE a.JobID = ?
  AND (? = 'all' OR a.Status_apply = ?)
ORDER BY a.CandidateID DESC
LIMIT ? OFFSET ?;
```

## 12. GET /api/employer/:employerId/saved-candidates - Lấy danh sách ứng viên đã lưu

### Request
- **Method:** GET
- **URL:** `/api/employer/:employerId/saved-candidates?page=1&limit=20`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "CandidateID": 1,
        "FName": "Nguyen",
        "LName": "Van A",
        "Email": "nguyenvana@email.com",
        "Phonenumber": "0123456789",
        "Profile_Picture": "avatar.jpg",
        "Address": "Hà Nội",
        "followDate": "2025-10-15",
        "profile": {
          "YearOfExperience": 3,
          "savedCv": "resume.pdf"
        }
      }
    ],
    "pagination": {
      "total": 2517,
      "page": 1,
      "totalPages": 126,
      "limit": 20
    }
  },
  "message": "Saved candidates retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  f.CandidateID,
  u.FName,
  u.LName,
  u.Email,
  u.Phonenumber,
  u.Profile_Picture,
  u.Address,
  p.YearOfExperience,
  p.savedCv
FROM follow f
JOIN candidate c ON f.CandidateID = c.ID
JOIN user u ON c.ID = u.ID
LEFT JOIN profile p ON c.ID = p.CandidateID
WHERE f.EmployerID = ?
ORDER BY f.CandidateID DESC
LIMIT ? OFFSET ?;
```

## 13. POST /api/jobs - Đăng tin tuyển dụng mới

### Request
- **Method:** POST
- **URL:** `/api/jobs`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

### Request Body
```json
{
  "JobName": "Senior Developer",
  "JD": "Mô tả công việc chi tiết...",
  "JobType": "Full Time",
  "ContractType": "Permanent",
  "Level": "Senior",
  "Quantity": 2,
  "SalaryFrom": 20000000,
  "SalaryTo": 35000000,
  "RequiredExpYear": 3,
  "Location": "Hà Nội",
  "PostDate": "2025-11-27",
  "ExpireDate": "2025-12-27",
  "JobStatus": "Active",
  "EmployerID": 1,
  "categories": ["IT", "Software"],
  "skills": ["JavaScript", "React", "Node.js"]
}
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "JobID": 590,
    "JobName": "Senior Developer",
    "JobStatus": "Active",
    "PostDate": "2025-11-27"
  },
  "message": "Job posted successfully"
}
```

### SQL Query
```sql
INSERT INTO job (
  JobName, JD, JobType, ContractType, Level, Quantity,
  SalaryFrom, SalaryTo, RequiredExpYear, Location,
  PostDate, ExpireDate, JobStatus, EmployerID
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update employer's NumberOfOpenedJob
UPDATE employer 
SET NumberOfOpenedJob = NumberOfOpenedJob + 1 
WHERE ID = ?;
```

## 14. PATCH /api/jobs/:jobId/status - Cập nhật trạng thái tin tuyển dụng

### Request
- **Method:** PATCH
- **URL:** `/api/jobs/:jobId/status`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

### Request Body
```json
{
  "JobStatus": "Expired"
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "JobID": 1,
    "JobStatus": "Expired",
    "UpdatedAt": "2025-11-27T10:30:00Z"
  },
  "message": "Job status updated successfully"
}
```

### SQL Query
```sql
UPDATE job 
SET JobStatus = ?, 
    ExpireDate = CASE WHEN ? = 'Expired' THEN CURDATE() ELSE ExpireDate END
WHERE JobID = ?;
```

## 15. DELETE /api/jobs/:jobId - Xóa tin tuyển dụng

### Request
- **Method:** DELETE
- **URL:** `/api/jobs/:jobId`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

### SQL Query
```sql
DELETE FROM job WHERE JobID = ?;

-- Update employer's NumberOfOpenedJob
UPDATE employer 
SET NumberOfOpenedJob = NumberOfOpenedJob - 1 
WHERE ID = (SELECT EmployerID FROM job WHERE JobID = ?);
```

## 16. PATCH /api/applications/:jobId/:candidateId/status - Cập nhật trạng thái ứng tuyển

### Request
- **Method:** PATCH
- **URL:** `/api/applications/:jobId/:candidateId/status`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

### Request Body
```json
{
  "Status_apply": "Duyet"
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "JobID": 1,
    "CandidateID": 50,
    "Status_apply": "Duyet",
    "UpdatedAt": "2025-11-27T10:30:00Z"
  },
  "message": "Application status updated successfully"
}
```

### SQL Query
```sql
UPDATE apply 
SET Status_apply = ?
WHERE JobID = ? AND CandidateID = ?;
```

## 17. POST /api/employer/:employerId/follow/:candidateId - Theo dõi ứng viên

### Request
- **Method:** POST
- **URL:** `/api/employer/:employerId/follow/:candidateId`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "EmployerID": 1,
    "CandidateID": 50,
    "FollowedAt": "2025-11-27T10:30:00Z"
  },
  "message": "Candidate followed successfully"
}
```

### SQL Query
```sql
INSERT INTO follow (EmployerID, CandidateID) 
VALUES (?, ?);
```

## 18. DELETE /api/employer/:employerId/follow/:candidateId - Bỏ theo dõi ứng viên

### Request
- **Method:** DELETE
- **URL:** `/api/employer/:employerId/follow/:candidateId`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "message": "Candidate unfollowed successfully"
}
```

### SQL Query
```sql
DELETE FROM follow 
WHERE EmployerID = ? AND CandidateID = ?;
```

## 19. GET /api/employer/:employerId/notifications - Lấy thông báo

### Request
- **Method:** GET
- **URL:** `/api/employer/:employerId/notifications?page=1&limit=10`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "nID": 1,
        "Title": "Ứng tuyển mới",
        "Content": "Có 1 ứng viên mới ứng tuyển vào vị trí UI/UX Designer",
        "Time": "2025-11-27T10:30:00",
        "JobID": 1,
        "CandidateID": 50,
        "isRead": false
      }
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "totalPages": 16,
      "limit": 10
    },
    "unreadCount": 12
  },
  "message": "Notifications retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  nID,
  Title,
  Content,
  Time,
  JobID,
  CandidateID
FROM notification
WHERE EmployerID = ?
ORDER BY Time DESC
LIMIT ? OFFSET ?;
```

## 20. GET /api/employer/:employerId - Lấy thông tin employer

### Request
- **Method:** GET
- **URL:** `/api/employer/:employerId`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "employer": {
      "ID": 1,
      "Username": "employer1",
      "Email": "employer@company.com",
      "FName": "Nguyen",
      "LName": "Van A",
      "Phonenumber": "0123456789",
      "Address": "Hà Nội",
      "Profile_Picture": "avatar.jpg",
      "PackageName": "Premium",
      "NumberOfOpenedJob": 589,
      "purchaseDate": "2025-01-01"
    },
    "package": {
      "PackageName": "Premium",
      "cost": 5000000,
      "description": "Gói Premium cho doanh nghiệp",
      "time": 365
    }
  },
  "message": "Employer profile retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  e.ID,
  u.Username,
  u.Email,
  u.FName,
  u.LName,
  u.Phonenumber,
  u.Address,
  u.Profile_Picture,
  e.PackageName,
  e.NumberOfOpenedJob,
  e.purchaseDate,
  p.cost,
  p.desciption,
  p.time
FROM employer e
JOIN user u ON e.ID = u.ID
LEFT JOIN package p ON e.PackageName = p.PackageName
WHERE e.ID = ?;
```

## 21. GET /api/employer/:employerId/company - Lấy thông tin công ty

### Request
- **Method:** GET
- **URL:** `/api/employer/:employerId/company`
- **Headers:** 
  - `Authorization: Bearer {token}`

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "CompanyID": 1,
    "CName": "FPT Software",
    "CNationality": "Vietnam",
    "Website": "https://fpt-software.com",
    "Industry": "Information Technology",
    "CompanySize": 5000,
    "Logo": "logo.png",
    "Description": "Công ty công nghệ hàng đầu",
    "TaxNumber": 123456789,
    "EmployerID": 1
  },
  "message": "Company info retrieved successfully"
}
```

### SQL Query
```sql
SELECT 
  CompanyID,
  CName,
  CNationality,
  Website,
  Industry,
  CompanySize,
  Logo,
  Description,
  TaxNumber,
  EmployerID
FROM company
WHERE EmployerID = ?;
```