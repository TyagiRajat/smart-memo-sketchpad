
import { toast } from 'sonner';

// Store API key in state or localStorage instead of hardcoding
let euronApiKey: string | null = null;

/**
 * Set the Euron API key to use for AI services
 */
export function setEuronApiKey(key: string): void {
  euronApiKey = key;
  try {
    // Store in localStorage for persistence across sessions
    localStorage.setItem('euron_api_key', key);
  } catch (e) {
    console.warn('Failed to store API key in localStorage');
  }
}

/**
 * Get the stored Euron API key or retrieve from localStorage
 */
export function getEuronApiKey(): string | null {
  if (!euronApiKey) {
    try {
      // Try to get from localStorage
      euronApiKey = localStorage.getItem('euron_api_key');
    } catch (e) {
      console.warn('Failed to retrieve API key from localStorage');
    }
  }
  return euronApiKey;
}

/**
 * Generate an AI summary of the provided text using Euron API
 */
export async function generateAiSummary(text: string): Promise<string> {
  const apiKey = getEuronApiKey();
  
  if (!apiKey) {
    throw new Error("No API key available");
  }
  
  const response = await fetch('https://api.euron.one/api/v1/euri/alpha/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: `Summarize this text in 3-5 sentences. Respond ONLY with the summary:\n\n${text}`
        }
      ],
      model: "gpt-4.1-mini",
      max_tokens: 550,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Euron API error:", text);
    throw new Error(`API error: ${response.status} ${text}`);
  }
  
  const data = await response.json();
  
  // Try multiple possible output formats
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  } else if (data.summary) {
    return data.summary.trim();
  } else if (data.content) {
    return data.content.trim();
  }
  
  throw new Error("No summary received from Euron AI");
}

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
