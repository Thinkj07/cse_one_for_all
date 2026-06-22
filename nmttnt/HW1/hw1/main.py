import FreeSimpleGUI as sg
from minesweeper import Minesweeper

def main_menu():
    sg.theme('DarkBlue12')
    layout = [
        [sg.Text("MINESWEEPER", font=("Helvetica", 24), justification='center', expand_x=True)],
        [sg.Frame("Difficulty", [
            [sg.Radio("Easy (8x8)", "DIF", key='easy', default=True)],
            [sg.Radio("Intermediate (16x16)", "DIF", key='intermediate')],
            [sg.Radio("Expert (30x16)", "DIF", key='expert')]
        ])],
        [sg.Button("PLAY", size=(10, 2), bind_return_key=True), sg.Button("EXIT", size=(10, 2))]
    ]
    window = sg.Window("Menu", layout, element_justification='c')
    event, values = window.read()
    window.close()
    
    if event == "PLAY":
        if values['easy']: return 'easy'
        elif values['intermediate']: return 'intermediate'
        elif values['expert']: return 'expert'
    return None

def run_game(difficulty):
    game = Minesweeper(difficulty)
    
    button_layout = []
    for r in range(game.rows):
        row_list = []
        for c in range(game.cols):
            btn_key = f"{r},{c}"
            btn = sg.Button("", size=(2, 1), key=btn_key, pad=(0, 0), font=("Helvetica", 10, "bold"), button_color=('white', 'gray'))
            row_list.append(btn)
        button_layout.append(row_list)
    
    layout = [
        [sg.Text(f"Mines: {game.mines}", key='INFO', font=("Helvetica", 12))],
        [sg.Column(button_layout)]
    ]
    
    window = sg.Window("Minesweeper", layout, finalize=True)
    
    for r in range(game.rows):
        for c in range(game.cols):
            window[f"{r},{c}"].bind('<Button-3>', '+RIGHT')

    while True:
        event, _ = window.read()
        
        if event == sg.WIN_CLOSED:
            window.close()
            return False

        if not isinstance(event, str):
            continue

        r, c = -1, -1
        is_right_click = False

        try:
            if '+RIGHT' in event:
                coords = event.replace('+RIGHT', '')
                r, c = map(int, coords.split(','))
                is_right_click = True
            elif ',' in event:
                r, c = map(int, event.split(','))
            else:
                continue 
        except ValueError:
            continue

        if is_right_click:
            game.toggle_flag(r, c)
        else:
            game.reveal(r, c)

        update_board(window, game)

        if game.game_over:
            sg.popup("BOOM! You lost.", title="Game Over")
            break
        if game.victory:
            sg.popup("Congratulations! You won!", title="Victory")
            break
            
    window.close()
    return True

def update_board(window, game):
    for r in range(game.rows):
        for c in range(game.cols):
            cell = game.board[r][c]
            btn_key = f"{r},{c}" # Key chuỗi
            
            if cell['open']:
                if cell['mine']:
                    window[btn_key].update('*', button_color=('white', 'red'))
                else:
                    text = str(cell['neighbors']) if cell['neighbors'] > 0 else ""
                    window[btn_key].update(text, button_color=('black', 'lightgray'), disabled=True)
            elif cell['flag']:
                window[btn_key].update('P', button_color=('red', 'gray'))
            else:
                window[btn_key].update('', button_color=('white', 'gray'))

if __name__ == "__main__":
    while True:
        dif = main_menu()
        if not dif:
            break
        if not run_game(dif):
            break