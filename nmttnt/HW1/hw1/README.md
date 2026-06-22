# Minesweeper (Python & FreeSimpleGUI)

A classic **Minesweeper** game recreated using **Python 3.13** and **FreeSimpleGUI**. This project focuses on clean architecture, simple logic, and ease of use.

## 📋 Features

* **3 Difficulty Levels:**
    * **Easy:** 8x8 grid (10 mines)
    * **Intermediate:** 16x16 grid (40 mines)
    * **Expert:** 30x16 grid (99 mines)
* **Classic Mechanics:**
    * **Flood Fill:** Automatically reveals adjacent empty cells (Safe zones).
    * **Mine Counting:** Indicators for the number of surrounding mines.
    * **Flagging:** Right-click to mark potential mines.
    * **Win/Loss States:** Instant game-over detection.
* **Modern GUI:** Clean interface using `FreeSimpleGUI`.

## 🛠️ Requirements

* **Python 3.x** (Tested on Python 3.13)
* **FreeSimpleGUI** library

## 🚀 Installation

1.  **Clone or Download** this repository to your local machine.
2.  **Open your Terminal** (Command Prompt or PowerShell) and navigate to the project folder.
3.  **Install Dependencies** using `requirements.txt`:

    ```bash
    pip install -r requirements.txt
    ```

    *(Alternatively, you can install the library manually: `pip install FreeSimpleGUI`)*

## 🎮 How to Run

Execute the `main.py` file to start the game:

```bash
python main.py