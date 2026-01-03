import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是你的 AI 人生助手。关于你的人生格子，有什么想聊的吗？' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(userMsg.text, messages, useThinking);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, isThinking: useThinking };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 
          w-[calc(100vw-2rem)] sm:w-96 
          mb-4 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}
        style={{ 
          maxHeight: 'min(600px, 75vh)', // Limit height to 75% of viewport height or 600px
          display: isOpen ? 'flex' : 'none', 
        }}
      >
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">smart_toy</span>
            <span className="font-semibold">AI 人生助手</span>
          </div>
          <button onClick={toggleChat} className="hover:bg-slate-700 rounded-full p-1 transition">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.isThinking && <div className="text-xs text-blue-800 font-bold mb-1 opacity-70">Thinking Mode</div>}
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
           {/* Controls */}
           <div className="flex items-center justify-between mb-2 px-1">
              <label className="flex items-center cursor-pointer group" title="开启深度思考模式以回答复杂问题">
                  <div className="relative">
                      <input type="checkbox" className="sr-only" checked={useThinking} onChange={() => setUseThinking(!useThinking)} />
                      <div className={`block w-8 h-4 rounded-full transition-colors ${useThinking ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${useThinking ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className={`ml-2 text-xs font-medium transition ${useThinking ? 'text-blue-600' : 'text-gray-500'}`}>
                      深度思考 (Gemini 3 Flash)
                  </span>
              </label>
           </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="问问我对人生的看法..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center aspect-square h-9 w-9"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Floating Button */}
      <button 
        onClick={toggleChat}
        className="bg-slate-800 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center pointer-events-auto"
      >
        <span className="material-symbols-outlined text-2xl">{isOpen ? 'keyboard_arrow_down' : 'chat_bubble'}</span>
      </button>
    </div>
  );
};

export default ChatBot;