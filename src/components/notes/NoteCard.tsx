
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note, NoteFormData } from '@/types';
import { Sparkles, Edit, Trash, Star, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

  // OpenRouter API key and summary states
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
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

  // AI Summary generation and dialog logic with OpenRouter (DeepSeek V3 Base)
  const handleGenerateSummary = async () => {
    // Validate API key
    if (!openRouterApiKey.trim()) {
      toast.error("Please enter your OpenRouter API key");
      return;
    }

    setSummaryLoading(true);
    setSummary(null);
    try {
      // Compose site URL and title from window.location for headers
      const referer = window.location.origin;
      const siteTitle = document.title || "AI Notes";

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${openRouterApiKey.trim()}`,
          "HTTP-Referer": referer,
          "X-Title": siteTitle,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-v3-base:free",
          messages: [
            {
              role: 'system', 
              content: 'You are a helpful assistant that creates concise, clear summaries of text.'
            },
            {
              role: 'user', 
              content: `Please provide a concise summary of the following text:\n\n${note.content}`
            }
          ],
          max_tokens: 180
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const data = await response.json();
      // OpenRouter conforms to OpenAI schema
      const generatedSummary = data.choices?.[0]?.message?.content?.trim() || 'No summary generated.';
      
      setSummary(generatedSummary);
      setSummaryDialogOpen(true);
      toast.success('Summary generated successfully!');
    } catch (error: any) {
      console.error('OpenRouter summary generation error:', error);
      toast.error('Failed to generate summary. Check your API key and try again.');
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
    } catch (error) {
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
          
          <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  setSummaryDialogOpen(true);
                  setSummary(null);
                }}
              >
                <Sparkles className="h-4 w-4" />
                Generate AI Summary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>OpenRouter API Key Required</DialogTitle>
                <DialogDescription>
                  Enter your free OpenRouter API key and click "Summarize" to generate an AI summary.<br />
                  <span className="font-mono text-xs text-muted-foreground">Model: deepseek/deepseek-v3-base:free</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input 
                  type="password"
                  placeholder="Enter OpenRouter API Key"
                  value={openRouterApiKey}
                  onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                <Button
                  variant="secondary"
                  disabled={summaryLoading || !openRouterApiKey.trim()}
                  onClick={handleGenerateSummary}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {summaryLoading ? "Summarizing..." : "Summarize"}
                </Button>
                
                {summary && (
                  <div className="mt-4 rounded bg-muted p-2">
                    <p className="text-sm whitespace-pre-line">{summary}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                {summary ? (
                  <Button onClick={handleSaveInTab} disabled={savingSummary}>
                    <Save className="h-4 w-4 mr-1" />
                    {savingSummary ? "Saving..." : "Save in new tab"}
                  </Button>
                ) : null}
                <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}
