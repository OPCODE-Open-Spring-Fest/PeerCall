import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3000";

interface ChatOverlayProps {
  roomId?: string;
  userName?: string;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ 
  roomId = "global", 
  userName = "Anonymous" 
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ user: string; text: string; time?: Date }[]>([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("join-room", roomId, userName);
    socketRef.current.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!open) {
        setUnreadCount(prev => prev + 1);
      }
    });
    socketRef.current.on("chat-history", (history) => {
      setMessages(history);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, userName, open]);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || !socketRef.current) return;
    const msg = { roomId, user: userName, text: input };
    socketRef.current.emit("chat-message", msg);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          className="fixed bottom-6 right-6 bg-green-600 dark:bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all z-50"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl rounded-xl flex flex-col z-50 animate-fade-in-up border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <span className="font-semibold text-gray-900 dark:text-gray-100">In-Call Chat - {roomId}</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 h-72 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-700 dark:text-green-400 font-bold">{msg.user}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {msg.time ? new Date(msg.time).toLocaleTimeString() : ""}
                  </span>
                </div>
                <span className="bg-green-100 dark:bg-green-900/30 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm w-fit max-w-[85%]">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-800" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-green-400 dark:focus:ring-green-500"
            />
            <button type="submit" className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-1 rounded">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatOverlay;
