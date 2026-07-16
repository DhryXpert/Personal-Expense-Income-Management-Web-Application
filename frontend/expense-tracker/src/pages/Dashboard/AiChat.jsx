import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  LuBot,
  LuUser,
  LuSend,
  LuTrash2,
  LuSparkles,
  LuMessageSquare,
} from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const AiChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Financial Assistant. How can I help you manage your expenses today? You can ask me about your spending patterns, how to save more, or for help categorizing your transactions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const isSynced = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isSynced.current) return;
    isSynced.current = true;

    const runSync = async () => {
      try {
        let remaining = 1;
        while (remaining > 0) {
          const response = await axiosInstance.post(
            API_PATHS.CHAT.SYNC,
            {},
            { timeout: 30000 }
          );
          remaining = response.data.remaining ?? 0;
          // If no progress is being made, break to prevent infinite loops
          if (response.data.synced === 0) {
            break;
          }
        }
      } catch (error) {
        console.error("Sync error:", error);
      }
    };

    runSync();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const historyToSend = newMessages.slice(1);

      const response = await axiosInstance.post(
        API_PATHS.CHAT.SEND_MESSAGE,
        {
          message: userMessage.content,
          history: historyToSend.slice(0, -1),
        },
        { timeout: 30000 },
      );

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (error) {
      setIsTyping(false);
      const errorMsg =
        error.code === "ECONNABORTED"
          ? "Response timed out. Please try again."
          : error.response?.data?.message ||
            "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMsg,
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. What else can I help you with?",
      },
    ]);
  };

  const suggestions = [
    "Analyze my spending this month",
    "How can I save more?",
    "Show my biggest expenses",
    "Predict next month's budget",
  ];

  return (
    <DashboardLayout activeMenu="Talk with AI">
      <div className="flex flex-col h-[calc(100vh-61px)] -mx-5 bg-white">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-primary border border-violet-200 shadow-sm">
                <LuBot size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 leading-none">
                  AI Assistant
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs text-slate-500 font-medium">
                    Online & Ready to help
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              title="Clear Chat"
            >
              <LuTrash2
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-primary shrink-0 border border-violet-200 shadow-sm">
                      <LuBot size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-sm shadow-sm transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 shadow-sm">
                      <LuUser size={16} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-primary shrink-0 border border-violet-200 shadow-sm">
                    <LuBot size={16} />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="p-6 bg-white border-t border-slate-100">
            {/* Suggestions */}
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(sug)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200 hover:border-primary hover:text-primary hover:bg-violet-50 transition-all duration-200"
                  >
                    <LuSparkles size={12} className="text-violet-400" />
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="relative flex items-center gap-3 group">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <LuMessageSquare size={18} />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask me anything about your finances..."
                    disabled={isTyping}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`p-3.5 rounded-2xl transition-all duration-300 shadow-md ${
                    input.trim() && !isTyping
                      ? "bg-primary text-white shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <LuSend size={20} />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium tracking-wide">
              POWERED BY AI • PROVIDING FINANCIAL INSIGHTS
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChat;
