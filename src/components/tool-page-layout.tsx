import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy, Check, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon: React.ElementType;
  inputs: React.ReactNode;
  onGenerate: () => void;
  output: string;
  setOutput: (value: string) => void;
  isLoading: boolean;
  outputLabel?: string;
}

export function ToolPageLayout({
  title,
  description,
  icon: Icon,
  inputs,
  onGenerate,
  output,
  setOutput,
  isLoading,
  outputLabel = "Generated Output",
}: ToolPageLayoutProps) {
  const [copied, setCopied] = useState(false);

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
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-card-foreground">Input Details</h2>
        {inputs}
        <Button onClick={onGenerate} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate with AI"
          )}
        </Button>
      </div>

      {output && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-card-foreground">{outputLabel}</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
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
