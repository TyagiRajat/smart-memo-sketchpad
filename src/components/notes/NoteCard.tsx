
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note, NoteFormData } from '@/types';
import { Sparkles, Edit, Trash, Star, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { summarizeText } from '@/services/aiService';
import { toast } from 'sonner';
import { createNote } from '@/services/noteService';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function NoteCard({ note, onDelete, onToggleFavorite }: NoteCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // For AI Summary dialog
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);

  // Extract first 150 characters of content for preview
  const contentPreview = note.content.length > 150 
    ? note.content.substring(0, 150) + '...' 
    : note.content;

  // Format date
  const formattedDate = format(new Date(note.updated_at), 'MMM d, yyyy');

  // AI Summary generation and dialog logic
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const sum = await summarizeText(note.content);
      setSummary(sum);
      setSummaryDialogOpen(true);
    } catch (e) {
      toast.error("AI summary failed to generate");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Save summary as a new note
  const handleSaveInTab = async () => {
    setSavingSummary(true);
    try {
      await createNote(note.user_id, {
        title: `AI Summary of "${note.title}"`,
        content: summary || '',
        tags: [...(note.tags || []), "ai-summary"],
      });
      toast.success('AI summary saved as new note');
      setSummaryDialogOpen(false);
      // Optionally navigate to new note tab/page
    } catch {
      toast.error("Failed to save summary as note");
    } finally {
      setSavingSummary(false);
    }
  };

  return (
    <Card 
      className={`h-full transition-shadow hover:shadow-md ${isHovered ? 'ring-1 ring-accent/20' : ''}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{note.title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${note.is_favorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                  onClick={() => onToggleFavorite(note.id)}
                >
                  <Star className={`h-5 w-5 ${note.is_favorite ? 'fill-yellow-500' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {formattedDate}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm line-clamp-4 whitespace-pre-line">
          {contentPreview}
        </div>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit note</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete note</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                >
                  <Sparkles className="h-4 w-4" />
                  {summaryLoading ? "Summarizing..." : "Generate AI Summary"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Generate AI summary
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {note.summary && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <Sparkles className="h-3 w-3" />
                  AI Summary
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{note.summary}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>

      {/* Generate AI Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Generated Summary</DialogTitle>
            <DialogDescription>
              The summary below is generated by AI for this note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {summaryLoading ? (
              <div className="text-muted-foreground">Generating summary...</div>
            ) : (
              <p className="text-sm whitespace-pre-line">{summary}</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveInTab} disabled={savingSummary || summaryLoading}>
              <Save className="h-4 w-4 mr-1" />
              {savingSummary ? "Saving..." : "Save in new tab"}
            </Button>
            <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
