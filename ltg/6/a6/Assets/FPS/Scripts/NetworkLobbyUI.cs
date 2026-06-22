using UnityEngine;
using UnityEngine.UI;
using Unity.Netcode;
using UnityEngine.SceneManagement;

public class NetworkLobbyUI : NetworkBehaviour
{
    public Button hostButton;
    public Button clientButton;

    private void Awake()
    {
        // Gắn sự kiện khi bấm nút Host
        hostButton.onClick.AddListener(() =>
        {
            NetworkManager.Singleton.StartHost();
            NetworkManager.Singleton.SceneManager.LoadScene("MainScene", LoadSceneMode.Single);
        });

        // Gắn sự kiện khi bấm nút Client (Join)
        clientButton.onClick.AddListener(() =>
        {
            NetworkManager.Singleton.StartClient();
        });
    }
}