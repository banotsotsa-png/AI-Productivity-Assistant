import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { researchTopic } from "@/lib/ai-tools.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Productivity Assistant" },
      { name: "description", content: "Get comprehensive research summaries with AI." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("medium");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const research = useServerFn(researchTopic);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const result = await research({
        data: { topic, depth },
      });
      setOutput(result.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI Research Assistant
          </h1>
        </div>
        <p className="text-muted-foreground">
          Enter any topic and get a comprehensive, structured research summary.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-card-foreground">Research Query</h2>
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., Remote work productivity trends, AI in healthcare"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depth">Depth</Label>
          <Select value={depth} onValueChange={setDepth}>
            <SelectTrigger id="depth">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brief">Brief Overview</SelectItem>
              <SelectItem value="medium">Medium Detail</SelectItem>
              <SelectItem value="deep">Deep Dive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !topic}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            "Start Research"
          )}
        </Button>
      </div>

      {output && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-card-foreground">Research Summary</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
          <Textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="min-h-[300px] resize-y font-mono text-sm leading-relaxed"
          />
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </h3>
            <div className="prose-sm-custom prose-custom text-foreground">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
