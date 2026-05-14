document.addEventListener("DOMContentLoaded", () => {
    let username = null;
    let ws = null;

    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("username-input");
    const loginButton = document.getElementById("login-button");

    const status = document.getElementById("status");
    const chatWindow = document.getElementById("chat-window");
    chatWindow.style.display = "flex";
    chatWindow.style.flexDirection = "column";
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    loginButton.addEventListener("click", () => {
        username = usernameInput.value.trim();

        if (username !== "") {
            loginContainer.style.display = "none";
            chatContainer.style.display = "flex";
            initializeWebSocket();
        }
    });

    function initializeWebSocket() {
        status.textContent = "🟡 Подключение...";

        ws = new WebSocket("ws://127.0.0.1:8765");

        ws.onopen = () => {
            status.textContent = "🟢 Подключено";

            ws.send(JSON.stringify({
                type: "join",
                username: username
            }));
        };

        ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "message") {
        appendMessage(data.username, data.text);
    }

    if (data.type === "status") {
        appendStatus(data.text);
    }

    if (data.type === "users") {
        const usersList = document.getElementById("users-list");
        usersList.textContent = "👥 Онлайн: " + data.users.join(", ");
    }
};

        ws.onclose = () => {
            status.textContent = "🔴 Соединение закрыто";
        };

        ws.onerror = () => {
            status.textContent = "🔴 Ошибка подключения";
        };
    }

    sendButton.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const text = messageInput.value.trim();

        if (text !== "" && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "message",
                text: text
            }));

            messageInput.value = "";
        }
    }

    function appendMessage(author, text) {
    const messageElem = document.createElement("div");

    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messageElem.textContent = `${author}: ${text} (${time})`;

    messageElem.style.padding = "10px 14px";
    messageElem.style.margin = "6px 0";
    messageElem.style.borderRadius = "14px";
    messageElem.style.maxWidth = "70%";
    messageElem.style.wordWrap = "break-word";

    if (author === username) {
        messageElem.style.alignSelf = "flex-end";
        messageElem.style.backgroundColor = "#007bff";
        messageElem.style.color = "white";
    } else {
        messageElem.style.alignSelf = "flex-start";
        messageElem.style.backgroundColor = "#e4e6eb";
        messageElem.style.color = "black";
    }

    chatWindow.appendChild(messageElem);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

    function appendStatus(text) {
        const statusElem = document.createElement("div");

        statusElem.classList.add("system-message");
        statusElem.textContent = `— ${text} —`;

        chatWindow.appendChild(statusElem);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});