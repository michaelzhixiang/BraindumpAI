import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useProcessDump } from "@/hooks/use-ai";
import { useToast } from "@/hooks/use-toast";
import { useI18n, getAck } from "@/lib/i18n";

interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
}

export default function Dump() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: t("dump.welcome"), sender: "system" }
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

    const ack = getAck();
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
      toast({ title: t("dump.nothingToSort"), variant: "destructive" });
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
          ? `${t("dump.sorted")} ${count} task${count > 1 ? 's' : ''} ${t("dump.tasksIntoQueue")}`
          : t("dump.noTasks"),
        sender: "system"
      }]);

      setUserDumpTexts([]);

      if (count > 0) {
        toast({ title: `${count} task${count > 1 ? 's' : ''} ${t("dump.addedToQueue")}` });
      }
    } catch (error) {
      toast({ title: t("dump.brainFreeze"), description: t("dump.tryLater"), variant: "destructive" });
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
                  ? "bg-[#3B82F6] text-white rounded-tr-sm neon-btn"
                  : "glass-card text-foreground/80 rounded-tl-sm neon-border-subtle"
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
               className="bg-[#3B82F6] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 neon-btn transition-all"
             >
               {isProcessing ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
               {isProcessing ? t("dump.sorting") : t("dump.sortButton")}
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
            placeholder={t("dump.placeholder")}
            data-testid="input-dump"
            className="w-full glass-card rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/30 resize-none min-h-[56px] text-foreground/90 placeholder:text-muted-foreground/30 neon-border-subtle"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            data-testid="button-send"
            className="absolute right-2.5 bottom-2.5 p-2 bg-[#3B82F6] text-white rounded-xl disabled:opacity-20 disabled:bg-white/10 transition-all neon-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
