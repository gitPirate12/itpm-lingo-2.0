"use client"

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Ayubowan! 🙏 I'm your Sinhala language and culture assistant. Ask me anything about Sinhala language, grammar, phrases, or Sri Lankan culture!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "How do I greet in Sinhala?",
    "Basic Sinhala phrases",
    "Sinhala verb conjugation",
    "'oya' vs 'umba'",
    "Sinhalese New Year"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const config = {
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/chatbotapi',
        headers: {
          'x-rapidapi-key': 'eefb2d8bd3msh23d0c47bb497b92p1209e8jsn73445f70d294',
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          bot_id: 'OEXJ8qFp5E5AwRwymfPts90vrHnmr8yZgNE171101852010w2S0bCtN3THp448W7kDSfyTf3OpW5TUVefz',
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: input
            }
          ],
          user_id: '',
          temperature: 0.9,
          top_k: 5,
          top_p: 0.9,
          max_tokens: 256,
          model: 'gpt 3.5'
        }
      };

      const response = await axios.request(config);
      let botContent = response.data?.result;
      if (!botContent) throw new Error(response.data?.Error || 'Unexpected response format');

      setMessages(prev => [...prev, { role: 'bot', content: botContent }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `Sorry, something went wrong: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow sm:shadow-lg mt-16 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow">
          ස
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Sinhala Language Helper</h2>
          <p className="text-xs sm:text-sm text-gray-500">Your guide to Sinhala</p>
        </div>
      </div>

      {/* Chat container */}
      <div className="h-[calc(100vh-320px)] sm:h-[28rem] overflow-y-auto mb-4 sm:mb-6 border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 sm:mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-xs lg:max-w-md p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
            }`}>
              <div className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {msg.role === 'user' ? 'You' : 'Sinhala Helper'}
              </div>
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3 sm:mb-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl rounded-bl-none border border-gray-200 max-w-[80%] sm:max-w-xs lg:max-w-md">
              <div className="text-xs font-semibold mb-1 text-gray-500">Sinhala Helper</div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">Quick questions:</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-[0.65rem] xs:text-xs px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition border border-gray-200"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Sinhala..."
          className="flex-1 p-2 sm:p-3 border border-gray-300 sm:border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-3 py-2 sm:px-5 sm:py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg sm:rounded-xl disabled:bg-yellow-300 transition flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;