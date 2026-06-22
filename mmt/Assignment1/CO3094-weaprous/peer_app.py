# peer_app.py

import json
import time
import socket
import argparse
import threading
import requests # Đảm bảo đã pip install requests
from daemon.weaprous import WeApRous

# --- Cấu hình ---
TRACKER_URL = "http://192.168.1.174:9000" # Dùng IP LAN
MY_IP = "192.168.1.174"                   # Dùng IP LAN
MY_PORT = 0 
app = WeApRous()

# Tạo một session để TỰ ĐỘNG LƯU COOKIE
session = requests.Session()

# --- API nhận tin nhắn (Giữ nguyên) ---
@app.route('/receive-message', methods=['POST'])
def receive_message_handler(req, resp):
    # ... (Giữ nguyên code in tin nhắn màu xanh)
    try:
        body_str = req.body.decode('utf-8') if isinstance(req.body, bytes) else req.body
        msg_data = json.loads(body_str)
        sender = msg_data.get('sender', 'Unknown')
        message = msg_data.get('message', '')
        
        print(f"\r\033[92m[RECEIVED] from {sender}: {message}\033[0m") 
        print("You: ", end="", flush=True) 

        resp.status_code = 200
        resp.reason = "OK"
    except Exception as e:
        print(f"\r[ERROR receiving message] {e}")
        print("You: ", end="", flush=True)
        resp.status_code = 400

# --- Các hàm hỗ trợ Client P2P (Sửa lại để dùng session) ---

def login_and_register():
    """Gộp cả Login (Task 1) và Register (Task 2)"""
    print(f"[Peer] Connecting to tracker at {TRACKER_URL}...")
    
    # BƯỚC 1: ĐĂNG NHẬP (dùng session)
    try:
        print("[Peer] Logging in...")
        login_resp = session.post(f"{TRACKER_URL}/login", 
                                  json={"username": "admin", "password": "password"}, 
                                  timeout=2)
        if login_resp.status_code != 200:
            print(f"[Peer] Login failed! Status: {login_resp.status_code}")
            return False
        print("[Peer] Login successful! Cookie obtained.")
    except Exception as e:
        print(f"[Peer] Could not login to tracker: {e}")
        return False

    # BƯỚC 2: ĐĂNG KÝ (dùng session, nó sẽ tự gửi cookie)
    try:
        payload = {"ip": MY_IP, "port": MY_PORT, "name": f"Peer@{MY_PORT}"}
        reg_resp = session.post(f"{TRACKER_URL}/submit-info", json=payload, timeout=2)
        if reg_resp.status_code == 200:
             print("[Peer] Registration successful!")
             return True
        else:
             print(f"[Peer] Registration denied. Status: {reg_resp.status_code}")
             return False
    except Exception as e:
        print(f"[Peer] Registration failed: {e}")
        return False

def get_peers_list():
    """Lấy danh sách peer (dùng session để gửi cookie)"""
    try:
        resp = session.get(f"{TRACKER_URL}/get-list", timeout=1)
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"[Tracker] Error getting peer list (status {resp.status_code}).")
    except Exception as e:
        print(f"[Tracker] Failed to get peers: {e}")
    return {} # Trả về rỗng nếu lỗi

def broadcast_message(message):
    """Gửi tin nhắn P2P VÀ gửi lên Server cho Web UI"""
    
    # 1. Gửi lên Server (cho Web UI)
    try:
        payload = {"sender": f"Peer@{MY_PORT}", "message": message}
        session.post(f"{TRACKER_URL}/submit-message", json=payload, timeout=1)
    except Exception as e:
        print(f"[Error] Could not submit message to server: {e}")

    # 2. Gửi P2P (cho các terminal peer khác)
    peers = get_peers_list()
    my_key = f"{MY_IP}:{MY_PORT}"
    
    if not peers:
        print("[Warning] No other peers found to send message P2P.")

    for peer_key, peer_info in peers.items():
        if peer_key != my_key:
            target_url = f"http://{peer_info.get('ip')}:{peer_info.get('port')}/receive-message"
            threading.Thread(target=send_one_message, args=(target_url, message)).start()

def send_one_message(url, message):
    """Hàm phụ để gửi 1 tin nhắn"""
    try:
        # Thêm print debug bạn đã thêm
        print(f"[DEBUG] Sending to {url}...")
        payload = {"sender": f"Peer@{MY_PORT}", "message": message}
        # Dùng requests.post thường, không cần session khi giao tiếp P2P
        requests.post(url, json=payload, timeout=1) 
    except Exception as e:
        print(f"[Error] Could not send to {url}: {e}")

# --- Vòng lặp nhập liệu chat (Sửa lại tên hàm) ---
def chat_input_loop():
    time.sleep(2)
    if not login_and_register(): # <--- Gọi hàm gộp mới
        print("[Error] Cannot connect to Tracker. Is it running?")
        return

    print("\n--- CHAT READY! Type your message and press Enter ---")
    while True:
        try:
            msg = input("You: ")
            if msg.strip():
                broadcast_message(msg)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting chat...")
            break

# --- MAIN (Giữ nguyên) ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='PeerApp')
    parser.add_argument('--port', type=int, required=True, help="Port for this peer to listen on")
    args = parser.parse_args()
    
    MY_PORT = args.port

    threading.Thread(target=chat_input_loop, daemon=True).start()

    print(f"--- PEER STARTED ON PORT {MY_PORT} ---")
    app.prepare_address("0.0.0.0", MY_PORT)
    app.run()