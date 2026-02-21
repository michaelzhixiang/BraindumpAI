import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useProcessDump } from "@/hooks/use-ai";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
}

const acks = [
  "Copy that",
  "Got it",
  "Noted",
  "On the list",
  "Logged",
  "Captured",
];

export default function Dump() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "What's on your mind? Dump everything here.", sender: "system" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userDumpTexts, setUserDumpTexts] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { mutateAsync: processDump } = useProcessDump();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setUserDumpTexts(prev => [...prev, input.trim()]);
    setInput("");

    const ack = acks[Math.floor(Math.random() * acks.length)];
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: ack, 
        sender: "system" 
      }]);
    }, 400);

    inputRef.current?.focus();
  };

  const handleSort = async () => {
    if (userDumpTexts.length === 0) {
      toast({ title: "Nothing to sort yet!", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const dumpText = userDumpTexts.join("\n");
      const result = await processDump(dumpText);
      
      const count = result.tasks?.length || 0;

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: count > 0 
          ? `Sorted ${count} task${count > 1 ? 's' : ''} into your queue. Check the Queue tab to review.`
          : "Couldn't extract any actionable tasks. Try being more specific!",
        sender: "system"
      }]);

      setUserDumpTexts([]);

      if (count > 0) {
        toast({ title: `${count} task${count > 1 ? 's' : ''} added to your queue` });
      }
    } catch (error) {
      toast({ title: "AI Brain Freeze", description: "Try again later.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative" data-testid="dump-page">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-44">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[hsl(var(--primary))] text-white rounded-tr-sm"
                  : "glass-card text-foreground/80 rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-24" style={{ background: 'linear-gradient(to top, hsl(228 12% 4%) 50%, transparent)' }}>
        {userDumpTexts.length > 0 && (
           <div className="flex justify-center mb-4">
             <button
               onClick={handleSort}
               disabled={isProcessing}
               data-testid="button-sort"
               className="bg-[hsl(var(--primary))] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-[hsl(var(--primary))]/20 transition-all hover:shadow-[hsl(var(--primary))]/30"
             >
               {isProcessing ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
               {isProcessing ? "Sorting..." : "Done - Sort My Stuff"}
             </button>
           </div>
        )}

        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type anything..."
            data-testid="input-dump"
            className="w-full glass-card rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/30 resize-none min-h-[56px] text-foreground/90 placeholder:text-muted-foreground/30"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            data-testid="button-send"
            className="absolute right-2.5 bottom-2.5 p-2 bg-[hsl(var(--primary))] text-white rounded-xl disabled:opacity-20 disabled:bg-white/10 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
