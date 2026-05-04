const baseURL = "";
const currentPage = window.location.pathname;
if (
  !localStorage.getItem("token") &&
  !currentPage.includes("login.html") &&
  !currentPage.includes("signup.html")
) {
  window.location.href = "login.html";
}
if (
  localStorage.getItem("token") &&
  (currentPage.includes("login.html") || currentPage.includes("signup.html"))
) {
  window.location.href = "chat.html";
}
async function signup() {
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!name || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const res = await fetch(`${baseURL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    alert(data.message);

    if (data.message === "Signup Successful") {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Signup Error:", error);
    alert("Signup failed.");
  }
}
async function login() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const res = await fetch(`${baseURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "chat.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("Login failed.");
  }
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
const msgInput = document.getElementById("message");

if (msgInput) {
  msgInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}
async function sendMessage() {
  const input = document.getElementById("message");
  const chatBox = document.getElementById("chatBox");

  if (!input || !chatBox) return;

  const msg = input.value.trim();

  if (msg === "") return;

  appendMessage("user-msg", msg);
  input.value = "";

  const typingId = "typing-" + Date.now();
  appendMessage("bot-msg", "Thinking...", typingId);

  try {
    const res = await fetch(`${baseURL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: msg,
      }),
    });

    const data = await res.json();

    const typingBox = document.getElementById(typingId);

    if (typingBox) {
      typingBox.innerHTML = data.reply
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
    }
  } catch (error) {
    console.error(error);

    const typingBox = document.getElementById(typingId);

    if (typingBox) {
      typingBox.innerText = "Server Error ⚠️";
    }
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
function appendMessage(className, text, id = "") {
  const chatBox = document.getElementById("chatBox");

  if (!chatBox) return;

  const msg = document.createElement("div");
  msg.className = className;

  if (id) msg.id = id;

  msg.innerHTML = text;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
