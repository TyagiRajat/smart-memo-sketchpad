
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/types';
import { Edit, Trash, Star, Save, Sparkles, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createNote } from '@/services/noteService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAiSummary } from '@/services/aiService';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function NoteCard({ note, onDelete, onToggleFavorite }: NoteCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);

  // Extract preview of content
  const contentPreview = note.content.length > 150 
    ? note.content.substring(0, 150) + '...' 
    : note.content;

  // Format date
  const formattedDate = format(new Date(note.updated_at), 'MMM d, yyyy');

  // Call AI summarize endpoint through our secure proxy
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummary(null);
    try {
      const generatedSummary = await generateAiSummary(note.content);
      setSummary(generatedSummary);
      toast.success('Summary generated successfully!');
    } catch (err: any) {
      console.error('Summary error:', err);
      toast.error("Failed to generate summary: " + (err?.message || "Unknown error"));
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Save summary as a new note
  const handleSaveInTab = async () => {
    if (!summary) {
      toast.error("No summary to save");
      return;
    }
    setSavingSummary(true);
    try {
      await createNote(note.user_id, {
        title: `AI Summary of "${note.title}"`,
        content: summary,
        tags: [...(note.tags || []), "ai-summary"],
      });
      toast.success('AI summary saved as new note');
      setSummaryDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save summary as note");
    } finally {
      setSavingSummary(false);
    }
  };

  // View full note content
  const handleViewNote = () => {
    navigate(`/notes/${note.id}`);
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
      <CardFooter className="flex justify-between pt-2 flex-wrap gap-2">
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
                  className="h-8 w-8"
                  onClick={handleViewNote}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View note</TooltipContent>
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
        </div>

        <Button 
          variant="outline"
          size="sm"
          className="gap-1 mt-1"
          onClick={() => {
            setSummaryDialogOpen(true);
            // Automatically generate summary when dialog opens
            if (!summary && !summaryLoading) {
              handleGenerateSummary();
            }
          }}
        >
          <Sparkles className="h-4 w-4" />
          Generate AI Summary
        </Button>

        <Dialog open={summaryDialogOpen} onOpenChange={(open) => {
          setSummaryDialogOpen(open);
          if (!open) setSummary(null);
        }}>
          <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                AI Summary
              </DialogTitle>
              <DialogDescription>
                {summary ? 
                  "Here's your AI-generated summary:" : 
                  "Generating summary..."
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {summaryLoading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : summary ? (
                <ScrollArea className="max-h-[60vh] mt-4">
                  <div className="rounded bg-muted p-4 min-h-[12rem]">
                    <p className="text-base whitespace-pre-line">{summary}</p>
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Preparing to generate summary...</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 mt-4">
              {summary && (
                <Button onClick={handleSaveInTab} disabled={savingSummary}>
                  <Save className="h-4 w-4 mr-1" />
                  {savingSummary ? "Saving..." : "Save as new note"}
                </Button>
              )}
              <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
