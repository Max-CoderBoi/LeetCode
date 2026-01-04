import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Sparkles, User, Bot } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your DSA tutor. How can I help you with this problem?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: {errors}, setValue } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;
        
        const userMessage = { role: 'user', content: data.message };
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, userMessage],
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.data.message
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickMessage = async (message) => {
        if (isLoading) return;
        setValue('message', message);
        await onSubmit({ message });
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                    <h3 className="font-semibold text-white">AI Tutor</h3>
                    <p className="text-xs text-slate-400">Always ready to help</p>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-fadeIn`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === "user" 
                                ? "bg-gradient-to-br from-blue-600 to-cyan-600" 
                                : "bg-gradient-to-br from-purple-600 to-pink-600"
                        }`}>
                            {msg.role === "user" ? (
                                <User size={16} className="text-white" />
                            ) : (
                                <Bot size={16} className="text-white" />
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <div className={`relative group ${
                                msg.role === "user" 
                                    ? "bg-gradient-to-br from-blue-600 to-cyan-600" 
                                    : "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50"
                            } rounded-2xl px-4 py-3 shadow-lg`}>
                                {/* Message Content */}
                                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.role === "user" ? "text-white" : "text-slate-200"
                                }`}>
                                    {msg.content}
                                </div>

                                {/* Hover glow effect */}
                                <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${
                                    msg.role === "user" 
                                        ? "bg-gradient-to-br from-blue-600 to-cyan-600" 
                                        : "bg-gradient-to-br from-purple-600 to-pink-600"
                                }`}></div>
                            </div>
                            
                            {/* Timestamp */}
                            <span className="text-xs text-slate-500 mt-1 px-2">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex gap-3 animate-fadeIn">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800/50">
                <div>
                    <div className="relative">
                        {/* Glow effect on focus */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 focus-within:opacity-20 blur transition-opacity duration-300"></div>
                        
                        <div className="relative flex items-center gap-2">
                            <input 
                                placeholder="Ask me anything about this problem..." 
                                className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200" 
                                {...register("message", { 
                                    required: "Message is required", 
                                    minLength: { value: 2, message: "Message too short" }
                                })}
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            />
                            <button 
                                onClick={handleSubmit(onSubmit)}
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    isLoading || errors.message
                                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
                                }`}
                                disabled={isLoading || !!errors.message}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {errors.message && (
                        <p className="text-rose-400 text-xs mt-2 ml-1 flex items-center gap-1 animate-fadeIn">
                            <span className="w-1 h-1 bg-rose-400 rounded-full"></span>
                            {errors.message.message}
                        </p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                    <button 
                        onClick={() => handleQuickMessage("Can you explain the approach?")}
                        className="px-3 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        💡 Explain approach
                    </button>
                    <button 
                        onClick={() => handleQuickMessage("What's the time complexity?")}
                        className="px-3 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        ⚡ Time complexity
                    </button>
                    <button 
                        onClick={() => handleQuickMessage("Give me a hint")}
                        className="px-3 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        🎯 Give hint
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.4);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.6);
                }
            `}</style>
        </div>
    );
}

export default ChatAi;