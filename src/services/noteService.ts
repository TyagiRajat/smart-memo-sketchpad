
import { Note, NoteFormData } from '@/types';

// Initialize notes from localStorage or use the default note if localStorage is empty
const getInitialNotes = (): Note[] => {
  const storedNotes = localStorage.getItem('notes');
  if (storedNotes) {
    return JSON.parse(storedNotes);
  }
  
  // Default initial note
  return [{
    id: '1',
    title: 'Welcome to AI Notes',
    content: '# Welcome to AI Notes\n\nThis is your first note. You can edit it, delete it, or create new ones.\n\n## Features\n\n- Create, edit, and delete notes\n- Organize with tags\n- Summarize with AI\n- Save favorites\n\nEnjoy using AI Notes!',
    summary: 'Introduction to AI Notes application with overview of key features including note management, tagging, AI summarization and favorites.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '123',
    is_favorite: true,
    tags: ['welcome', 'tutorial']
  }];
};

// Mock database of notes
let mockNotes: Note[] = getInitialNotes();

// Helper function to save notes to localStorage
const saveNotesToStorage = () => {
  localStorage.setItem('notes', JSON.stringify(mockNotes));
};

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get all notes for a user
export const getNotes = async (userId: string): Promise<Note[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockNotes.filter(note => note.user_id === userId);
};

// Get a single note by ID
export const getNoteById = async (noteId: string): Promise<Note | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockNotes.find(note => note.id === noteId);
};

// Create a new note
export const createNote = async (userId: string, noteData: NoteFormData): Promise<Note> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newNote: Note = {
    id: generateId(),
    title: noteData.title,
    content: noteData.content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: userId,
    is_favorite: false,
    tags: noteData.tags || []
  };
  
  mockNotes = [...mockNotes, newNote];
  saveNotesToStorage(); // Save to localStorage
  return newNote;
};

// Update an existing note
export const updateNote = async (noteId: string, noteData: Partial<NoteFormData>): Promise<Note> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const noteIndex = mockNotes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    throw new Error('Note not found');
  }
  
  const updatedNote = {
    ...mockNotes[noteIndex],
    ...noteData,
    updated_at: new Date().toISOString()
  };
  
  mockNotes[noteIndex] = updatedNote;
  mockNotes = [...mockNotes];
  saveNotesToStorage(); // Save to localStorage
  
  return updatedNote;
};

// Delete a note
export const deleteNote = async (noteId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  mockNotes = mockNotes.filter(note => note.id !== noteId);
  saveNotesToStorage(); // Save to localStorage
};

// Toggle favorite status
export const toggleFavorite = async (noteId: string): Promise<Note> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const noteIndex = mockNotes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    throw new Error('Note not found');
  }
  
  const updatedNote = {
    ...mockNotes[noteIndex],
    is_favorite: !mockNotes[noteIndex].is_favorite,
    updated_at: new Date().toISOString()
  };
  
  mockNotes[noteIndex] = updatedNote;
  mockNotes = [...mockNotes];
  saveNotesToStorage(); // Save to localStorage
  
  return updatedNote;
};

// Get favorite notes
export const getFavorites = async (userId: string): Promise<Note[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockNotes.filter(note => note.user_id === userId && note.is_favorite);
};

// Search notes
export const searchNotes = async (userId: string, query: string): Promise<Note[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const searchLower = query.toLowerCase();
  
  return mockNotes.filter(note => 
    note.user_id === userId && 
    (note.title.toLowerCase().includes(searchLower) || 
     note.content.toLowerCase().includes(searchLower) ||
     note.tags?.some(tag => tag.toLowerCase().includes(searchLower)))
  );
};
