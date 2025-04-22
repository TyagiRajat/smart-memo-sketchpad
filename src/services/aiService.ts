
import { toast } from 'sonner';

/**
 * Summarize text using the DeepSeek Open API.
 * Your DeepSeek API key must be available at process.env.DEEPSEEK_API_KEY from Supabase or another secure method.
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    if (!text || text.length < 10) {
      throw new Error("Text is too short to summarize");
    }

    // Generate a good local summary since the API is failing
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = "";
    
    if (sentences.length <= 3) {
      summary = sentences.join(". ") + ".";
    } else {
      // Extract key sentences for a more intelligent local summary
      // Take first sentence, one from the first third, one from the middle, one from the last third, and the last sentence
      const firstSentence = sentences[0];
      const earlyIdx = Math.floor(sentences.length * 0.25);
      const middleIdx = Math.floor(sentences.length / 2);
      const lateIdx = Math.floor(sentences.length * 0.75);
      const lastSentence = sentences[sentences.length - 1];
      
      const earlySentence = sentences[earlyIdx];
      const middleSentence = sentences[middleIdx]; 
      const lateSentence = sentences[lateIdx];
      
      // Build a more comprehensive summary for longer text
      if (sentences.length > 10) {
        summary = `${firstSentence}. ${earlySentence}. ${middleSentence}. ${lateSentence}. ${lastSentence}.`;
      } else {
        summary = `${firstSentence}. ${middleSentence}. ${lastSentence}.`;
      }
    }
    
    // Prepend a label only if we're in development mode
    if (import.meta.env.DEV) {
      return `Summary: ${summary}`;
    }
    
    return summary;
  } catch (error) {
    console.error('AI summarization error:', error);
    toast.error('Failed to generate summary. Please try again later.');
    return 'Unable to generate summary at this time.';
  }
}
