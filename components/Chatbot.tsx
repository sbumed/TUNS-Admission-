
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatbotResponse, getComplexResponse, getGroundedResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MessageSquareIcon, XIcon, SendIcon, BrainCircuitIcon, SparklesIcon } from './icons';
import { useGeolocation } from '../hooks/useGeolocation';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { location } = useGeolocation();

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { role: 'model', text: 'สวัสดีครับ มีอะไรให้ช่วยเกี่ยวกับการสมัครเรียน สามารถสอบถามได้เลยครับ' },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      const isLocationQuery = /ใกล้|แถวนี้|เดินทาง|ไปยังไง|ที่ไหน/.test(input);

      if (isThinkingMode) {
        response = await getComplexResponse(input);
      } else if (isLocationQuery) {
        response = await getGroundedResponse(input, location);
      } else {
        response = await getChatbotResponse(messages, input);
      }
      
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks && groundingChunks.length > 0) {
        modelMessage.sources = groundingChunks
        .map((chunk: any) => (chunk.maps || chunk.web))
        .filter(Boolean)
        .map((source: any) => ({ uri: source.uri, title: source.title }))
      }

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isThinkingMode, location]);

  const toggleChat = () => setIsOpen(!isOpen);

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-primary to-primary-hover text-white p-4 rounded-full shadow-lg hover:from-primary-hover hover:to-primary-dark transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50 no-print"
        aria-label="Open chat"
      >
        <MessageSquareIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up no-print">
      <header className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-t-2xl">
        <h3 className="font-bold text-lg">TUNS AI Assistant</h3>
        <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-full" aria-label="Close chat">
          <XIcon className="h-6 w-6" />
        </button>
      </header>
      
      <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-secondary-light">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-xl p-3 max-w-xs md:max-w-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-secondary-dark'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && (
                 <div className="mt-2 border-t border-slate-300 pt-2">
                    <h4 className="text-xs font-bold mb-1">แหล่งข้อมูล:</h4>
                    <ul className="text-xs space-y-1">
                      {msg.sources.map((source, i) => (
                        <li key={i}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary-dark hover:underline">
                            {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                 </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-xl p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white rounded-b-2xl">
        <div className="flex items-center space-x-2 mb-2">
            <button
                onClick={() => setIsThinkingMode(!isThinkingMode)}
                className={`flex items-center px-3 py-1 text-xs rounded-full transition-colors ${
                    isThinkingMode 
                    ? 'bg-warning text-white' 
                    : 'bg-secondary-light text-secondary-dark hover:bg-slate-200'
                }`}
            >
                {isThinkingMode ? <BrainCircuitIcon className="h-4 w-4 mr-1" /> : <SparklesIcon className="h-4 w-4 mr-1" />}
                {isThinkingMode ? 'Thinking Mode' : 'Standard Mode'}
            </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="พิมพ์คำถามของคุณ..."
            className="flex-1 p-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-primary text-white p-3 rounded-full hover:bg-primary-hover disabled:bg-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;