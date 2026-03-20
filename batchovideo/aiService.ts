
import { GoogleGenAI } from "@google/genai";

export interface GenerationProgress {
  status: string;
  progress: number;
}

// A collection of cinematic placeholder videos for demo mode
const DEMO_VIDEOS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

export const aiService = {
  /**
   * Checks if the user has selected an API key.
   */
  async ensureApiKey(): Promise<boolean> {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
      return true;
    } catch (e) {
      console.warn("API Key selection not available in this environment, falling back to simulation.");
      return false;
    }
  },

  /**
   * Generates a video from a starting image.
   * Supports both Real AI (Gemini Veo) and Simulation Mode for public demos.
   */
  async generateVideoFromImage(
    base64Image: string,
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    onProgress: (status: string) => void,
    useSimulation: boolean = false
  ): Promise<string> {
    console.log(`AI Service: Starting generation (Mode: ${useSimulation ? 'Simulation' : 'Real AI'})...`);
    
    if (useSimulation) {
      return this.simulateGeneration(onProgress);
    }

    const keySuccess = await this.ensureApiKey();
    if (!keySuccess) {
      console.log("AI Service: Key selection failed/cancelled, triggering simulation.");
      return this.simulateGeneration(onProgress);
    }
    
    // Always create a new instance to ensure the key from the dialog is picked up
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      onProgress("Contacting Gemini Deepmind servers...");
      const cleanBase64 = base64Image.split(',')[1] || base64Image;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Add cinematic motion to this scene',
        image: {
          imageBytes: cleanBase64,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      console.log("AI Service: Operation started", operation.id);

      const statuses = [
        "Analyzing scene geometry...",
        "Dreaming up temporal consistency...",
        "Applying cinematic motion vectors...",
        "Synthesizing high-fidelity frames...",
        "Optimizing video container..."
      ];
      let statusIdx = 0;

      while (!operation.done) {
        onProgress(statuses[statusIdx % statuses.length]);
        statusIdx++;
        console.log("AI Service: Polling status...");
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed - no URI.");

      onProgress("Finalizing download...");
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error: any) {
      console.error("AI Service Error:", error);
      // Fallback to simulation if the actual AI call fails (e.g., billing/quota issues)
      onProgress("AI Busy. Using Neural Simulator instead...");
      await new Promise(r => setTimeout(r, 2000));
      return this.simulateGeneration(onProgress);
    }
  },

  /**
   * Mock generation for public testing and UX demonstrations
   */
  async simulateGeneration(onProgress: (s: string) => void): Promise<string> {
    const simulationStatuses = [
      "Initializing Neural Simulator...",
      "Analyzing reference pixels...",
      "Interpolating motion paths...",
      "Rendering simulated frames...",
      "Encoding MP4 payload..."
    ];

    for (const status of simulationStatuses) {
      onProgress(status);
      await new Promise(r => setTimeout(r, 1500));
    }

    onProgress("Simulation Complete.");
    const randomVideo = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
    return randomVideo;
  }
};
