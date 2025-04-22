
import { toast } from 'sonner';

/**
 * Summarize text using the DeepSeek Open API.
 * Your DeepSeek API key must be available at process.env.DEEPSEEK_API_KEY from Supabase or another secure method.
 */
export async function summarizeText(text: string): Promise<string> {
  // Simulate API call loading
  await new Promise(resolve => setTimeout(resolve, 300));
  try {
    if (!text || text.length < 10) {
      throw new Error("Text is too short to summarize");
    }

    // Retrieve API key from env
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
      toast.error('DeepSeek API key is not set up.');
      return 'Unable to generate summary (no API key configured).';
    }

    // Make request to DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        text: text,
        max_length: 200
      })
    });

    if (!response.ok) {
      toast.error('Failed to generate summary from DeepSeek.');
      return 'Unable to generate summary (API error).';
    }
    
    const data = await response.json();
    if (!data.summary) {
      toast.error('No summary received from DeepSeek.');
      return 'No summary returned.';
    }

    return data.summary.trim();
  } catch (error) {
    console.error('AI summarization error:', error);
    toast.error('Failed to generate summary. Please try again later.');
    return 'Unable to generate summary at this time.';
  }
}
