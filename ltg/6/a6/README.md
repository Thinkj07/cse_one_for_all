# Hướng Dẫn Chi Tiết: Chuyển Đổi FPS Game Từ Singleplayer Sang Multiplayer Bằng NGO

Chào bạn, để giải quyết thử thách này, chúng ta sẽ sử dụng gói **Netcode for GameObjects (NGO)** của Unity. NGO là hệ thống mạng chính thức và mới nhất của Unity, rất phù hợp cho các game như FPS.

Do bạn là người mới làm quen với Unity, tôi sẽ hướng dẫn từng bước click chuột thật chi tiết nhé!

---

## Giai đoạn 1: Cài đặt Netcode for GameObjects (NGO)

Trước tiên, chúng ta cần tải thư viện mạng của Unity về dự án.

1. Nhìn lên thanh công cụ trên cùng của Unity, chọn **Window** > **Package Manager**.
2. Một cửa sổ mới hiện ra. Ở góc trên cùng bên trái của cửa sổ này, bạn sẽ thấy dấu cộng `+`. Click vào đó.
3. Chọn **Add package by name...**
4. Một ô nhập chữ hiện ra, bạn nhập chính xác dòng này vào: `com.unity.netcode.gameobjects`
5. Nhấn nút **Add** và chờ Unity cài đặt (có thể mất vài phút).

---

## Giai đoạn 2: Tạo Network Manager (Bộ Quản Lý Mạng)

Network Manager là "trái tim" của chế độ nhiều người chơi, giúp quản lý việc kết nối.

1. Chúng ta sẽ làm việc trong Scene đầu tiên của bạn (có thể là MainMenu hoặc Scene dùng để test). Ở cửa sổ **Hierarchy** (thường nằm bên trái, chứa danh sách các vật thể), click **chuột phải** vào một khoảng trống.
2. Chọn **Create Empty**. Một vật thể trống sẽ xuất hiện với tên mặc định là `GameObject`.
3. Nhìn sang cửa sổ **Inspector** (thường nằm bên phải). Ở ô tên vật thể (trên cùng), đổi tên `GameObject` thành `NetworkManager`.
4. Nhìn xuống dưới trong cửa sổ **Inspector**, nhấn vào nút **Add Component**.
5. Gõ chữ `NetworkManager` vào ô tìm kiếm và click vào kết quả tương ứng để thêm nó.
6. Lúc này, trong thành phần NetworkManager bạn vừa thêm, tìm dòng **Network Transport**. Nó sẽ ghi là *(None)*. Click vào dòng chữ *(None)* đó và chọn **Unity Transport**.

---

## Giai đoạn 3: Chuẩn bị Player Prefab (Nhân vật của người chơi)

"Prefab" là một mẫu vật thể được lưu sẵn để game có thể tạo ra nhiều bản sao (nhiều người chơi).

1. Trong cửa sổ **Project** (thường ở phía dưới, quản lý file), tìm đến file chứa nhân vật chính của game (Player). Nó thường là một khối vuông màu xanh dương (Prefab).
2. Click **đúp chuột** vào Prefab đó để mở nó lên chỉnh sửa.
3. Nhìn sang cửa sổ **Inspector**, nhấn **Add Component**, tìm và thêm `NetworkObject`. (Thành phần này báo cho Unity biết đây là một vật thể cần được đồng bộ qua mạng).
4. Nhấn nút mũi tên trái `<` ở góc trên cùng bên trái của cửa sổ **Hierarchy** để thoát khỏi chế độ chỉnh sửa Prefab.
5. Click chọn lại vào cái `NetworkManager` mà ta đã tạo ở Giai đoạn 2.
6. Trong cửa sổ **Inspector** của NetworkManager, kéo cuộn xuống tìm phần **Player Prefab**.
7. Kéo thả cái Player Prefab màu xanh từ cửa sổ Project vào ô trống bên cạnh chữ **Player Prefab**. (Điều này nói cho game biết: "Khi có người tham gia, hãy tạo ra nhân vật này").

---

## Giai đoạn 4: Chỉnh sửa Code của Player

Game Singleplayer hiện tại cho phép mọi bàn phím điều khiển nhân vật. Nhưng trong Multiplayer, người chơi 1 chỉ được điều khiển nhân vật 1, người chơi 2 chỉ điều khiển nhân vật 2.

1. Mở script điều khiển nhân vật (thường tên là `PlayerCharacterController.cs` hoặc tương tự).
2. Ở dòng đầu tiên của file, thêm thư viện mạng:
   ```csharp
   using Unity.Netcode;
   ```
3. Đổi lớp kế thừa từ `MonoBehaviour` sang `NetworkBehaviour`.
   *Từ:*
   ```csharp
   public class PlayerCharacterController : MonoBehaviour
   ```
   *Thành:*
   ```csharp
   public class PlayerCharacterController : NetworkBehaviour
   ```
