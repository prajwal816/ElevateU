import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm here to help. Ask me about our courses, learning options, or anything else!",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("course") || q.includes("learn")) {
      return "We offer a wide range of courses including Web Development, Data Science, Digital Marketing, UI/UX Design, Business Analytics, and Graphic Design. All courses are designed by industry experts!";
    }
    if (q.includes("price") || q.includes("cost") || q.includes("fee")) {
      return "Our courses have different pricing options. Please check individual course pages for detailed pricing information, or contact us for special packages!";
    }
    if (q.includes("flexible") || q.includes("schedule")) {
      return "Yes! We offer flexible learning options. You can learn at your own pace, access courses 24/7, and study from anywhere with an internet connection.";
    }
    if (q.includes("certificate") || q.includes("certification")) {
      return "Yes, you'll receive a certificate upon successful completion of each course. Our certificates are recognized by industry professionals!";
    }
    if (
      q.includes("expert") ||
      q.includes("instructor") ||
      q.includes("teacher")
    ) {
      return "All our courses are taught by industry experts with years of real-world experience. They bring practical insights and current industry knowledge to every lesson.";
    }
    if (q.includes("contact") || q.includes("email") || q.includes("phone")) {
      return "You can reach us at hello@eduflow.com or call us at (123) 456-7890. We're here to help Monday-Friday, 9AM-6PM!";
    }
    if (q.includes("event") || q.includes("workshop")) {
      return "We regularly host workshops, webinars, and networking events. Check out our Upcoming Events section to see what's coming up!";
    }
    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      return "Hello! How can I help you today? Feel free to ask about our courses, learning options, or anything else!";
    }
    if (q.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    return "That's a great question! For detailed information, please contact us at hello@eduflow.com or call (123) 456-7890. Our team will be happy to assist you!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: getResponse(input),
        isBot: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 z-50 transition-transform hover:scale-110"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-orange-500 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold text-lg">EduFlow Assistant</h3>
            <p className="text-sm opacity-90">Ask me anything!</p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
