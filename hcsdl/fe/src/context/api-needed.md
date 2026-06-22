1. GET /api/stats - Lấy thống kê tổng quan hệ thống (cho homepage)
```json
[
  {
    "icon": "briefcase",
    "number": "175,324",
    "label": "Live Job"
  },
  {
    "icon": "building",
    "number": "97,354",
    "label": "Companies"
  },
  {
    "icon": "users",
    "number": "3,847,154",
    "label": "Candidates"
  },
  {
    "icon": "file",
    "number": "7,532",
    "label": "New Jobs"
  },
  {
     "icon": "check-circle",
     "number": "45,832",
     "label": "Successful Hires"
   }
]
```

2. GET /api/categories
```json
[
  {
    "id": 1,
    "icon": "code",
    "name": "Software Engineering",
    "openPositions": 35241
  },
  {
    "id": 2,
    "icon": "layout",
    "name": "Frontend Developer",
    "openPositions": 18273
  },
  {
    "id": 3,
    "icon": "server",
    "name": "Backend Developer",
    "openPositions": 16192
  },
  {
    "id": 4,
    "icon": "smartphone",
    "name": "Mobile Developer",
    "openPositions": 9874
  },
  {
    "id": 5,
    "icon": "gitbranch",
    "name": "DevOps Engineer",
    "openPositions": 8201
  },
  {
    "id": 6,
    "icon": "bug",
    "name": "QA / Tester",
    "openPositions": 7834
  },
  {
    "id": 7,
    "icon": "palette",
    "name": "UI/UX Designer",
    "openPositions": 6923
  },
  {
    "id": 8,
    "icon": "cpu",
    "name": "AI / Machine Learning",
    "openPositions": 3741
  }
]
```

 ## 3.GET /api/companies/top - Lấy danh sách công ty nổi bật (cho homepage) (dùng hàm trong 2.4, cái nào trustscore cao thì xếp vào)
###Success Response (200)
```json
[
  {
    "CompanyID": 1,
    "CompanyName": "FPT Software",
    "Logo": "https://cdn.topcv.vn/100/company_logos/fpt-software-6159c8f08d0a8.jpg",
    "CompanySize": "25,000+ employees",
    "Website": "https://fpt-software.com",
    "Description": "Công ty công nghệ hàng đầu Việt Nam",
    "Industry": "Information Technology & Services",
    "CNationality": "Vietnam",
    "openPositions": 428,
    "rating": 4.8,
  },
  {
    "CompanyID": 2,
    "CompanyName": "VNG Corporation",
    "Logo": "https://cdn.topcv.vn/100/company_logos/vng-corporation-614e5f5e8d0a8.jpg",
    "CompanySize": "3,000 - 5,000 employees",
    "Website": "https://vng.com.vn",
    "Description": "Zalo • Zing • Cloud • Game",
    "Industry": "Internet",
    "CNationality": "Vietnam",
    "openPositions": 312,
    "rating": 4.7,
    }
    ]
    
```

