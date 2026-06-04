import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { generateEmail } from "@/lib/ai-tools.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Productivity Assistant" },
      { name: "description", content: "Generate professional emails with AI assistance." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useServerFn(generateEmail);

  const handleGenerate = async () => {
    if (!purpose || !recipient || !keyPoints) return;
    setIsLoading(true);
    try {
      const result = await generate({
        data: { purpose, recipient, tone, keyPoints },
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
    a.download = "generated-email.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Smart Email Generator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Craft professional emails in seconds. Fill in the details and let AI handle the writing.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-card-foreground">Email Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g., Request a meeting, Follow up on proposal"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g., Client, Manager, Team lead"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="keyPoints">Key Points to Include</Label>
          <Textarea
            id="keyPoints"
            placeholder="List the main points you want to cover in the email..."
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !purpose || !recipient || !keyPoints}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Email"
          )}
        </Button>
      </div>

      {output && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-card-foreground">Generated Email</h2>
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
