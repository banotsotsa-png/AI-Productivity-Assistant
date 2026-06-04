import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Plus, Trash2, Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Chat — AI Workplace Productivity Assistant" },
      { name: "description", content: "Chat with AI to boost your workplace productivity." },
    ],
  }),
  component: ChatPage,
});

interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
}

function loadThreads(): ChatThread[] {
  try {
    return JSON.parse(localStorage.getItem("ai-assistant-threads") || "[]");
  } catch {
    return [];
  }
}

function saveThreads(threads: ChatThread[]) {
  localStorage.setItem("ai-assistant-threads", JSON.stringify(threads));
}

function ChatPage() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const thread = threads.find((t) => t.id === threadId);

  const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    initialMessages: thread?.messages || [],
    transport: chatTransport,
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (threadId && messages.length > 0) {
      setThreads((prev) => {
        const updated = prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: messages as UIMessage[], updatedAt: Date.now() }
            : t
        );
        saveThreads(updated);
        return updated;
      });

      // Update title from first user message
      const firstUserMessage = messages.find((m) => m.role === "user");
      if (firstUserMessage) {
        const text = firstUserMessage.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("");
        if (text) {
          const title = text.slice(0, 40) + (text.length > 40 ? "..." : "");
          setThreads((prev) => {
            const updated = prev.map((t) =>
              t.id === threadId ? { ...t, title } : t
            );
            saveThreads(updated);
            return updated;
          });
        }
      }
    }
  }, [messages, threadId]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      sendMessage({ text: inputValue.trim() });
      setInputValue("");
    },
    [inputValue, isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewThread = () => {
    navigate({ to: "/chat/new" });
  };

  const handleDeleteThread = (id: string) => {
    setThreads((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveThreads(updated);
      if (id === threadId && updated.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: updated[0].id } });
      } else if (id === threadId) {
        navigate({ to: "/chat/new" });
      }
      return updated;
    });
  };

  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Button onClick={handleNewThread}>
          <Plus className="mr-2 h-4 w-4" />
          Start New Conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6">
      {/* Thread sidebar */}
      <div className="hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Conversations</h2>
          <Button variant="ghost" size="icon-sm" onClick={handleNewThread} className="h-7 w-7">
            <Plus className="h-4 w-4" />
            <span className="sr-only">New conversation</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  t.id === threadId
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <button
                  onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: t.id } })}
                  className="flex-1 truncate text-left"
                >
                  {t.title}
                </button>
                <button
                  onClick={() => handleDeleteThread(t.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            ))}
            {threads.length === 0 && (
              <p className="px-2 text-xs text-sidebar-foreground/60">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  How can I help you today?
                </h2>
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  Ask me anything about work, productivity, planning, or general questions.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 pt-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t bg-card p-4">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[48px] resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="h-12 w-12 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI-generated responses may contain inaccuracies. Please review before using in professional contexts.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>
      <div className={`max-w-[80%] space-y-1 ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <div className="prose-sm-custom prose-custom">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
        {!isUser && (
          <div className="flex justify-start">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
