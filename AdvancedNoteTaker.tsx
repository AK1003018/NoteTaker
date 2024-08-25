import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Plus, Save, Settings, X, Search, Moon, Sun, Hash } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Component() {
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '', category: '', tags: [] })
  const [storageLocation, setStorageLocation] = useState('C:/Notes')
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [categories, setCategories] = useState(['Work', 'Personal', 'Ideas'])

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentNote.content,
    onUpdate: ({ editor }) => {
      setCurrentNote(prev => ({ ...prev, content: editor.getHTML() }))
    },
  })

  useEffect(() => {
    // Simulating loading notes from local storage
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    // Simulating saving notes to local storage
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (editor && currentNote.content !== editor.getHTML()) {
      editor.commands.setContent(currentNote.content)
    }
  }, [currentNote.id, editor])

  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [notes, searchTerm])

  const saveNote = () => {
    if (currentNote.title.trim() === '') return

    const updatedNotes = currentNote.id
      ? notes.map(note => (note.id === currentNote.id ? currentNote : note))
      : [...notes, { ...currentNote, id: Date.now() }]

    setNotes(updatedNotes)
    setCurrentNote({ id: null, title: '', content: '', category: '', tags: [] })
    editor?.commands.setContent('')
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id))
    if (currentNote.id === id) {
      setCurrentNote({ id: null, title: '', content: '', category: '', tags: [] })
      editor?.commands.setContent('')
    }
  }

  const addTag = (tag) => {
    if (!currentNote.tags.includes(tag)) {
      setCurrentNote(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tag) => {
    setCurrentNote(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '300px' }}
        className="bg-white dark:bg-gray-800 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Notes</h2>
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="ml-4"
          />
          <Label htmlFor="dark-mode" className="sr-only">Dark Mode</Label>
        </div>
        <div className="mb-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className="w-full"
            icon={<Search className="h-4 w-4 text-gray-500" />}
          />
        </div>
        <Button
          onClick={() => setCurrentNote({ id: null, title: '', content: '', category: '', tags: [] })}
          className="w-full mb-4"
        >
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
        <AnimatePresence>
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2"
            >
              <Button
                variant="ghost"
                className="w-full justify-between text-left"
                onClick={() => setCurrentNote(note)}
              >
                <div>
                  <div className="font-medium">{note.title}</div>
                  <div className="text-sm text-gray-500">{note.category}</div>
                </div>
                <X
                  className="h-4 w-4 text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(note.id)
                  }}
                />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
        <div className="mb-4 flex justify-between items-center">
          <Input
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            placeholder="Note Title"
            className="text-2xl font-bold bg-transparent border-none focus:ring-0"
          />
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {currentNote.category || 'Select Category'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map(category => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setCurrentNote(prev => ({ ...prev, category }))}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={saveNote}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Storage Settings</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Folder className="h-4 w-4" />
                  <Input
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Storage Location"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {currentNote.tags.map(tag => (
            <Button
              key={tag}
              variant="secondary"
              size="sm"
              onClick={() => removeTag(tag)}
            >
              {tag} <X className="ml-2 h-3 w-3" />
            </Button>
          ))}
          <Input
            placeholder="Add tag..."
            className="w-32"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag(e.target.value)
                e.target.value = ''
              }
            }}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}