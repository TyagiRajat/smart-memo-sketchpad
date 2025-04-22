
import { toast } from 'sonner';

// This is a simulated AI service
// In a real app, this would connect to an AI API like DeepSeek

// Sample summaries for testing
const sampleSummaries: Record<string, string> = {
  'short': 'This is a brief summary of a short document.',
  'medium': 'This summary covers the main points of your document including key concepts and important details.',
  'long': 'This comprehensive summary provides an overview of the entire document, including major themes, key arguments, supporting evidence, and important conclusions drawn by the author.',
};

export async function summarizeText(text: string): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // Simulate different summaries based on text length
    if (!text || text.length < 10) {
      throw new Error('Text is too short to summarize');
    }
    
    // Choose summary based on text length
    let summary;
    if (text.length < 100) {
      summary = sampleSummaries.short;
    } else if (text.length < 500) {
      summary = sampleSummaries.medium;
    } else {
      summary = sampleSummaries.long;
    }
    
    // Add some randomization to make it seem more real
    const randomStart = [
      'This document discusses ',
      'The text focuses on ',
      'The content explores ',
      'The note covers ',
      'This writing examines ',
    ];
    
    const randomWords = text.split(' ')
      .filter(word => word.length > 4)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .join(', ');
    
    const start = randomStart[Math.floor(Math.random() * randomStart.length)];
    
    return `${summary} ${start}topics including ${randomWords}.`;
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
