// Chờ cho toàn bộ trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // Lấy các phần tử (element) từ HTML
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Hàm xử lý đăng nhập
    const handleLogin = async () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Xóa thông báo lỗi cũ
        errorMessage.textContent = '';

        // Kiểm tra cơ bản
        if (!username || !password) {
            errorMessage.textContent = 'Please enter both username and password.';
            return;
        }

        try {
            // Gọi API /login (được định nghĩa trong start_sampleapp.py)
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (response.ok) {
                // Đăng nhập thành công, server đã set cookie
                // Chuyển hướng người dùng đến trang chat
                window.location.href = '/chat';
            } else {
                // Đăng nhập thất bại (sai pass, hoặc lỗi 401)
                errorMessage.textContent = 'Invalid username or password.';
            }

        } catch (err) {
            // Lỗi mạng (không kết nối được server)
            errorMessage.textContent = 'Connection error. Is the server running?';
        }
    };

    // Gán sự kiện cho nút Login
    loginButton.addEventListener('click', handleLogin);

    // Cho phép nhấn Enter để đăng nhập
    passwordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    });
});