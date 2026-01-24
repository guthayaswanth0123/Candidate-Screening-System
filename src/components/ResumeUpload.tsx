import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedFile } from "@/types/resume";

interface ResumeUploadProps {
  files: UploadedFile[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  isAnalyzing: boolean;
}

export function ResumeUpload({
  files,
  onFilesAdd,
  onFileRemove,
  isAnalyzing,
}: ResumeUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdd(acceptedFiles);
    },
    [onFilesAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    disabled: isAnalyzing,
    multiple: true,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "processing":
      case "uploading":
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10">
          <Upload className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upload Resumes</h2>
          <p className="text-sm text-muted-foreground">
            Drop PDF, DOCX, or TXT files to analyze
          </p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`upload-zone rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? "upload-zone-active" : ""
        } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Upload className={`h-6 w-6 ${isDragActive ? "text-accent" : "text-muted-foreground"}`} />
          </div>
          <p className="text-foreground font-medium mb-1">
            {isDragActive ? "Drop files here" : "Drag & drop resumes here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse • PDF, DOCX, TXT supported
          </p>
        </motion.div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {files.length} resume{files.length !== 1 ? "s" : ""} uploaded
            </span>
            {!isAnalyzing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => files.forEach((f) => onFileRemove(f.id))}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear all
              </Button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                {getStatusIcon(file.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {file.status === "processing" && " • Processing..."}
                    {file.status === "complete" && " • Ready"}
                    {file.status === "error" && ` • ${file.error || "Error"}`}
                  </p>
                </div>
                {!isAnalyzing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileRemove(file.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
