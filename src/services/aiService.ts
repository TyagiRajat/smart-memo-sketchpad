import { toast } from 'sonner';

export async function summarizeText(text: string): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    if (!text || text.length < 10) {
      throw new Error('Text is too short to summarize');
    }
    
    // Instead of using generic templates, actually analyze the text content
    // Extract key sentences and words from the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.split(/\s+/).filter(w => w.length > 4);
    
    // Get important words (longer words or those that appear multiple times)
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleaned.length > 4) {
        wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
      }
    });
    
    // Sort words by frequency
    const importantWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
    
    // Extract key sentences (first, last, and those containing important words)
    let keySentences = [];
    if (sentences.length > 0) keySentences.push(sentences[0]);
    if (sentences.length > 3) keySentences.push(sentences[Math.floor(sentences.length / 2)]);
    if (sentences.length > 1) keySentences.push(sentences[sentences.length - 1]);
    
    // If we have few sentences, add any containing important words
    if (keySentences.length < 3 && sentences.length > 0) {
      for (const word of importantWords) {
        const relevantSentence = sentences.find(s => 
          !keySentences.includes(s) && s.toLowerCase().includes(word)
        );
        if (relevantSentence) {
          keySentences.push(relevantSentence);
          if (keySentences.length >= 3) break;
        }
      }
    }
    
    // Remove duplicates and limit length
    keySentences = [...new Set(keySentences)].slice(0, 3);
    
    // Build summary from key sentences and words
    let summary = '';
    
    // Add introductory sentence based on content length
    if (text.length > 1000) {
      summary += "This comprehensive summary covers the key points from a detailed document. ";
    } else if (text.length > 500) {
      summary += "This summary highlights the main ideas from your note. ";
    } else {
      summary += "This brief summary captures the essence of your note. ";
    }
    
    // Add key sentences if available
    if (keySentences.length > 0) {
      summary += keySentences.join(' ') + ' ';
    }
    
    // Add important keywords section
    if (importantWords.length > 0) {
      summary += `Key topics include: ${importantWords.join(', ')}.`;
    }
    
    return summary.trim();
  } catch (error) {
    console.error('AI summarization error:', error);
    toast.error('Failed to generate summary. Please try again later.');
    return 'Unable to generate summary at this time.';
  }
}

// In a real implementation, this would use the actual DeepSeek API
// Example of how the real implementation might look:

/*
export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        text: text,
        max_length: 200
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('AI summarization error:', error);
    toast.error('Failed to generate summary. Please try again later.');
    return 'Unable to generate summary at this time.';
  }
}
*/
