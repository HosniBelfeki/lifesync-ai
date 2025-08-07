import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export async function sendChatMessage(messages: ChatMessage[], userContext?: any): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GroqCloud API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      model: 'llama3-8b-8192', // Using a smaller model that exists in Groq's catalog
      temperature: 0.7,
      max_tokens: 300, // Reduced max tokens to limit usage
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling GroqCloud API:', error);
    
    if (error instanceof Error) {
      // Handle specific Groq SDK errors
      if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your GroqCloud API key in the .env file.');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message.includes('500')) {
        throw new Error('GroqCloud service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`GroqCloud API error: ${error.message}`);
      }
    } else {
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}

export function getSystemPrompt(userContext?: any): string {
  // Minimal system prompt to reduce token usage
  const basePrompt = `You are LifeSync AI, a personal assistant. Keep responses brief and focused.
Current date: ${new Date().toLocaleDateString()}`;

  if (userContext) {
    // Only include essential context data to reduce tokens
    const essentialContext = {
      profile: userContext.profile ? {
        full_name: userContext.profile.full_name
      } : null,
      recentTasks: (userContext.recentTasks || []).slice(0, 2).map((t: any) => ({
        title: t.title,
        completed: t.completed
      })),
      recentHealthLogs: (userContext.recentHealthLogs || []).slice(0, 2).map((h: any) => ({
        type: h.type,
        value: h.value,
        mood_score: h.mood_score
      }))
    };

    return `${basePrompt}

USER CONTEXT:
${JSON.stringify(essentialContext)}`;
  }

  return basePrompt;
}

// Only keeping the chat message function, removing all other AI functions
// that were generating personalized content outside the AI chat