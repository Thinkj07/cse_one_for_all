# Reinforcement Learning — Deep Q-Learning trên game Atari Pong

## 1. Giới thiệu (Motivation & Background)

### 1.1. Động lực thực hiện

#### 1.1.1. Vì sao chọn Reinforcement Learning?

Reinforcement Learning (Học tăng cường) là một trong ba nhánh chính của Machine Learning, bên cạnh Supervised Learning (Học có giám sát) và Unsupervised Learning (Học không giám sát). Khác với hai phương pháp còn lại, Reinforcement Learning không yêu cầu tập dữ liệu được gán nhãn sẵn hay tìm kiếm cấu trúc ẩn trong dữ liệu. Thay vào đó, một **agent** (tác tử) học cách hành động thông qua quá trình **thử và sai** (trial-and-error), tương tác trực tiếp với **environment** (môi trường) và nhận về các **reward** (phần thưởng) hoặc **penalty** (phạt) dưới dạng tín hiệu số (scalar signal). Mục tiêu của agent là tìm ra **policy** (chiến lược) tối ưu nhằm tối đa hóa **cumulative reward** (tổng phần thưởng tích lũy) theo thời gian.

Cách tiếp cận này phản ánh sát cơ chế học tập tự nhiên của con người và động vật — học từ hậu quả của hành động — do đó mang ý nghĩa quan trọng cả về mặt lý thuyết lẫn ứng dụng thực tiễn. Reinforcement Learning đã chứng minh khả năng giải quyết nhiều bài toán phức tạp mà các phương pháp truyền thống khó đạt được, từ điều khiển robot tự hành, tối ưu hóa hệ thống công nghiệp, đến chiến thắng con người trong các trò chơi chiến lược như cờ vây (AlphaGo, 2016) và StarCraft II (AlphaStar, 2019).

#### 1.1.2. Vì sao chọn Deep Q-Learning và game Atari?

**Q-Learning** là một thuật toán Reinforcement Learning kinh điển thuộc loại **model-free** (không cần mô hình hóa môi trường). Thuật toán này ước lượng **Q-value** — giá trị kỳ vọng của tổng phần thưởng tương lai khi thực hiện một action cụ thể tại một state nhất định. Tuy nhiên, Q-Learning truyền thống lưu trữ Q-value trong một bảng (Q-table), điều này trở nên **không khả thi** khi không gian trạng thái quá lớn hoặc liên tục, ví dụ như khi đầu vào là hình ảnh pixel của màn hình game.

Năm 2013, nhóm nghiên cứu tại **DeepMind** (dẫn đầu bởi Volodymyr Mnih và cộng sự) đã công bố bài báo *"Playing Atari with Deep Reinforcement Learning"*, giới thiệu kiến trúc **Deep Q-Network (DQN)** — sử dụng **Convolutional Neural Network (CNN)** để xấp xỉ hàm Q-value thay cho Q-table. Đây là bước đột phá quan trọng vì DQN có thể:

- Nhận **đầu vào trực tiếp là pixel thô** từ màn hình game (210 × 160 RGB), không cần đặc trưng thiết kế tay (hand-crafted features).
- Sử dụng **cùng một kiến trúc mạng và bộ siêu tham số** cho nhiều game Atari 2600 khác nhau, chứng tỏ khả năng tổng quát hóa cao.
- Đạt hoặc **vượt hiệu suất của chuyên gia con người** trên nhiều game, bao gồm Pong.

Bài báo mở rộng năm 2015 (*"Human-level control through deep reinforcement learning"*, đăng trên tạp chí Nature) đã áp dụng DQN thành công trên **49 game Atari 2600**, củng cố vị thế của Deep Q-Learning như một cột mốc nền tảng trong lĩnh vực Deep Reinforcement Learning.

Việc chọn đề tài này cho phép tìm hiểu trọn vẹn hành trình từ lý thuyết Q-Learning cơ bản đến ứng dụng Deep Learning trong Reinforcement Learning, đồng thời thực hành triển khai trên một bài toán mang tính biểu tượng trong lịch sử nghiên cứu AI.

#### 1.1.3. Ý nghĩa học thuật và thực tiễn

Đề tài này mang lại giá trị trên nhiều phương diện:

- **Về lý thuyết**: Giúp nắm vững các khái niệm cốt lõi của Reinforcement Learning (agent, environment, state, action, reward, policy, Q-value) và hiểu cách Deep Learning được tích hợp để mở rộng khả năng của Q-Learning.
- **Về kỹ thuật**: Thực hành triển khai các kỹ thuật quan trọng trong DQN như **Experience Replay** (phát lại kinh nghiệm), **Target Network** (mạng mục tiêu), tiền xử lý hình ảnh (chuyển đổi grayscale, cắt và thay đổi kích thước khung hình), và **frame stacking** (xếp chồng khung hình để nắm bắt thông tin chuyển động).
- **Về thực tiễn**: Các phương pháp từ DQN đã trở thành nền tảng cho nhiều ứng dụng thực tế trong điều khiển tự động, robot học, và hệ thống ra quyết định thông minh.

---

### 1.2. Tổng quan về bài toán Atari Pong

#### 1.2.1. Lịch sử game Pong

**Pong** là một trong những trò chơi điện tử mang tính biểu tượng nhất trong lịch sử ngành công nghiệp game. Trò chơi được tạo ra vào năm **1972** bởi kỹ sư **Allan Alcorn** tại hãng Atari, theo sự phân công của đồng sáng lập **Nolan Bushnell**. Mặc dù không phải trò chơi điện tử đầu tiên được phát minh, Pong được ghi nhận là **trò chơi arcade thương mại thành công đầu tiên**, góp phần khai sinh ngành công nghiệp trò chơi điện tử hiện đại.

