
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createNote } from '@/services/noteService';
import { toast } from 'sonner';
import NoteEditor from '@/components/notes/NoteEditor';
import { NoteFormData } from '@/types';
import { PenLine } from 'lucide-react';

const CreateNote = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = async (data: NoteFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a note');
      return;
    }

    try {
      await createNote(user.id, data);
      toast.success('Note created successfully');
      navigate('/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleCancel = () => {
    navigate('/notes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PenLine className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Create New Note</h1>
      </div>
      
      <div className="bg-card border rounded-lg p-6">
        <NoteEditor onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateNote;
