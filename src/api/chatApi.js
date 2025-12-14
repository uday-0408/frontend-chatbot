export async function getChats() {
  const res = await fetch("https://backend-chatbot-vwcl.onrender.com/api/chats");
  return res.json();
}

export async function getChatMessages(sessionId) {
  const res = await fetch(`https://backend-chatbot-vwcl.onrender.com/api/chats/${sessionId}`);
  return res.json();
}
