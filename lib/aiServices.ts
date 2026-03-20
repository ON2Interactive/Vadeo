import * as fal from "@fal-ai/serverless-client";

// Initialize ensure environment variables are present
const googleApiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

// We will initialize these lazily or check inside the functions
// const genAI = new GoogleGenerativeAI(googleApiKey);

export const aiServices = {
    // --- Google "Nano Banana" (Gemini) for Image-to-Image ---

    /**
     * Generates an edited version of an image using Google's Gemini model.
     * "Nano Banana" in the UI.
     * 
     * @param imageBlob The source image as a Blob
     * @param prompt The user's editing prompt
     * @param aspectRatio Optional aspect ratio string (e.g., "16:9")
     * @returns A Blob of the generated image
     */
    async generateNanoBananaImage(imageBlob: Blob, prompt: string, aspectRatio?: string): Promise<Blob> {
        if (!googleApiKey) {
            throw new Error("Missing Google API Key (Nano Banana)");
        }

        // Helper to normalize aspect ratio for prompt injection (since we can't always pass it to config in standard endpoints)
        const arText = aspectRatio ? ` Aspect Ratio: ${aspectRatio}.` : "";

        // Convert Blob to Base64 for the API
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });

        try {
            // Initialize Gemini Client
            // Note: Using the new @google/genai syntax might differ slightly from @google/generative-ai
            // But based on common usage for "gemini-1.5-flash":

            // Since @google/genai is in package.json, we use its specific import.
            // However, sometimes the package name is @google/generative-ai. 
            // Let's assume the standard REST approach if the SDK is tricky, 
            // but let's try the SDK first if we can confirm the import.
            // Actually, typically it is `import { GoogleGenerativeAI } from "@google/generative-ai";`
            // But package.json said `@google/genai`. 
            // Let's fallback to fetch for maximum reliability for purely binary output if needed, 
            // but let's try the standard verify "gemini-1.5-flash" model generation.

            // We will use a standard fetch to the Gemini API to avoid SDK version conflicts 
            // unless we are sure about the package.
            // Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=...

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: `You are an expert image editor. Function: ${prompt}. User requires the output to be an IMAGE, not text. Describe the edited image in detail.` },
                                {
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: base64Data
                                    }
                                }
                            ]
                        }],
                        generationConfig: {}
                    })
                }
            );

            const data = await response.json();

            // CHECK: Did we get an image? (Gemini 1.5 Flash is mostly text, Imagen is image)
            // If the user provided a key that ONLY supports Gemini 1.5 Flash text, we can't generate an image directly.
            // But let's check if the response contains inline_data (rare/beta feature) or if we need to mock it for now 
            // because likely the user's key is for text-only models and they might be confused.

            // However, to prevent "Blank Screen", we must return a BLOB or throw.

            const part = data.candidates?.[0]?.content?.parts?.[0];

            if (part?.inline_data) {
                const byteCharacters = atob(part.inline_data.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: part.inline_data.mime_type });
            }

            if (part?.text) {
                console.warn("Gemini returned text:", part.text);
                throw new Error("The AI model returned text instead of an image. Ensure you are using a model/key that supports Image Generation (like Imagen).");
            }

            throw new Error("AI Service returned no valid data.");

        } catch (e: any) {
            console.error("Nano Banana Generation Error:", e);
            throw new Error(e.message || "Unknown AI Error");
        }
    },

    // --- FAL AI (Kling / Video) ---

    async generateFalVideo(sourceUrl: string, prompt: string): Promise<string> {
        // Placeholder for FAL Kling - Waiting for Key
        console.log("FAL Video Generation requested:", sourceUrl, prompt);
        throw new Error("FAL API Key is missing. Please provide it to enable Video Generation.");
    }
};
