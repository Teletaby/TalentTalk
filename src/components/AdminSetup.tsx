import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Briefcase, Upload, FileText, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface AdminSetupProps {
  onStart: (jobDescription: string, resumeText: string) => void;
}

export function AdminSetup({ onStart }: AdminSetupProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      textParts.push(pageText);
    }
    return textParts.join("\n\n");
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsParsing(true);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const text = await extractPdfText(file);
        setResumeText(text);
      } else {
        const text = await file.text();
        setResumeText(text);
      }
    } catch (err) {
      console.error("Failed to parse file:", err);
      setResumeText("");
      setFileName("");
    } finally {
      setIsParsing(false);
    }
  }, []);

  const canStart = jobDescription.trim().length > 20;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Briefcase className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Admin Mode</span>
        </div>
        <h1 className="text-4xl font-bold font-heading tracking-tight">
          Create Test Interview
        </h1>
        <p className="text-muted-foreground text-lg">
          Set up an interview scenario by uploading a job description. Resume is optional.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground mb-2 block">Job Description</span>
          <Textarea
            placeholder="Paste the full job description here... (required)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[150px] bg-background/50 border-border/50 focus:border-primary resize-none"
          />
        </label>
      </div>

      <div className="glass-card p-6 space-y-4">
        <span className="text-sm font-medium text-foreground block">Resume (Optional)</span>
        
        <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          {isParsing ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Parsing PDF...</span>
            </>
          ) : fileName ? (
            <>
              <FileText className="w-10 h-10 text-primary" />
              <span className="text-sm text-foreground">{fileName}</span>
              <span className="text-xs text-muted-foreground">Click to replace</span>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload resume (.txt, .pdf)</span>
            </>
          )}
          <input type="file" className="hidden" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} />
        </label>

        {!fileName && (
          <div className="text-center text-xs text-muted-foreground">or paste below</div>
        )}
        <Textarea
          placeholder="Or paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary resize-none"
        />
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Interview will include:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Voice conversation with Sarah Mitchell (Senior Recruiter)</li>
          <li>• Questions tailored to the job description</li>
          <li>• 5 job-specific technical assessment questions</li>
          <li>• Hands-on exercise tasks for the role</li>
          <li>• Final evaluation and score</li>
        </ul>
      </div>

      <Button
        onClick={() => onStart(jobDescription, resumeText)}
        disabled={!canStart}
        size="lg"
        className="w-full text-lg py-6 font-heading font-semibold"
      >
        Start Admin Interview <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
