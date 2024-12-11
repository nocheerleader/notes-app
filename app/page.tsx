'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChangeEvent } from 'react'
import { SummaryDialog } from "@/components/summary-dialog"

// Define a type for our notes
interface Note {
  id: number
  title: string
  content: string
  date: string
}

export default function Home() {
  // State to store our notes and form inputs
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryDialog, setSummaryDialog] = useState({
    isOpen: false,
    summary: '',
    error: ''
  })

  // Function to handle adding a new note
  const handleAddNote = () => {
    // Don't add empty notes
    if (!title.trim() || !content.trim()) return

    if (editingId) {
      // If we're editing, update the existing note
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, title, content } 
          : note
      ))
      setEditingId(null) // Clear editing state
    } else {
      // If we're adding a new note
      const newNote = {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString()
      }
      setNotes([...notes, newNote])
    }
    
    // Clear the form
    setTitle('')
    setContent('')
  }

  // Add function to handle editing
  const handleEdit = (note: Note) => {
    setTitle(note.title)
    setContent(note.content)
    setEditingId(note.id)
  }

  // Add function to handle deletion
  const handleDelete = (id: number) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  // Add function to handle summarization
  const handleSummarize = async (note: Note) => {
    setIsSummarizing(true)
    setSummaryDialog({ isOpen: true, summary: '', error: '' })

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.content })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setSummaryDialog(prev => ({ ...prev, summary: data.summary }))
    } catch (error) {
      setSummaryDialog(prev => ({ ...prev, error: 'Failed to generate summary' }))
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Note Input Section */}
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-bold">My Notes</h1>
        
        <div className="space-y-4">
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
          
          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button onClick={handleAddNote}>
            {editingId ? 'Update Note' : 'Add Note'}
          </Button>
          {editingId && (
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingId(null)
                setTitle('')
                setContent('')
              }}
              className="ml-2"
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      {/* Notes Display Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>{note.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{note.content}</p>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(note)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSummarize(note)}
                  disabled={isSummarizing}
                >
                  {isSummarizing ? (
                    <>
                      <span className="animate-spin mr-2">⭮</span> 
                      Summarizing...
                    </>
                  ) : (
                    'Summarize'
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(note.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SummaryDialog 
        isOpen={summaryDialog.isOpen}
        onClose={() => setSummaryDialog(prev => ({ ...prev, isOpen: false }))}
        summary={summaryDialog.summary}
        isLoading={isSummarizing}
        error={summaryDialog.error}
      />
    </div>
  )
}