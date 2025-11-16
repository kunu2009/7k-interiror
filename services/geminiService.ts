import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ShoppingItem } from '../types';

let aiInstance: GoogleGenAI | null = null;

// Lazily initialize the AI client to avoid crashing the app on startup
// if the API key is not configured.
const getAiClient = (): GoogleGenAI => {
    if (aiInstance) {
        return aiInstance;
    }

    // Check for process and env to avoid runtime errors in environments
    // where they might not be defined. This fixes the "black screen" issue on Vercel.
    if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
        throw new Error("API_KEY is not configured. Please set the API_KEY environment variable in your Vercel deployment settings.");
    }
    
    const apiKey = process.env.API_KEY;
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(",")[1],
      mimeType,
    },
  };
};

export const generateImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAiClient();
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imageResponsePart?.inlineData) {
            return `data:${imageResponsePart.inlineData.mimeType};base64,${imageResponsePart.inlineData.data}`;
        } else {
            throw new Error("No image was generated. The model may have refused the prompt.");
        }

    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            // Re-throw the original error from getAiClient or the API call
            throw error;
        }
        throw new Error("Failed to generate image due to an unknown error.");
    }
};

export const generateInspirationImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `An inspiring, high-quality photograph of an interior design scene: ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
             throw new Error("No image was generated. The model may have refused the prompt.");
        }

    } catch(error) {
        console.error("Error generating inspiration image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate inspiration image.");
    }
};


export const getShoppingSuggestions = async (prompt: string): Promise<ShoppingItem[]> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following request, suggest 3 fictional but realistic-looking products with a name, a short description, and a fake URL for an online store. Request: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: "The name of the product.",
                            },
                            description: {
                                type: Type.STRING,
                                description: "A brief, compelling description of the product.",
                            },
                            url: {
                                type: Type.STRING,
                                description: "A fictional but realistic-looking URL to a product page.",
                            },
                        },
                        required: ["name", "description", "url"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error getting shopping suggestions:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get shopping suggestions.");
    }
};

export const classifyChatIntent = async (prompt: string): Promise<'visual' | 'shopping' | 'general'> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Classify the user's intent. Is it a 'visual' request to change the image, a 'shopping' request for product ideas, or a 'general' question? Respond with only one word. User prompt: "${prompt}"`
    });
    const intent = response.text.trim().toLowerCase();
    if (intent.includes('visual')) return 'visual';
    if (intent.includes('shopping')) return 'shopping';
    return 'general';
  } catch (error) {
    console.error("Error classifying intent:", error);
    return 'general'; // Default to general on error
  }
}

export const getGeneralChatResponse = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
        const response = await chat.sendMessage({ message: prompt });
        return response.text;
    } catch(error) {
        console.error("Error getting general chat response:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get chat response.");
    }
};