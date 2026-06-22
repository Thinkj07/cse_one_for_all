# Game Programming - A1 (Whack-a-cheems)

## Install requirement and run
```bash
pip install pygame
python main.py
```

## Project Structure
```text
ASM1-Game/
├── assets/                  # Thư mục chứa tài nguyên game
│   ├── background/          
│   │   ├── bg.png           # Hình nền Menu/Settings
│   │   └── bg1.png          # Hình nền khi chơi (In-game)
│   ├── font/
│   │   └── Nunito-Bold.ttf  # Font chữ chính
│   ├── img/                 
│   │   ├── bonk1.png        # Búa trạng thái bình thường
│   │   ├── bonk2.png        # Búa trạng thái đập
│   │   ├── cheems.png       # Cheems bình thường
│   │   └── cheems_bonk.png  # Cheems bị đập
│   └── sound/
│       ├── bgm.mp3          # Nhạc nền
│       └── bonk.mp3         # Hiệu ứng âm thanh khi đập trúng
│
├── main.py                  # File chính (Main Entry):
│                            # - Xử lý vòng lặp game (Game Loop)
│                            # - Quản lý các màn hình (Menu, Settings, Game)
│                            # - Xử lý sự kiện và vẽ đồ họa
│
├── objects.py               # Định nghĩa các Class (Đối tượng):
│                            # - Zombie: Logic hoạt động của Cheems
│                            # - Button: Nút bấm giao diện
│                            # - Slider: Thanh trượt chỉnh âm lượng
│
├── settings.py              # Cấu hình chung:
│                            # - Kích thước màn hình, FPS
│                            # - Mã màu, đường dẫn file, nội dung text
│
└── README.md                # Tài liệu hướng dẫn
```
