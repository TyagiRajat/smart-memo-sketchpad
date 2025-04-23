import { toast } from 'sonner';

/**
 * Generate an AI summary of the provided text using a proxied Euron API
 * The actual API key is stored securely in Supabase Edge Function Secrets
 */
export async function generateAiSummary(text: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Summary API error:", errorText);
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.summary) {
      return data.summary.trim();
    }
    
    throw new Error("No summary received from AI service");
  } catch (error: any) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

/**
 * Summarize text using a basic text extraction algorithm
 * Used as fallback when the AI service is unavailable
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
