"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

interface AnalysisResult {
  candidate_name: string
  years_of_experience: number
  skills: string[]
  summary: string
  rating_score: number
  pros: string[]
  cons: string[]
}

const DashboardPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile?.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/analyze-resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResult(response.data)
    } catch (err) {
      console.error(err)
      setError("Failed to analyze the resume. Please try again.");
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Resume Analysis
        </h2>
        <p className="text-muted-foreground">
          Upload a CV to extract insights
        </p>
      </div>

      <Card className={`border-2 border-dashed transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
        <div {...getRootProps()} className="p-12 text-center cursor-pointer hover:bg-muted/50 transition-all">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {file ? file.name : "Drag & drop resume here, or click to select."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF files only (Max 5MB)
              </p>
            </div>
            {file && !isUploading && !result && (
              <Button onClick={e => { e.stopPropagation(); handleAnalyze(); }}>
                Analyze Resume
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Analyzing...</span>
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <Progress value={45} className="h-2 w-full animate-pulse" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                <div>
                  <CardTitle className="text-2xl">{result.candidate_name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{result.years_of_experience} Years Experience</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{result.rating_score}</div>
                  <div className="text-xs uppercase font-bold text-muted-foreground">Match Score</div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Professional Summary
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-green-600 dark:text-green-400">Strengths</h3>
                  <ul className="space-y-2">
                    {result.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-red-600 dark:text-red-400">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {result.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-3">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardPage