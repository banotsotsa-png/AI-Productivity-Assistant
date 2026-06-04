import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { summarizeMeetingNotes } from "@/lib/ai-tools.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Productivity Assistant" },
      { name: "description", content: "Transform raw meeting notes into structured summaries." },
    ],
  }),
  component: MeetingNotesPage,
});

function MeetingNotesPage() {
  const [notes, setNotes] = useState("");
  const [format, setFormat] = useState("structured-summary");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const summarize = useServerFn(summarizeMeetingNotes);

  const handleGenerate = async () => {
    if (!notes) return;
    setIsLoading(true);
    try {
      const result = await summarize({
        data: { notes, format },
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
    a.download = "meeting-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Meeting Notes Summarizer
          </h1>
        </div>
        <p className="text-muted-foreground">
          Paste raw meeting notes and get a clean, structured summary with action items.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-card-foreground">Meeting Notes</h2>
        <div className="space-y-2">
          <Label htmlFor="notes">Raw Notes</Label>
          <Textarea
            id="notes"
            placeholder="Paste your meeting notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="structured-summary">Structured Summary</SelectItem>
              <SelectItem value="bullet-points">Bullet Points</SelectItem>
              <SelectItem value="action-items-only">Action Items Only</SelectItem>
              <SelectItem value="executive-summary">Executive Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !notes}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize Notes"
          )}
        </Button>
      </div>

      {output && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-card-foreground">Summary</h2>
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
            className="min-h-[200px] resize-y font-mono text-sm leading-relaxed"
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
