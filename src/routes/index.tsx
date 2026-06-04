import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ClipboardList,
  Search,
  MessageSquare,
  Zap,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Your central hub for AI-powered workplace productivity tools." },
      { property: "og:title", content: "Dashboard — AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Your central hub for AI-powered workplace productivity tools." },
    ],
  }),
  component: DashboardPage,
});

const tools = [
  {
    title: "Smart Email Generator",
    description: "Craft professional emails in seconds with AI-powered writing assistance.",
    icon: Mail,
    url: "/email",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Transform raw meeting notes into structured summaries and action items.",
    icon: FileText,
    url: "/meeting-notes",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    title: "AI Task Planner",
    description: "Generate detailed task plans with priorities, timelines, and clear steps.",
    icon: ClipboardList,
    url: "/task-planner",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    title: "AI Research Assistant",
    description: "Get comprehensive research summaries on any topic at your preferred depth.",
    icon: Search,
    url: "/research",
    color: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    title: "AI Chatbot",
    description: "Have open-ended conversations with AI to brainstorm, solve problems, and more.",
    icon: MessageSquare,
    url: "/chat/new",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
];

function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Choose a tool below to supercharge your productivity with AI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            to={tool.url}
            className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:bg-accent"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}
            >
              <tool.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-card-foreground">{tool.title}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>Get started</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="font-semibold text-card-foreground">
              Responsible AI Use
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI-generated outputs should be reviewed before use in professional contexts.
              This assistant helps you draft and organize content, but you remain responsible
              for accuracy, tone, and appropriateness. Always verify facts and ensure outputs
              align with your organization&apos;s policies and standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
