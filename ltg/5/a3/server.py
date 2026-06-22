import socket
import threading
import json

HOST = '0.0.0.0'
PORT = 5555

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

try:
    server.bind((HOST, PORT))
except socket.error as e:
    print(str(e))
    exit(1)

server.listen(2)
print(f"== Multiplayer Game Server Started ==")
print(f"Listening on port {PORT}...")

clients = []
client_id_counter = 1

def threaded_client(conn, player_id):
    # Send initial player id
    init_msg = json.dumps({"type": "init", "id": player_id}) + "\n"
    try:
        conn.send(init_msg.encode())
    except:
        return

    while True:
        try:
            data = conn.recv(4096)
            if not data:
                break
            
            # Broadcast raw data to clients
            for c in clients:
                if c != conn:
                    try:
                        c.send(data)
                    except:
                        pass
        except Exception as e:
            print(f"Connection error for Player {player_id}: {e}")
            break

    print(f"Player {player_id} disconnected.")
    if conn in clients:
        clients.remove(conn)
        
    disconnect_msg = json.dumps({"type": "disconnected", "id": player_id}) + "\n"
    for c in clients:
        try:
            c.send(disconnect_msg.encode())
        except:
            pass
            
    conn.close()

while True:
    conn, addr = server.accept()
    print(f"Connected to: {addr[0]}:{addr[1]}")
    clients.append(conn)
    thread = threading.Thread(target=threaded_client, args=(conn, client_id_counter), daemon=True)
    thread.start()
    
    # Toggle id between 1 and 2
    client_id_counter = 2 if client_id_counter == 1 else 1