4. Tìm hàm `Update()` (hàm xử lý việc ấn nút chạy/bắn). Thêm đoạn kiểm tra này vào **NGAY DÒNG ĐẦU TIÊN** bên trong hàm `Update()`:
   ```csharp
   void Update() 
   {
       // Nếu nhân vật này không thuộc về người chơi trên máy này, thì không cho phép điều khiển
       if (!IsOwner) return;

       // ... (Các code xử lý di chuyển, bắn súng cũ giữ nguyên ở dưới)
   }
   ```
5. Lưu file (Ctrl + S) và quay lại Unity Editor.

---

## Giai đoạn 5: Tạo màn hình Lobby (Host / Join)

Bây giờ ta làm màn hình để chọn ai làm chủ phòng (Host) và ai làm người tham gia (Client).

1. Chọn **File** > **New Scene** > Chọn **Basic (Built-in)** > **Create**.
2. Lưu Scene này lại: **File** > **Save As...** > đặt tên là `LobbyScene` và lưu vào thư mục Scenes.
3. Chuyển Scene này vào Build Settings: **File** > **Build Settings**. Nhấn **Add Open Scenes**.
4. Thiết kế nút bấm:
   - Click chuột phải vào **Hierarchy** > **UI** > **Button - TextMeshPro**. 
   - Nó sẽ tạo ra một cái Nút (Button) trên màn hình và một cái Canvas chứa nó.
   - Đổi tên Nút này thành `Btn_Host`. Nhấn vào cái nút trỏ xuống bên cạnh Nút trong Hierarchy để thấy chữ `Text`, đổi text thành "Tạo Phòng (Host)".
   - Làm tương tự, tạo một nút thứ hai, đổi tên thành `Btn_Join`, đổi text thành "Tham Gia (Client)".
5. Tạo một script điều khiển UI:
   - Trong cửa sổ **Project**, click chuột phải vào thư mục Scripts > **Create** > **C# Script**.
   - Đặt tên là `NetworkLobbyUI`.
   - Click đúp để mở file này lên và dán đoạn code sau vào:

```csharp
using UnityEngine;
using UnityEngine.UI;
using Unity.Netcode;
using UnityEngine.SceneManagement;

public class NetworkLobbyUI : MonoBehaviour
{
    public Button hostButton;
    public Button clientButton;

    private void Awake()
    {
        // Gắn sự kiện khi bấm nút Host
        hostButton.onClick.AddListener(() =>
        {
            NetworkManager.Singleton.StartHost();
            // Load vào màn chơi chính (nhớ đổi "MainGameScene" thành tên Scene game của bạn)
            NetworkManager.Singleton.SceneManager.LoadScene("MainScene", LoadSceneMode.Single);
        });

        // Gắn sự kiện khi bấm nút Client (Join)
        clientButton.onClick.AddListener(() =>
        {
            NetworkManager.Singleton.StartClient();
        });
    }
}
```
6. Gắn script vào Scene:
   - Chuột phải vào **Hierarchy** > **Create Empty**, đổi tên thành `LobbyManager`.
   - Kéo cái script `NetworkLobbyUI` thả vào `LobbyManager`.
   - Trong Inspector của LobbyManager, nó sẽ đòi `Host Button` và `Client Button`. Bạn kéo thả hai cái nút `Btn_Host` và `Btn_Join` từ Hierarchy vào 2 ô tương ứng.

---

## Giai đoạn 6: Đồng bộ vị trí (Chạy thử)

1. Để 2 người chơi nhìn thấy nhau di chuyển, bạn cần đồng bộ vị trí.
2. Mở lại **Player Prefab** (như đã làm ở Giai đoạn 3).
3. Nhấn **Add Component**, tìm chữ `NetworkTransform` và thêm vào.
4. Xong! Bạn hãy lưu toàn bộ Project (Ctrl + S). 

**Cách để chạy thử 2 người:**
- Bạn vào **File** > **Build and Run** để xuất ra một cửa sổ game chạy riêng.
- Đồng thời bạn nhấn nút Play ngay trong Unity Editor.
- Cửa sổ ngoài bạn bấm "Host", cửa sổ Unity Editor bạn bấm "Client" (hoặc ngược lại). 

Chúc mừng! Bạn đã chuyển đổi thành công từ game Singleplayer sang một game Multiplayer cơ bản!

> *Lưu ý: Do quy định toàn cục về việc chỉ tạo file `README.md`, tôi đã viết tài liệu hướng dẫn này vào file `README.md` ở thư mục gốc thay vì `content.md` như bạn yêu cầu. Bạn có thể đọc trực tiếp file này nhé!*
