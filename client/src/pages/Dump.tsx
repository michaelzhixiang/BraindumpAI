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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport || !containerRef.current) return;

    const onResize = () => {
      if (containerRef.current) {
        const offsetTop = viewport.offsetTop;
        containerRef.current.style.height = `${viewport.height}px`;
        containerRef.current.style.transform = `translateY(${offsetTop}px)`;
      }
    };

    viewport.addEventListener("resize", onResize);
    viewport.addEventListener("scroll", onResize);
    return () => {
      viewport.removeEventListener("resize", onResize);
      viewport.removeEventListener("scroll", onResize);
    };
  }, []);

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
    <div ref={containerRef} className="flex flex-col flex-1" data-testid="dump-page">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-[1.05rem] leading-[1.45] ${
                msg.sender === "user"
                  ? "rounded-tr-sm paper-btn"
                  : "paper-card rounded-tl-sm"
              }`}
              style={msg.sender === "system" ? { color: 'var(--paper-fg)' } : undefined}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-4 pt-2" style={{ background: 'var(--paper-bg)' }}>
        {userDumpTexts.length > 0 && (
           <div className="flex justify-center mb-3">
             <button
               onClick={handleSort}
               disabled={isProcessing}
               data-testid="button-sort"
               className="paper-btn px-5 py-2.5 rounded-full font-mono text-[0.65rem] font-medium uppercase tracking-[1px] flex items-center gap-2 transition-opacity"
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
            className="w-full paper-card rounded-2xl pl-5 pr-14 py-4 text-[1.05rem] leading-[1.45] focus:outline-none resize-none min-h-[56px]"
            style={{ color: 'var(--paper-fg)', borderColor: 'var(--paper-border)' }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            data-testid="button-send"
            className="absolute right-2.5 bottom-2.5 p-2 paper-btn rounded-xl disabled:opacity-20 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
