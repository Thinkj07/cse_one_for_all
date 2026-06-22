// static/js/chat.js
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lấy các phần tử DOM ---
    const channelListDiv = document.getElementById('channel-list');
    const userListDiv = document.getElementById('user-list');
    const currentChatHeader = document.getElementById('current-chat-header');
    const messagesWindow = document.getElementById('messages-window');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const sidebarHeader = document.getElementById('sidebar-header');

    // --- 2. Biến trạng thái (Global State) ---
    let myUsername = ""; 
    let intervals = {};
    let currentChatContext = { type: 'channel', id: 'general' };
    
    // CSDL Client-side (Lưu P2P chat và tin chưa đọc)
    let clientChatHistory = {};
    let unreadCounts = {}; 

    const stunConfig = {
        iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ]
    };
    let peerConnections = {};
    let dataChannels = {};

    // --- 3. Các hàm gọi API (Giao tiếp với Backend) ---

    // (Lấy tên, kênh, và danh sách user)
    const updateSidebar = async () => {
        try {
            const response = await fetch('/get-sidebar-data');
            if (response.status === 401) window.location.href = '/login.html';
            if (!response.ok) return;
            const data = await response.json();
            
            // 3a. Vẽ lại danh sách Kênh
            const channels = data.channels || [];
            channelListDiv.innerHTML = '';
            channels.forEach(channel => {
                const item = document.createElement('div');
                item.className = 'list-item';
                let unreadCount = unreadCounts[channel] || 0;
                let badge = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : '';
                item.innerHTML = `# ${channel} ${badge}`;
                if (currentChatContext.type === 'channel' && currentChatContext.id === channel) {
                    item.classList.add('active');
                }
                item.addEventListener('click', () => selectChannel(channel));
                channelListDiv.appendChild(item);
            });

            // 3b. Vẽ lại danh sách User
            const users = data.users || [];
            userListDiv.innerHTML = '';
            users.forEach(user => {
                const item = document.createElement('div');
                item.className = 'list-item user-item';
                let unreadCount = unreadCounts[user] || 0;
                let badge = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : '';
                const nameSpan = document.createElement('span');
                nameSpan.className = 'user-item-name';
                nameSpan.innerHTML = `<span class="user-item-status"></span> ${user} ${badge}`;
                const connectBtn = document.createElement('button');
                connectBtn.className = 'connect-button';
                connectBtn.textContent = 'Chat P2P';
                connectBtn.onclick = (e) => {
                    e.stopPropagation();
                    initiateP2P(user);
                };
                item.appendChild(nameSpan);
                item.appendChild(connectBtn);
                nameSpan.addEventListener('click', () => selectUserChat(user));
                if (currentChatContext.type === 'peer' && currentChatContext.id === user) {
                    item.classList.add('active');
                }
                userListDiv.appendChild(item);
            });
        } catch (err) { console.error("Error updating sidebar:", err); }
    };
    
    // (Lấy tin nhắn KÊNH)
    const getChannelMessages = async () => {
        // Chỉ chạy nếu đang xem kênh
        if (currentChatContext.type !== 'channel') return;

        try {
            const response = await fetch('/get-messages-channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: currentChatContext.id })
            });
            if (!response.ok) return;
            const data = await response.json();
            const messages = data.messages || [];

            // Kiểm tra tin nhắn chưa đọc (cho các kênh KHÁC)
            // (Phần này ta sẽ làm sau, giờ tập trung vào render đúng)

            // Cập nhật CSDL client
            clientChatHistory[currentChatContext.id] = messages;
            
            // Vẽ lại nếu đang xem kênh này
            renderMessages(messages);

        } catch (err) { console.error("Error getting channel messages:", err); }
    };
    
    // (Hàm này chạy khi nhấn nút Gửi)
    const sendMessage = async () => {
        const message = messageInput.value;
        if (!message || !currentChatContext.id) return;

        // 1. Gửi tin nhắn KÊNH (Client-Server)
        if (currentChatContext.type === 'channel') {
            try {
                // Chỉ gửi và quên đi
                await fetch('/send-message-channel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channel: currentChatContext.id,
                        message: message
                    })
                });
                messageInput.value = ''; // Xóa ô nhập
                
                
                
            } catch (err) {
                addMessageToWindow('System', 'Error sending message', 'received');
            }
        }
        
        // 2. Gửi tin nhắn P2P (WebRTC)
        if (currentChatContext.type === 'peer') {
            const dc = dataChannels[currentChatContext.id];
            if (dc && dc.readyState === 'open') {
                const msgData = { sender: myUsername, message: message, timestamp: Date.now() };
                dc.send(JSON.stringify(msgData)); // Gửi P2P
                
                saveP2PMessage(currentChatContext.id, msgData);
                
                addMessageToWindow(myUsername, message, 'sent'); // Hiển thị tin của mình
                messageInput.value = '';
            } else {
                addMessageToWindow('System', 'P2P Connection not ready.', 'received');
            }
        }
    };
    
    const sendHeartbeat = async () => {
        try {
            const response = await fetch('/heartbeat', { method: 'POST' });
            if (!response.ok) window.location.href = '/login.html';
        } catch (err) { window.location.href = '/login.html'; }
    };

    const pollSignals = async () => {
        try {
            const response = await fetch('/get-signals');
            if (!response.ok) return;
            const data = await response.json();
            for (const signal of data.signals) {
                await handleIncomingSignal(signal);
            }
        } catch (err) { console.error("Signal poll error:", err); }
    };
    
    const sendSignal = async (recipient, signal) => {
        await fetch('/send-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient, signal })
        });
    };

    // --- 4. Logic WebRTC (Trái tim P2P) ---

    // (Cài đặt các sự kiện cho Data Channel)
    const setupDataChannelEvents = (username, dc) => {
        dc.onopen = () => {
            console.log(`P2P Data channel to ${username} is OPEN!`);
            selectUserChat(username);
            addMessageToWindow('System', `P2P connection to ${username} established.`, 'received');
        };
        dc.onmessage = (event) => {
            console.log(`P2P message from ${username}`);
            const msgData = JSON.parse(event.data);
            
            saveP2PMessage(username, msgData);

            if (currentChatContext.type !== 'peer' || currentChatContext.id !== username) {
                unreadCounts[username] = (unreadCounts[username] || 0) + 1;
                updateSidebar(); // Cập nhật "chấm đỏ"
            }

            if (currentChatContext.type === 'peer' && currentChatContext.id === username) {
                addMessageToWindow(msgData.sender, msgData.message, 'received');
            }
        };
        dc.onclose = () => {
            console.log(`P2P Data channel to ${username} is CLOSED.`);
            if (currentChatContext.type === 'peer' && currentChatContext.id === username) {
                addMessageToWindow('System', `Connection to ${username} lost.`, 'received');
            }
            delete peerConnections[username];
            delete dataChannels[username];
        };
    };

    // (Tạo kết nối P2P)
    const initiateP2P = (username) => {
        // (Giữ nguyên logic initiateP2P, createOffer...)
        console.log(`Initiating P2P connection to: ${username}`);
        if (peerConnections[username]) {
             selectUserChat(username);
             return;
        }
        const pc = new RTCPeerConnection(stunConfig);
        peerConnections[username] = pc;
        pc.onicecandidate = (event) => {
            if (event.candidate) sendSignal(username, { ice: event.candidate });
        };
        const dc = pc.createDataChannel('chat');
        dataChannels[username] = dc;
        setupDataChannelEvents(username, dc); 
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => sendSignal(username, { sdp: pc.localDescription }))
            .catch(e => console.error(`Create Offer error: ${e}`));
        selectUserChat(username);
        addMessageToWindow('System', `Sending P2P connection request to ${username}...`, 'received');
    };

    // (Xử lý tín hiệu P2P)
    const handleIncomingSignal = async (signal) => {
        // (Giữ nguyên logic handleIncomingSignal, setRemoteDescription, createAnswer...)
        const sender = signal.sender;
        let pc = peerConnections[sender];
        if (!pc) {
            console.log(`Accepting P2P invitation from: ${sender}`);
            pc = new RTCPeerConnection(stunConfig);
            peerConnections[sender] = pc;
            pc.onicecandidate = (event) => {
                if (event.candidate) sendSignal(sender, { ice: event.candidate });
            };
            pc.ondatachannel = (event) => {
                const dc = event.channel;
                dataChannels[sender] = dc;
                setupDataChannelEvents(sender, dc);
            };
        }
        try {
            if (signal.sdp) {
                if (signal.sdp.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    await sendSignal(sender, { sdp: answer });
                } else if (signal.sdp.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                }
            } else if (signal.ice) {
                await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
            }
        } catch (err) { console.error(`Signal handling error: ${err}`); }
    };

    // --- 5. Các hàm xử lý Giao diện (UI Helpers) ---
    
    // (HÀM MỚI: Lưu tin nhắn P2P vào CSDL client)
    const saveP2PMessage = (username, msgData) => {
        if (!clientChatHistory[username]) {
            clientChatHistory[username] = [];
        }
        clientChatHistory[username].push(msgData);
    };
    
    // (HÀM SỬA: Vẽ lại khung chat từ CSDL client/server)
    const renderMessages = (messagesFromServer) => {
        if (!myUsername) return; 
        
        let messages = [];
        let contextId = currentChatContext.id;
        
        // Nếu là chat kênh, dùng data từ server
        if (currentChatContext.type === 'channel') {
            messages = messagesFromServer;
        }
        // Nếu là chat P2P, dùng data từ CSDL client
        else if (currentChatContext.type === 'peer') {
            messages = clientChatHistory[contextId] || [];
        }
        
        // Chỉ render nếu đang xem đúng kênh/user
        if (contextId !== currentChatContext.id) return;

        messagesWindow.innerHTML = '';
        messages.forEach(msg => {
            const type = (msg.sender === myUsername) ? 'sent' : 'received';
            addMessageToWindow(msg.sender, msg.message, type);
        });
        messagesWindow.scrollTop = messagesWindow.scrollHeight;
    };

    // (HÀM SỬA: Thêm CSS Trái/Phải)
    const addMessageToWindow = (sender, message, type) => {
        const msgGroup = document.createElement('div');
        msgGroup.className = `message-group ${type}`;
        
        if (type === 'received') {
            const senderSpan = document.createElement('div');
            senderSpan.className = 'message-sender';
            senderSpan.textContent = sender;
            msgGroup.appendChild(senderSpan);
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        msgGroup.appendChild(contentDiv);
        messagesWindow.appendChild(msgGroup);

        if (type === 'sent' || (messagesWindow.scrollTop + messagesWindow.clientHeight >= messagesWindow.scrollHeight - 50)) {
             messagesWindow.scrollTop = messagesWindow.scrollHeight;
        }
    };

    // (HÀM SỬA: Click vào KÊNH -> Reset chấm đỏ)
    const selectChannel = (channelName) => {
        currentChatContext = { type: 'channel', id: channelName };
        currentChatHeader.textContent = `# ${channelName}`;
        messageInput.placeholder = `Message #${channelName}...`;
        
        unreadCounts[channelName] = 0; // Reset chấm đỏ

        if (intervals.messages) clearInterval(intervals.messages);
        
        getChannelMessages(); // Tải lịch sử chat kênh
        intervals.messages = setInterval(getChannelMessages, 2000); // Poll tin nhắn kênh
        
        updateSidebar();
    };

    // (HÀM SỬA: Click vào TÊN USER -> Reset chấm đỏ)
    const selectUserChat = (username) => {
        currentChatContext = { type: 'peer', id: username };
        currentChatHeader.textContent = `Chat with ${username}`;
        messageInput.placeholder = `Message ${username} (P2P)...`;

        unreadCounts[username] = 0; // Reset chấm đỏ

        if (intervals.messages) clearInterval(intervals.messages); 

        // Vẽ lại lịch sử chat P2P đã lưu
        renderMessages([]); 

        const dc = dataChannels[username];
        if (dc && dc.readyState === 'open') {
            addMessageToWindow('System', `P2P connection to ${username} is active.`, 'received');
        } else {
            addMessageToWindow('System', `Connecting to ${username}...`, 'received');
            initiateP2P(username);
        }

        updateSidebar();
    };

    // --- 6. Khởi chạy ứng dụng ---
    const initializeChat = async () => {
        // 1. Lấy tên của chính mình
        try {
            const response = await fetch('/get-my-username');
            const data = await response.json();
            myUsername = data.username;
            if (!myUsername) throw new Error('Not logged in');
            sidebarHeader.textContent = `Welcome, ${myUsername}`;
        } catch (err) {
            window.location.href = '/login.html';
            return;
        }

        // 2. Bắt đầu các vòng lặp (Polling)
        sendHeartbeat();
        updateSidebar();
        pollSignals(); 

        intervals.heartbeat = setInterval(sendHeartbeat, 2000); 
        intervals.sidebar = setInterval(updateSidebar, 3000); 
        intervals.signals = setInterval(pollSignals, 2000); 
        
        // 3. Tải tin nhắn kênh #general (mặc định)
        selectChannel('general');

        // 4. Gán sự kiện
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    };
    
    // Chạy!
    initializeChat();
});