Pong mô phỏng đơn giản trò chơi bóng bàn (table tennis) trong không gian hai chiều. Sau thành công vang dội tại các quán bar và khu trò chơi, Atari phát hành phiên bản console gia đình vào năm 1975 thông qua hợp tác với Sears, mở đường cho kỷ nguyên console game tại gia.

#### 1.2.2. Luật chơi và cơ chế hoạt động

Pong là trò chơi hai người chơi (hoặc một người chơi đối đầu với AI), với các quy tắc cơ bản:

- Mỗi người chơi điều khiển một **paddle** (thanh chắn dọc) ở một bên màn hình, di chuyển lên hoặc xuống để đỡ bóng.
- **Bóng** di chuyển qua lại giữa hai bên màn hình. Khi bóng chạm paddle, nó bật ngược lại. Góc bật và tốc độ có thể thay đổi tùy thuộc vào vị trí va chạm trên paddle.
- Khi một người chơi **không đỡ được bóng** (bóng vượt qua paddle), đối phương ghi được **1 điểm**.
- Trận đấu kết thúc khi một bên đạt đến điểm số quy định (thường là 21 điểm trong phiên bản Atari 2600).

Trong phiên bản Atari 2600 được sử dụng trong bài tập này (`ALE/Pong-v5`), agent điều khiển paddle bên phải với **6 hành động** khả dụng (trong đó các hành động chính là đứng yên, di chuyển lên, và di chuyển xuống).

#### 1.2.3. Pong như một bài toán Reinforcement Learning

Trong ngữ cảnh Reinforcement Learning, game Pong được mô hình hóa như một **Markov Decision Process (MDP)** — quá trình quyết định Markov — với các thành phần:

| Thành phần | Mô tả trong Pong |
|---|---|
| **State** (Trạng thái) | Hình ảnh pixel của màn hình game tại thời điểm hiện tại. Trong cài đặt DQN, state là tập hợp 4 khung hình liên tiếp đã qua tiền xử lý (grayscale, resize về 84×84 pixel), giúp agent nhận biết được hướng và tốc độ di chuyển của bóng. |
| **Action** (Hành động) | Tập hợp các hành động mà agent có thể thực hiện: đứng yên, di chuyển paddle lên, hoặc di chuyển paddle xuống. |
| **Reward** (Phần thưởng) | **+1** khi agent ghi điểm (đối phương không đỡ được bóng), **−1** khi agent mất điểm (bóng vượt qua paddle của agent), **0** trong các bước còn lại. |
| **Policy** (Chiến lược) | Ánh xạ từ state sang action mà agent cần thực hiện, được học thông qua quá trình huấn luyện DQN. |

#### 1.2.4. Thách thức của bài toán

Mặc dù có luật chơi đơn giản, Pong đặt ra nhiều thách thức đáng kể cho agent Reinforcement Learning:

- **Phần thưởng thưa thớt (Sparse Reward)**: Trong suốt một rally (chuỗi đánh bóng qua lại), agent chỉ nhận reward khác 0 khi bóng vượt qua paddle của một trong hai bên. Điều này có nghĩa là agent phải thực hiện hàng trăm hành động liên tiếp mà không nhận được tín hiệu phản hồi rõ ràng.
- **Bài toán gán tín dụng (Credit Assignment Problem)**: Agent cần xác định chính xác hành động nào trong chuỗi hành động dài đã dẫn đến kết quả thắng hoặc thua. Ví dụ, việc di chuyển paddle về đúng vị trí từ vài giây trước mới là hành động quyết định, không phải hành động cuối cùng.
- **Đầu vào chiều cao (High-dimensional Input)**: State là hình ảnh pixel thô với không gian trạng thái cực lớn, đòi hỏi sử dụng mạng nơ-ron để xấp xỉ hàm Q-value thay vì Q-table truyền thống.
- **Tính thời gian thực (Temporal Dynamics)**: Thông tin quan trọng như hướng và tốc độ của bóng không thể nhận biết từ một khung hình đơn lẻ, do đó cần kỹ thuật **frame stacking** — xếp chồng nhiều khung hình liên tiếp làm đầu vào.

#### 1.2.5. Arcade Learning Environment (ALE)

Trong bài tập này, môi trường game Pong được cung cấp thông qua **Arcade Learning Environment (ALE)** — một nền tảng nghiên cứu mã nguồn mở cung cấp giao diện chuẩn hóa tới hàng trăm game Atari 2600. ALE đã trở thành **benchmark tiêu chuẩn** trong nghiên cứu Reinforcement Learning kể từ khi được giới thiệu bởi Bellemare và cộng sự (2013).

Cụ thể, dự án sử dụng thư viện **Gymnasium** (phiên bản hiện đại của OpenAI Gym) kết hợp với **ale-py** để tạo môi trường `ALE/Pong-v5` với `frameskip=1`. Giao diện này cung cấp:

- **Observation** (Quan sát): Hình ảnh RGB kích thước 210 × 160 pixel của màn hình game.
- **Action space** (Không gian hành động): 6 hành động rời rạc.
- **Reward**: Tín hiệu +1/−1/0 như đã mô tả ở trên.
- **Termination**: Episode kết thúc khi một bên đạt 21 điểm.

Pong được coi là bài toán "Hello World" của Deep Reinforcement Learning — đủ đơn giản để agent có thể học được trong thời gian hợp lý, nhưng đủ phức tạp để minh họa đầy đủ các khái niệm và kỹ thuật cốt lõi của DQN, bao gồm xử lý đầu vào pixel, Experience Replay, Target Network, và chiến lược khám phá ε-greedy.
