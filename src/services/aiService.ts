
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

    // For development purposes only - in production this should be in environment variables
    // Try with Deepseek's newer models - they might have different API requirements
    const API_KEY = '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';

    // For demonstration purposes, let's generate a fallback summary if API fails
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides concise, clear summaries of text."
            },
            {
              role: "user",
              content: `Please provide a concise summary of the following text, focusing on the key points and main ideas:\n\n${text}`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('DeepSeek API error:', errorData);
        throw new Error("API request failed");
      }
      
      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim() || 'No summary generated.';

      return summary;
    } catch (apiError) {
      console.error('DeepSeek API call failed:', apiError);
      
      // Generate a local fallback summary since the API failed
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      let fallbackSummary = "";
      
      if (sentences.length <= 3) {
        fallbackSummary = sentences.join(". ") + ".";
      } else {
        // Take first and last sentence, plus one from the middle
        const firstSentence = sentences[0];
        const middleSentence = sentences[Math.floor(sentences.length / 2)];
        const lastSentence = sentences[sentences.length - 1];
        
        fallbackSummary = `${firstSentence}. ${middleSentence}. ${lastSentence}.`;
      }
      
      toast.warning('Using local summary as DeepSeek API is unavailable.');
      return `Summary (generated locally): ${fallbackSummary}`;
    }
  } catch (error) {
    console.error('AI summarization error:', error);
    toast.error('Failed to generate summary. Please try again later.');
    return 'Unable to generate summary at this time.';
  }
}
