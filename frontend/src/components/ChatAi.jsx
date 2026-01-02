import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({problem}) {
    
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your DSA tutor. How can I help you with this problem?" }
    ]);

    const { register, handleSubmit, reset, formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
       
        const userMessage = { role: 'user', content: data.message };
        setMessages(prev => [...prev, userMessage]);
        reset();

        try {
            
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, userMessage], // Include the new user message
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
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble ${
                            msg.role === "user" 
                                ? "bg-primary text-primary-content" 
                                : "bg-base-200 text-base-content"
                        }`}>
                        
                            <div className="whitespace-pre-wrap">
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Ask me anything about this problem..." 
                        className="input input-bordered flex-1" 
                        {...register("message", { 
                            required: "Message is required", 
                            minLength: { value: 2, message: "Too short" }
                        })}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={!!errors.message}
                    >
                        <Send size={20} />
                    </button>
                </div>
                {errors.message && (
                    <p className="text-error text-sm mt-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;