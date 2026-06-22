import socket
import json
import threading
import queue

class Network:
    def __init__(self):
        self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.client.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        self.id = None
        self.connected = False
        self.recv_queue = queue.Queue()
        
    def connect(self, ip_address, port=5555):
        try:
            print(f"Connecting to {ip_address}:{port}...")
            self.client.settimeout(5) # 5 seconds to connect
            self.client.connect((ip_address, port))
            self.client.settimeout(None) # Reset
            
            # Read first packet
            data = self.client.recv(2048).decode()
            if data:
                for line in data.strip().split('\n'):
                    if line:
                        msg = json.loads(line)
                        if msg.get('type') == 'init':
                            self.id = msg.get('id')
            
            self.connected = True
            
            # Start background thread to listen
            threading.Thread(target=self.listen_thread, daemon=True).start()
            return True
        except Exception as e:
            print(f"[NETWORK ERROR] Cannot connect: {e}")
            self.connected = False
            return False

    def listen_thread(self):
        buffer = ""
        while self.connected:
            try:
                data = self.client.recv(4096).decode()
                if not data:
                    self.connected = False
                    break
                buffer += data
                while '\n' in buffer:
                    line, buffer = buffer.split('\n', 1)
                    if line.strip():
                        try:
                            parsed = json.loads(line)
                            self.recv_queue.put(parsed)
                        except json.JSONDecodeError:
                            print(f"[NETWORK ERROR] Failed to parse JSON: {line}")
            except Exception as e:
                print(f"[NETWORK DISCONNECT] {e}")
                self.connected = False
                break
                
    def send(self, data: dict):
        if self.connected:
            try:
                msg = json.dumps(data) + '\n'
                self.client.sendall(msg.encode())
            except socket.error as e:
                print(f"[NETWORK SEND ERROR] {e}")
                self.connected = False
                
    def get_events(self):
        events = []
        while not self.recv_queue.empty():
            events.append(self.recv_queue.get())
        return events
