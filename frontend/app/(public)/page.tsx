// 

"use client"

import { ModeToggleButton } from '@/components/mode-toggle-button'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Theme toggle button */}
      <header className="p-4 flex justify-end container mx-auto">
        <ModeToggleButton />
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            <Sparkles className='w-4 h-4' />
            <span>Powered by Gemini</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Hire the top 1% <br />
            <span className="text-secondary-foreground">in seconds.</span>
          </h1>
          <p className="text-xl text-foreground max-w-2xl mx-auto mb-8">
            Drowning in CVs? Let Recruitly's AI sift through the noise and deliver your perfect hire instantly.
          </p>

          <div className="flex-gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className='h-12 px-8 text-lg rounded-full'>
                Start Hiring Now <ArrowRight className='ml-2 w-5 h-5' />
              </Button>
            </Link>
            <Link href='#features'>
              <Button variant="outline" size="lg" className='h-12 px-8 text-lg rounded-full'>
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="py-12 border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-6">Powered by modern tech</p>
          <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all dark:invert">
            <span className="text-2xl font-bold">Next.js</span>
            <span className="text-2xl font-bold">Gemini AI</span>
            <span className="text-2xl font-bold">Supabase</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage