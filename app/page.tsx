'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SummaryDialog } from "@/components/summary-dialog"
import { OpenAI } from 'openai';

interface Note {
  id: number
  title: string
  content: string
  created_at: Date | string // Can be either a Date object or ISO string timestamp
  summary?: string | null
  user_id?: string | null
}

export default function Home() {
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

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return
    }

    setNotes(data || [])
  }

  async function handleAddNote() {
    console.log('Starting handleAddNote...');
    console.log('Current state:', { title, content, editingId });

    // 1. First validate inputs
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      if (editingId) {
        // Updating existing note
        const { data, error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }

      } else {
        // Creating new note
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title, content }])
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }
      }

      // If successful, refresh notes and clear form
      await fetchNotes();
      setTitle('');
      setContent('');
      setEditingId(null);

    } catch (error) {
      // Improved error handling
      console.error('Error saving note:', error);
      alert(error instanceof Error ? error.message : 'Failed to save note. Please try again.');
    }
  }

  async function handleDelete(id: number) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting note:', error)
      return
    }

    fetchNotes()
  }

  async function handleSummarize(note: Note) {
    // Start loading state
    setIsSummarizing(true);
    setSummaryDialog({ isOpen: true, summary: '', error: '' });
    // Set the editingId to the current note's id
    setEditingId(note.id);

    try {
      // Make API call to your summary endpoint
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: note.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();

      // Update dialog with the summary
      setSummaryDialog({
        isOpen: true,
        summary: data.summary,
        error: ''
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryDialog({
        isOpen: true,
        summary: '',
        error: 'Failed to generate summary. Please try again.'
      });
      // Clear the editingId if there's an error
      setEditingId(null);
    } finally {
      setIsSummarizing(false);
    }
  }

  async function handleSaveSummary(summary: string) {
    if (!editingId) {
      console.error('No note selected for summary');
      alert('Error: No note selected');
      return;
    }

    if (!summary.trim()) {
      alert('Summary cannot be empty');
      return;
    }

    try {
      // Update the note in Supabase with the new summary
      const { error } = await supabase
        .from('notes')
        .update({ summary })
        .eq('id', editingId);

      if (error) {
        throw new Error(error.message);
      }

      // Close the dialog and refresh notes
      setSummaryDialog({ isOpen: false, summary: '', error: '' });
      setEditingId(null); // Clear the editingId after successful save
      await fetchNotes();

    } catch (error) {
      console.error('Error saving summary:', error);
      alert('Failed to save summary. Please try again.');
    }
  }

  function handleCloseDialog() {
    setSummaryDialog({ isOpen: false, summary: '', error: '' });
    setEditingId(null);
  }

  // Rest of your component remains the same
  // ... (keep your existing JSX and other functions)

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Notes App</h1>
        
        {/* Add Note Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Note' : 'Add New Note'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update your note below' : 'Create a new note by filling out the form below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Note content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <Button onClick={handleAddNote}>
                {editingId ? 'Update Note' : 'Add Note'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>{new Date(note.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{note.content}</p>
                {note.summary && (
                  <div className="bg-secondary/50 p-4 rounded-lg mb-4">
                    <p className="font-medium mb-1">Summary:</p>
                    <p className="text-sm">{note.summary}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTitle(note.title);
                      setContent(note.content);
                      setEditingId(note.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSummarize(note)}
                  >
                    Summarize
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Dialog */}
        <SummaryDialog
  isOpen={summaryDialog.isOpen}
  onClose={handleCloseDialog}  // Use the new handler
  summary={summaryDialog.summary}
  error={summaryDialog.error}
  isLoading={isSummarizing}
  onSave={handleSaveSummary}
/>
      </div>
    </main>
  )
}