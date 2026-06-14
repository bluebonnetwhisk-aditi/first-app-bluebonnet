import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "baker";
  text: string;
}

interface BakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  "What is the Rasmalai Royalty cake?",
  "Recommend an eggless cake for 25 guests",
  "What's in the Indian Fusion Gifting box?",
  "Explain the Gulab Jamun Indulgence"
];

export default function BakerModal({ isOpen, onClose }: BakerModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "baker",
      text: "Namaste! Welcome to Bluebonnet Whisk. I'm your host and lead artisan baker. I can help recommend the perfect fusion flavors, calculate portion sizing, or customize any of our recipes for traditional eggless or dairy-free celebrations. How may I sweeten your day?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/baker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to consult baker");
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "baker",
          text: data.text
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "baker",
          text: "I apologize, my spice cabinet is a bit disorganized at the moment and I couldn't reach the server. Let me recommend trying again in a moment, or click 'ORDER INQUIRY' to send our kitchen team a physical note!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-[#fbfbfa] text-[#1a1c20] shadow-2xl border border-secondary-brand/25 flex flex-col h-[550px]">
        
        {/* Top Header */}
        <div className="bg-primary-brand text-white p-4 flex items-center justify-between border-b border-secondary-brand/15">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-brand-gold-tint flex items-center justify-center text-secondary-brand">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold leading-none">Consult our head Baker</h4>
              <span className="text-[10px] text-brand-gold-tint tracking-wide font-sans mt-1 block">Powered by Gemini AI • Sweet Advisory</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div 
                className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-primary-brand text-white rounded-br-none shadow-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs"
                }`}
              >
                {m.sender === "baker" && (
                  <div className="text-[10px] uppercase font-bold text-secondary-brand mb-1 tracking-wider family-sans">
                    Artisan Baker
                  </div>
                )}
                <p className="whitespace-pre-line font-sans">{m.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="max-w-[85%] rounded-lg bg-white border border-gray-100 p-3 text-sm leading-relaxed flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-secondary-brand" />
                <span className="text-gray-500 font-sans italic text-xs">Baker is reviewing spices and designs...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Helper */}
        {messages.length === 1 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Quick questions for the baker:</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="text-left text-xs bg-white hover:bg-secondary-brand/5 border border-gray-200 rounded-full px-3 py-1 text-gray-700 hover:border-secondary-brand transition-all flex items-center gap-1 shrink-0 font-sans"
                >
                  {p} <ArrowRight className="h-2.5 w-2.5 text-secondary-brand" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="p-3 bg-white border-t border-gray-150">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about flavors, custom themes, eggless options..."
              className="flex-1 text-sm border border-gray-200 bg-white px-3.5 py-2.5 rounded focus:border-secondary-brand focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-primary-brand hover:bg-primary-brand/95 text-white p-2.5 rounded flex items-center justify-center transition-all disabled:opacity-40 shadow-xs"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
