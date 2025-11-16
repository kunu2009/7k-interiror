
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ShoppingItem } from '../types';
import { SendIcon, SparklesIcon, PlusIcon, CheckIcon } from './icons';

interface ChatInterfaceProps {
  onSendMessage: (message: string, intent: 'visual' | 'shopping' | 'general') => Promise<void>;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  classifyIntent: (message: string) => Promise<'visual' | 'shopping' | 'general'>;
  onAddItem: (item: ShoppingItem) => void;
  shoppingList: ShoppingItem[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, chatHistory, isLoading, classifyIntent, onAddItem, shoppingList }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    const intent = await classifyIntent(message);
    await onSendMessage(message, intent);
  };
  
  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.items) {
      return (
        <div className="space-y-3">
          {msg.text && <p>{msg.text}</p>}
          {msg.items.map((item, index) => {
            const isAdded = shoppingList.some(listItem => listItem.url === item.url);
            return (
              <div key={index} className="border border-gray-600 p-3 rounded-lg bg-gray-700/50">
                <div className="flex justify-between items-start space-x-2">
                    <div className="flex-1">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-400 hover:underline">{item.name}</a>
                      <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                    </div>
                    <button 
                        onClick={() => onAddItem(item)}
                        disabled={isAdded}
                        className={`flex-shrink-0 mt-1 flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors disabled:cursor-not-allowed ${
                          isAdded 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                        aria-label={isAdded ? `Added ${item.name} to list` : `Add ${item.name} to list`}
                    >
                        {isAdded ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5" />
                                <span>Added</span>
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span>Add to List</span>
                            </>
                        )}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return msg.text;
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-purple-600' : 'bg-gray-700'}`}>
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl bg-gray-700 flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 animate-pulse text-purple-400" />
                <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Make the walls light blue' or 'Find me a similar sofa'"
            className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-full hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition">
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