## 4. GET /jobs - Job List Response

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "JobID": 1,
        "JobName": "Trưởng Phòng Kinh Doanh BDS",
        "CompanyName": "CÔNG TY CỔ PHẦN ĐỊA ỐC MAI VIỆT",
        "CompanyLogo": "https://cdn.example.com/logos/mai-viet.png",
        "Location": "Hồ Chí Minh",
        "ContractType": "Fulltime",
        "JobType": "Onsite",
        "Level": "Manager",
        "Salary": "12 - 300 triệu",
        "RequireExpYear": 3,
        "postDate": "2024-11-20T10:30:00Z",
        "expireDate": "2024-12-25T23:59:59Z",
        "NumberOfApplicant": 25,
        "Views": 150,
        "featured": true,
        "urgent": false,
        "JobStatus": "published",
        "statistics": [
  {
    "label": "Total Applications",
    "number": "87"
  },
  {
    "label": "Approved Applications",
    "number": "12"
  },
  {
    "label": "Declined Applications",
    "number": "68"
  }]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_jobs": 25,
      "per_page": 9,
      "has_next": true,
      "has_prev": false
    }
  },
  "message": "Jobs retrieved successfully"
}
```

## 5. GET /jobs/{jobId} - Job Details Response

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "JobID": 1,
    "JobName": "Trưởng Phòng Kinh Doanh BDS - (Thu Nhập Không Giới Hạn) Tại Hồ Chí Minh",
    "JD": "Quản lý, đào tạo và theo dõi hiệu quả bán hàng của nhóm...",
    "Location": "Hồ Chí Minh",
    "salaryFrom": 12000000,
    "salaryTo": 300000000,
    "Salary": "12 - 300 triệu",
    "Quantity": 5,
    "RequireExpYear": 3,
    "Level": "Manager",
    "ContractType": "Fulltime",
    "JobType": "Onsite",
    "JobStatus": "published",
    "postDate": "2024-11-20T10:30:00Z",
    "expireDate": "2024-12-25T23:59:59Z",
    "NumberOfApplicant": 87,
    "statistics": [
  {
    "label": "Total Applications",
    "number": "87"
  },
  {
    "label": "Approved Applications",
    "number": "12"
  },
  {
    "label": "Declined Applications",
    "number": "68"
  }
]
    "Views": 1250,
    "featured": true,
    "urgent": false,
    "company": {
      "CompanyID": 1,
      "CompanyName": "CÔNG TY CỔ PHẦN ĐỊA ỐC MAI VIỆT",
      "TaxNumber": "0123456789",
      "Industry": "Real Estate",
      "CompanySize": "201-500",
      "Website": "https://maiviet.com.vn",
      "Nationality": "Vietnam",
      "Logo": "https://cdn.example.com/logos/mai-viet.png",
      "Description": "Công ty Cổ phần Địa ốc Mai Việt...",
      "Address": "123 Nguyễn Huệ, Q1, HCM"
    },
    "categories": [
      {
        "JCName": "Real Estate",
        "Speciality": "Bất động sản và đầu tư"
      }
    ],
    "requiredSkills": [
      {
        "SkillName": "Sales Management",
        "RequiredLevel": "Advanced",
        "IsRequired": true,
        "Description": "Kỹ năng quản lý bán hàng"
      }
    ]
  },
  "message": "Job details retrieved successfully"
}
```

## 6. POST /jobs/{jobId}/favorite - Favorite Job

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "JobID": 1,
    "favorited": true,
    "SaveDate": "2024-11-25T14:30:00Z"
  },
  "message": "Job added to favorites successfully"
}
```

## 7. POST /jobs/{jobId}/apply - Apply for Job

### Request Body
```json
{
  "CoverLetter": "Kính gửi Ban tuyển dụng...",
  "uploadCV": "https://storage.example.com/resumes/user123.pdf"
}
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "JobID": 1,
    "UserID": 50,
    "Status": "submitted",
    "applied_at": "2024-11-25T14:30:00Z"
  },
  "message": "Đơn ứng tuyển đã được gửi thành công"
}
```

## 8. GET /jobs/{jobId}/check-status - Check User Status

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "JobID": 1,
    "favorited": true,
    "applied": false,
    "canApply": true,
    "applicationDeadline": "2024-12-25T23:59:59Z"
  },
  "message": "Job status retrieved successfully"
}
```

## 9. GET /api/candidate/dashboard - Check User Status

### Success Response (200)
```json
{
  "user": {
    "name": "Nguyễn Văn A",
    "avatar": "https://...",
    "profileCompletion": 68
  },
  "stats": {
    "appliedJobs": 589,
    "favoriteJobs": 238,
    "jobAlerts": 574
  },
  "recentApplications": [
    {
      "id": 123,
      "jobId": 456,
      "title": "Kỹ sư Mạng",
      "company": "TechViet",
      "logo": "https://...",
      "location": "Hà Nội",
      "salary": "Thoả thuận",
      "type": "Remote",
      "appliedAt": "2025-08-10T10:00:00Z",
      "status": "pending" // hoặc "interview", "rejected", "accepted"
    }
  ]
}
```
## 10. POST /api/candidate/logout

## 11. GET /api/candidate/applications (cho nút “Xem tất cả”)
```json
{
  "applications": [ ...danh sách đầy đủ... ],
  "pagination": {
    "total": 589,
    "page": 1,
    "limit": 20,
    "totalPages": 30
  }
}