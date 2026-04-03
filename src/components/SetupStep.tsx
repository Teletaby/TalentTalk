import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, ArrowRight, Briefcase, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface SetupStepProps {
  onStart: (jobDescription: string, resumeText: string) => void;
}

export function SetupStep({ onStart }: SetupStepProps) {
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

  const canStart = jobDescription.trim().length > 20 && resumeText.trim().length > 20;

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        {/* Teams Header */}
        <div className="teams-header mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Interview Preparation</h1>
              <p className="text-sm text-gray-500">JSquared Recruitment</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            AI Interview Practice
          </h1>
          <p className="text-gray-600 text-lg">
            Practice with our Senior Talent Acquisition AI. Get real feedback.
          </p>
        </div>

        <div className="space-y-6">
          <div className="teams-card p-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-900 mb-3 block">Job Description</span>
              <Textarea
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[150px] bg-white border-gray-300 focus:border-blue-500 resize-none"
              />
            </label>
          </div>

          <div className="teams-card p-6">
            <span className="text-sm font-medium text-gray-900 block mb-4">Your Resume</span>
            
            <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 hover:bg-gray-100">
              {isParsing ? (
                <>
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600">Parsing PDF...</span>
                </>
              ) : fileName ? (
                <>
                  <FileText className="w-10 h-10 text-blue-600" />
                  <span className="text-sm text-gray-900">{fileName}</span>
                  <span className="text-xs text-gray-500">Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload resume (.txt, .pdf)</span>
                </>
              )}
              <input type="file" className="hidden" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} />
            </label>

            {!fileName && (
              <div className="text-center text-xs text-gray-500 mt-2">or paste below</div>
            )}
            <Textarea
              placeholder="Or paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[120px] bg-white border-gray-300 focus:border-blue-500 resize-none mt-4"
            />
          </div>

          <Button
            onClick={() => onStart(jobDescription, resumeText)}
            disabled={!canStart}
            size="lg"
            className="w-full text-lg py-6 font-semibold teams-button-primary"
          >
            Start Interview <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
