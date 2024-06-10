// frontend/src/Chat.js
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3001"); // Connexion au backend

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("");

  useEffect(() => {
    // Récupérer les messages existants
    const fetchMessages = async () => {
      const response = await axios.get("http://localhost:3001/messages");
      setMessages(response.data);
    };

    fetchMessages();

    // Écouter les messages en temps réel
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newMessage"); // Nettoyage
    };
  }, []);

  const sendMessage = () => {
    if (content && sender) {
      socket.emit("message", { content, sender });
      setContent("");
    }
  };

  return (
    <div>
      <h1>Chat en temps réel</h1>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Votre message"
      />
      <input
        type="text"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        placeholder="Votre nom"
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
};

export default Chat;
