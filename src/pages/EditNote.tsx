
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNoteById, updateNote } from '@/services/noteService';
import { toast } from 'sonner';
import NoteEditor from '@/components/notes/NoteEditor';
import { Note, NoteFormData } from '@/types';
import { Edit, Loader2 } from 'lucide-react';

const EditNote = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) {
        setError('Note ID is missing');
        setLoading(false);
        return;
      }

      try {
        const fetchedNote = await getNoteById(noteId);
        if (!fetchedNote) {
          setError('Note not found');
        } else if (fetchedNote.user_id !== user?.id) {
          setError('You do not have permission to edit this note');
        } else {
          setNote(fetchedNote);
        }
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, user?.id]);

  const handleSave = async (data: NoteFormData) => {
    if (!noteId) {
      toast.error('Note ID is missing');
      return;
    }

    try {
      await updateNote(noteId, data);
      toast.success('Note updated successfully');
      navigate(`/notes`);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleCancel = () => {
    navigate('/notes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-destructive">{error}</p>
        <button
          className="text-accent hover:underline mt-2"
          onClick={() => navigate('/notes')}
        >
          Return to notes
        </button>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Note not found</p>
        <button
          className="text-accent hover:underline mt-2"
          onClick={() => navigate('/notes')}
        >
          Return to notes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Edit className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Edit Note</h1>
      </div>
      
      <div className="bg-card border rounded-lg p-6">
        <NoteEditor 
          note={note} 
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
};

export default EditNote;
