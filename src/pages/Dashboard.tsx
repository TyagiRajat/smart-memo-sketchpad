
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getNotes, getFavorites, deleteNote, toggleFavorite } from '@/services/noteService';
import { Button } from '@/components/ui/button';
import NoteCard from '@/components/notes/NoteCard';
import { BookText, Plus, Star, Loader2, List } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user } = useAuth();
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { 
    data: notes, 
    isLoading: isNotesLoading, 
    refetch: refetchNotes 
  } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: () => user?.id ? getNotes(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const { 
    data: favorites, 
    isLoading: isFavoritesLoading, 
    refetch: refetchFavorites 
  } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => user?.id ? getFavorites(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const handleDeleteNote = async (id: string) => {
    setNoteToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote(noteToDelete);
      refetchNotes();
      refetchFavorites();
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setNoteToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      refetchNotes();
      refetchFavorites();
      toast.success('Favorites updated');
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const isLoading = isNotesLoading || isFavoritesLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/notes" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              View All Notes
            </Link>
          </Button>
          <Button asChild>
            <Link to="/notes/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Favorite Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-medium">Favorites</h2>
            </div>
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No favorite notes yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mark notes as favorites to see them here
                </p>
              </div>
            )}
          </div>

          {/* Recent Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookText className="h-5 w-5" />
                <h2 className="text-xl font-medium">Recent Notes</h2>
              </div>
              {notes && notes.length > 0 && (
                <Button asChild variant="link" size="sm">
                  <Link to="/notes">View all</Link>
                </Button>
              )}
            </div>
            {notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.slice(0, 6).map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No notes yet</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button asChild variant="outline">
                    <Link to="/notes">View all notes</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/notes/new">Create your first note</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
