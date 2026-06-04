import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function generateId() {
  return `thread_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const Route = createFileRoute("/chat/new")({
  component: NewChatPage,
});

function NewChatPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const threadId = generateId();
    const threads = JSON.parse(localStorage.getItem("ai-assistant-threads") || "[]");
    const newThread = {
      id: threadId,
      title: "New conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    localStorage.setItem("ai-assistant-threads", JSON.stringify([newThread, ...threads]));
    localStorage.setItem("ai-assistant-active-thread", threadId);
    navigate({ to: "/chat/$threadId", params: { threadId } });
  }, [navigate]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">Creating new conversation...</p>
    </div>
  );
}
