import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your data analysis assistant. Ask me anything about your analysis.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fade-in effect when component mounts
  useEffect(() => {
    // Small delay to ensure animation works
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 600); // Delayed to appear after the dropdowns

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      let responseContent = "";
      const inputData = {
        message: inputMessage,
        history: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        id: id,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }


      const data = await response.json();
      console.log("data: ", data);
      responseContent = data.reply + "\n\n" + data.result;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, there was an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`border w-full m-auto rounded-lg transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}>
      <div className="bg-gray-100 py-4 px-5 rounded-t-lg border-b">
        <h3 className="font-bold text-lg text-primary">Data Analysis Assistant</h3>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3/4 p-3 rounded-lg ${message.role === "user"
                ? "bg-primary text-white rounded-br-none"
                : "bg-gray-200 border-primary text-primary rounded-bl-none"
                }`}
            >
              {message.content}
              <div
                className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"
                  }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex gap-2 bg-gray-50 rounded-b-lg">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 shadow-none"
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
