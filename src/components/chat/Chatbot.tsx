import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Stethoscope,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your MediCare+ assistant. I can help you with general medical information, disease awareness, and website navigation. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowAuthPrompt(false);

    try {
      const { data, error } = await supabase.functions.invoke("chatbot", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          isAuthenticated: !!user,
        },
      });

      if (error) throw error;

      if (data.requiresAuth) {
        setShowAuthPrompt(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
          },
        ]);
      } else if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I apologize, but I encountered an issue: ${data.error}. Please try again.`,
          },
        ]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogin = (role: "doctor" | "patient") => {
    setIsOpen(false);
    navigate(`/login/${role}`);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110",
          "bg-primary text-primary-foreground",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-primary/5 rounded-t-2xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">MediCare+ Assistant</h3>
            <p className="text-xs text-muted-foreground">
              General medical information
            </p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === "user"
                      ? "bg-primary/10"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? (
                    <User size={16} className="text-primary" />
                  ) : (
                    <Bot size={16} className="text-muted-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot size={16} className="text-muted-foreground" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {showAuthPrompt && (
              <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Sign in to access personalized features:
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleLogin("patient")}
                  >
                    <UserCircle size={16} />
                    Patient Login
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleLogin("doctor")}
                  >
                    <Stethoscope size={16} />
                    Doctor Login
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-muted/50 border-y border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            ⚠️ This chatbot provides general medical information and is not a
            substitute for professional medical advice.
          </p>
        </div>

        {/* Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
