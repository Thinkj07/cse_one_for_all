# 1. Get toàn bộ profile

GET /api/candidate/profile
Response: {
  success: true,
  data: {
    // Personal
    fullName: "Nguyễn Văn A",
    avatar: "https://...",
    title: "Senior Developer",
    experience: "3-5 years",
    education: "Bachelor's",
    website: "https://...",
    
    // Profile detail
    nationality: "Vietnam",
    dateOfBirth: "1995-05-20",
    gender: "male",
    maritalStatus: "single",
    biography: "...",
    
    // Contact
    location: "Hanoi",
    phone: "+84912345678",
    email: "user@example.com",
    
    // Social links
    socialLinks: [
      { platform: "facebook", url: "..." },
      { platform: "linkedin", url: "..." }
    ],
    
    // Settings
    notifications: {
      shortlisted: true,
      jobAlerts: true,
      rejected: false
    },
    privacy: {
      profilePublic: true,
      resumePublic: false
    }
  }
}

# 2. Update profile (dùng chung cho tất cả tabs)

PUT /api/candidate/profile
Body: {
  // Gửi field nào cần update
  fullName: "...",
  biography: "...",
  socialLinks: [...],
  // etc
}
Response: {
  success: true,
  message: "Updated successfully"
}

# 3.Upload avatar 
POST /api/candidate/avatar
Content-Type: multipart/form-data
Body: { avatar: File }
Response: {
  success: true,
  data: { avatarUrl: "https://..." }
}

# 4. Get resume
GET /api/candidate/resumes
Response: {
  success: true,
  data: [
    { id: 1, name: "CV.pdf", size: "3.5 MB", url: "..." }
  ]
}

# 5. Upload resume
POST /api/candidate/resumes
Content-Type: multipart/form-data
Body: { name: "My CV", file: File }
Response: {
  success: true,
  data: { id: 4, name: "...", size: "...", url: "..." }
}

# 6. Delete resume
DELETE /api/candidate/resumes/:id
Response: { success: true }

# 7. Change password
PUT /api/candidate/password
Body: {
  currentPassword: "...",
  newPassword: "..."
}
Response: { success: true }

# 8. Get notifications
GET /api/candidate/notifications?type=all
// type: all | application | shortlist | interview | alert

Response: {
  success: true,
  data: {
    notifications: [
      {
        id: 1,
        type: "application",
        title: "Application Viewed",
        message: "Your application...",
        company: "Google Inc",
        time: "2 hours ago",
        isRead: false
      }
    ],
    unreadCount: 5
  }
}

# 9. Mark as read

PUT /api/candidate/notifications/:id/read
Response: { success: true }

// Hoặc đánh dấu tất cả
PUT /api/candidate/notifications/read-all
Response: { success: true }

# 10. Delete notification
DELETE /api/candidate/notifications/:id
Response: { success: true }

# 11. Get unread count 
GET /api/candidate/notifications/unread
Response: {
  success: true,
  data: { count: 5 }
}