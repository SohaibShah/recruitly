"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Data Types
interface AnalysisResult {
  candidate_name: string
  years_of_experience: number
  skills: string[]
  summary: string
  rating_score: number
  pros: string[]
  cons: string[]
  filename?: string // To track which file this is
}

interface UploadQueueItem {
  file: File
  status: 'idle' | 'processing' | 'done' | 'error'
  result?: AnalysisResult
}

export default function DashboardPage() {
  // Job Context State
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  
  // Queue State
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Handle File Drop (Supports Multiple)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(file => ({
      file,
      status: 'idle' as const
    }))
    setQueue(prev => [...prev, ...newItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true // ENABLE MULTIPLE
  })

  // 2. The Batch Processor
  const processQueue = async () => {
    if (!jobTitle || !jobDesc) {
      alert("Please enter a Job Title and Description first.")
      return
    }

    setIsProcessing(true)

    // Process files one by one (Sequential is safer for Free Tier limits)
    // For a real product, we would use a concurrency of 3-5.
    const itemsToProcess = queue.filter(item => item.status === 'idle')
    
    // Create a new queue array copy to update state
    let currentQueue = [...queue]

    for (let i = 0; i < currentQueue.length; i++) {
        if (currentQueue[i].status === 'idle') {
            
            // Set status to processing
            currentQueue[i].status = 'processing'
            setQueue([...currentQueue]) // Update UI

            const formData = new FormData()
            formData.append("file", currentQueue[i].file)
            formData.append("job_title", jobTitle)
            formData.append("job_description", jobDesc)

            try {
                const response = await axios.post("http://127.0.0.1:8000/analyze-resume", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                })
                
                // Success
                currentQueue[i].status = 'done'
                currentQueue[i].result = { ...response.data, filename: currentQueue[i].file.name }
            } catch (err) {
                console.error(err)
                currentQueue[i].status = 'error'
            }
            
            setQueue([...currentQueue]) // Update UI after each file
        }
    }

    setIsProcessing(false)
  }

  // 3. Derived State: Sorted Results (The Ranking)
  const results = queue
    .filter(item => item.status === 'done' && item.result)
    .map(item => item.result!)
    .sort((a, b) => b.rating_score - a.rating_score) // High score first

  const progress = (queue.filter(i => i.status === 'done' || i.status === 'error').length / queue.length) * 100

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header & Inputs */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">New Recruitment Drive</h2>
          <p className="text-muted-foreground">Define the role to get accurate AI scoring.</p>
        </div>
        <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
            <Input 
                placeholder="Job Title (e.g. Senior React Developer)" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="bg-background"
            />
            <Textarea 
                placeholder="Paste Job Description here..." 
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="bg-background min-h-25"
            />
        </div>
      </div>

      {/* Upload Zone */}
      <Card className={`border-2 border-dashed transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
        <div {...getRootProps()} className="p-10 text-center cursor-pointer hover:bg-muted/50 transition-all">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">
                Drag & Drop Resumes (PDF)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload multiple files at once.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Control Bar */}
      {queue.length > 0 && (
          <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
             <div className="flex items-center gap-3">
                <div className="font-semibold">{queue.length} Files Queued</div>
                {isProcessing && <Loader2 className="animate-spin w-4 h-4 text-primary" />}
             </div>
             <div className="flex items-center gap-4 flex-1 justify-end">
                {isProcessing && <Progress value={progress} className="w-1/3" />}
                <Button onClick={processQueue} disabled={isProcessing || !jobTitle}>
                    {isProcessing ? "Processing..." : "Start Analysis"}
                </Button>
             </div>
          </div>
      )}

      {/* Results / Leaderboard */}
      <div className="space-y-6">
        {results.length > 0 && <h3 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-yellow-500" /> Top Candidates</h3>}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
                {results.map((res, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        layout
                    >
                        <Card className={`h-full flex flex-col ${idx === 0 ? 'border-primary shadow-md' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{res.candidate_name}</CardTitle>
                                        <p className="text-xs text-muted-foreground truncate max-w-50">{res.filename}</p>
                                    </div>
                                    <Badge variant={res.rating_score > 80 ? "default" : "secondary"} className="text-lg font-bold px-3 py-1">
                                        {res.rating_score}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm flex-1 flex flex-col gap-3">
                                <p className="text-muted-foreground line-clamp-3">{res.summary}</p>
                                
                                <div className="mt-auto pt-4 space-y-2">
                                    <div className="flex flex-wrap gap-1">
                                        {res.skills.slice(0, 3).map(skill => (
                                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                        ))}
                                        {res.skills.length > 3 && <span className="text-xs text-muted-foreground">+{res.skills.length - 3}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>

    </div>
  )
}