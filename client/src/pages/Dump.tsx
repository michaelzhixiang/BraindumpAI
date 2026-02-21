import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Plus, CheckCircle2 } from "lucide-react";
import { useProcessDump } from "@/hooks/use-ai";
import { useCreateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
}

export default function Dump() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "What's on your mind?", sender: "system" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposedTasks, setProposedTasks] = useState<Array<{ content: string; tier: "focus" | "backlog" | "icebox" }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: processDump } = useProcessDump();
  const { mutateAsync: createTask } = useCreateTask();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate instant system ack
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: "Copy that 🫡", 
        sender: "system" 
      }]);
    }, 600);
  };

  const handleSort = async () => {
    setIsProcessing(true);
    try {
      const allUserText = messages
        .filter(m => m.sender === "user")
        .map(m => m.text)
        .join("\n");
      
      if (!allUserText) {
        toast({ title: "Nothing to sort yet!", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      const result = await processDump(allUserText);
      setProposedTasks(result.tasks);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Here's what I extracted. Tap to add to your lists.",
        sender: "system"
      }]);
    } catch (error) {
      toast({ title: "AI Brain Freeze", description: "Try again later.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTask = async (task: { content: string; tier: "focus" | "backlog" | "icebox" }, index: number) => {
    try {
      await createTask({ ...task, status: "pending" });
      setProposedTasks(prev => prev.filter((_, i) => i !== index));
      toast({ title: "Added to " + task.tier });
    } catch (e) {
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        
        {proposedTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mt-4"
          >
            {proposedTasks.map((task, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-white/10 p-4 rounded-xl flex justify-between items-center gap-4 group"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.content}</p>
                  <span className={`text-[10px] uppercase tracking-wider font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                    task.tier === "focus" ? "bg-red-500/20 text-red-200" :
                    task.tier === "backlog" ? "bg-yellow-500/20 text-yellow-200" :
                    "bg-blue-500/20 text-blue-200"
                  }`}>
                    {task.tier}
                  </span>
                </div>
                <button
                  onClick={() => handleAddTask(task, i)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pb-24">
        {proposedTasks.length === 0 && messages.filter(m => m.sender === "user").length > 0 && (
           <div className="flex justify-center mb-4">
             <button
               onClick={handleSort}
               disabled={isProcessing}
               className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
             >
               {isProcessing ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
               {isProcessing ? "Sorting..." : "Done - Sort My Stuff"}
             </button>
           </div>
        )}

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type anything..."
            className="w-full bg-muted/50 backdrop-blur-md border border-white/5 rounded-3xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none min-h-[60px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
