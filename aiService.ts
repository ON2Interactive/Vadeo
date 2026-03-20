
import { GoogleGenAI } from "@google/genai";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const VEO_MODEL = 'veo-3.1-fast-generate-preview';
export type VeoResolution = '720p' | '1080p' | '4k';
const DEFAULT_RESOLUTION: VeoResolution = '1080p';
const TEST_DURATION_SECONDS = 8;
const REF_IMAGE_DURATION_SECONDS = 8;
type AudioType = 'auto' | 'dialogue' | 'sound-effects' | 'ambient';

export interface GenerationProgress {
  status: string;
  progress: number;
}

type VeoImageInput = {
  base64: string;
  mimeType: string;
};

const buildAudioPromptInstruction = (audioEnabled: boolean, audioType: AudioType): string => {
  if (!audioEnabled) {
    return 'Do not generate audio. Return a silent video.';
  }

  if (audioType === 'dialogue') {
    return 'Generate synchronized dialogue-forward audio. Use quoted speech for any spoken lines and keep the soundtrack secondary to the voice.';
  }

  if (audioType === 'sound-effects') {
    return 'Generate synchronized sound effects as the primary audio layer. Explicitly emphasize product sounds, motion sounds, impacts, swishes, engine noises, clicks, or tactile cues as appropriate.';
  }

  if (audioType === 'ambient') {
    return 'Generate synchronized ambient audio as the primary soundtrack. Focus on environmental atmosphere, room tone, subtle background texture, and mood-setting soundscape without dominant dialogue.';
  }

  return 'Generate synchronized native audio that fits a premium commercial, balancing music, sound effects, ambient texture, and dialogue only if requested.';
};

const VADEO_CREATIVE_DIRECTION = [
  'Create a premium contemporary video advertisement with refined art direction.',
  'The result must feel like a modern luxury or high-end direct-to-consumer brand campaign, not a generic or traditional commercial.',
  'Use elevated product cinematography, tasteful styling, intentional composition, and confident visual restraint.',
  'Favor clean frames, premium materials, rich but controlled contrast, elegant set design, and sophisticated color harmony.',
  'Use smooth deliberate camera movement only when it strengthens the product presentation.',
  'Pace the video like a polished modern ad: concise, confident, stylish, and visually legible.',
  'Begin with a smooth fade in from black and end with a clean fade to black.',
  'Fill the requested frame cleanly with no black bars, no letterboxing, no pillarboxing, and no embedded borders or fake device frames unless explicitly requested.',
  'End on a strong hero frame or hero moment that clearly sells the product.',
  'Preserve subject identity, product design, packaging, silhouette, and key brand cues.',
  'Avoid cheap stock-video energy, cluttered scenes, overacting, low-end promo aesthetics, tacky marketing visuals, noisy compositions, random lifestyle cutaways, and generic traditional ad tropes.',
  'Avoid surreal drift, off-brand props, extra products, visual confusion, low-quality motion, or unrelated narrative elements unless the user explicitly requests them.'
].join(' ');

const buildCreativePrompt = (
  modeInstruction: string,
  userPrompt: string | undefined,
  audioInstruction: string
): string => {
  return [
    VADEO_CREATIVE_DIRECTION,
    modeInstruction,
    audioInstruction,
    userPrompt?.trim() ? `User direction: ${userPrompt.trim()}` : ''
  ].filter(Boolean).join(' ');
};

// A collection of cinematic placeholder videos for demo mode
const DEMO_VIDEOS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

export const aiService = {
  /**
   * Resolve a usable Google API key for local development or AI Studio.
   */
  async resolveApiKey(): Promise<string | null> {
    if (GOOGLE_API_KEY) {
      return GOOGLE_API_KEY;
    }

    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
      return (window as any).aistudio.getSelectedApiKey?.() || null;
    } catch (e) {
      console.warn("API Key selection not available in this environment, falling back to simulation.");
      return null;
    }
  },

  /**
   * Generates a video from a starting image.
   * Supports both Real AI (Gemini Veo) and Simulation Mode for public demos.
   */
  async generateVideoFromImage(
    startFrameImage: string,
    endFrameImage: string | null | undefined,
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: VeoResolution = DEFAULT_RESOLUTION,
    onProgress: (status: string) => void,
    useSimulation: boolean = false,
    audioEnabled: boolean = true,
    audioType: AudioType = 'auto'
  ): Promise<string> {
    console.log(`AI Service: Starting generation (Mode: ${useSimulation ? 'Simulation' : 'Real AI'})...`);

    if (useSimulation) {
      return this.simulateGeneration(onProgress);
    }

    const apiKey = await this.resolveApiKey();
    if (!apiKey) {
      throw new Error('No Google AI API key available for Veo generation.');
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      onProgress("Contacting Gemini Deepmind servers...");
      const parseInlineImage = (value: string) => {
        const [header, dataPart] = value.split(',');
        const mimeMatch = header?.match(/data:(.*?);base64/);
        return {
          imageBytes: dataPart || value,
          mimeType: mimeMatch?.[1] || 'image/png'
        };
      };

      const firstFrame = parseInlineImage(startFrameImage);
      const lastFrame = endFrameImage ? parseInlineImage(endFrameImage) : null;
      const enrichedPrompt = buildCreativePrompt(
        lastFrame
          ? 'Generate a premium interpolation shot between the provided first and last frames. Keep the opening frame grounded in the first image, progress naturally and elegantly through the motion, and resolve clearly into the ending frame with strong visual continuity.'
          : 'Animate the provided image into a premium ad shot. Keep the opening frame visually grounded in the uploaded image and build motion from it with polish and continuity.',
        prompt || 'Add cinematic motion to this scene.',
        buildAudioPromptInstruction(audioEnabled, audioType)
      );

      let operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: enrichedPrompt,
        image: {
          imageBytes: firstFrame.imageBytes,
          mimeType: firstFrame.mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution,
          durationSeconds: TEST_DURATION_SECONDS,
          aspectRatio: aspectRatio,
          personGeneration: 'allow_adult',
          ...(lastFrame ? {
            lastFrame: {
              imageBytes: lastFrame.imageBytes,
              mimeType: lastFrame.mimeType
            }
          } : {})
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
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error: any) {
      console.error("AI Service Error:", error);
      const message = error?.message || 'Veo image-to-video generation failed.';
      throw new Error(message);
    }
  },

  async generateVideoFromPrompt(
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: VeoResolution = DEFAULT_RESOLUTION,
    onProgress: (status: string) => void,
    useSimulation: boolean = false,
    audioEnabled: boolean = true,
    audioType: AudioType = 'auto'
  ): Promise<string> {
    if (useSimulation) {
      return this.simulateGeneration(onProgress);
    }

    const apiKey = await this.resolveApiKey();
    if (!apiKey) {
      throw new Error('No Google AI API key available for Veo generation.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const adPrompt = buildCreativePrompt(
      'Generate a short premium product ad from text alone. Build a coherent contemporary campaign-style shot sequence with elevated motion and a clear closing hero moment.',
      prompt?.trim() || 'Create a polished short ad.',
      buildAudioPromptInstruction(audioEnabled, audioType)
    );

    try {
      onProgress('Contacting Veo 3.1...');
      let operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: adPrompt,
        config: {
          numberOfVideos: 1,
          resolution,
          durationSeconds: TEST_DURATION_SECONDS,
          aspectRatio,
          personGeneration: 'allow_all'
        }
      });

      const statuses = [
        'Building shot plan...',
        'Generating ad motion...',
        'Refining timing and continuity...',
        'Finalizing video...'
      ];

      let statusIndex = 0;
      while (!operation.done) {
        onProgress(statuses[statusIndex % statuses.length]);
        statusIndex += 1;
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error('No video URI returned from Veo.');
      }

      onProgress('Downloading generated video...');
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Text-to-video generation failed:', error);
      const message = error instanceof Error ? error.message : 'Veo text-to-video generation failed.';
      throw new Error(message);
    }
  },

  /**
   * Generates a short ad clip from up to three user images.
   * First image is used as the starting frame, remaining images become Veo reference images.
   */
  async generateVideoAdFromImages(
    images: VeoImageInput[],
    userPrompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: VeoResolution = DEFAULT_RESOLUTION,
    onProgress: (status: string) => void,
    useSimulation: boolean = false,
    audioEnabled: boolean = true,
    audioType: AudioType = 'auto'
  ): Promise<string> {
    if (images.length === 0) {
      throw new Error('At least one image is required to generate an ad.');
    }

    if (useSimulation) {
      return this.simulateGeneration(onProgress);
    }

    const apiKey = await this.resolveApiKey();
    if (!apiKey) {
      throw new Error('No Google AI API key available for Veo generation.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const referenceImages = images.slice(0, 3).map((image) => ({
      image: {
        imageBytes: image.base64,
        mimeType: image.mimeType
      },
      referenceType: 'asset' as const
    }));

    const adPrompt = buildCreativePrompt(
      'Treat the uploaded images as authoritative references for the product, styling, and brand world. Preserve their details while turning them into a premium contemporary ad with photorealistic continuity, elegant motion, and a decisive final packshot or hero shot.',
      userPrompt?.trim() || 'Create a concise premium hero ad clip.',
      buildAudioPromptInstruction(audioEnabled, audioType)
    );

    try {
      onProgress('Preparing ad references...');
      let operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: adPrompt,
        config: {
          aspectRatio,
          numberOfVideos: 1,
          resolution,
          durationSeconds: REF_IMAGE_DURATION_SECONDS,
          personGeneration: 'allow_adult',
          referenceImages
        }
      });

      const statuses = [
        'Building ad concept...',
        'Locking product continuity...',
        'Generating hero motion...',
        'Refining lighting and pacing...',
        'Finalizing ad clip...'
      ];

      let statusIndex = 0;
      while (!operation.done) {
        onProgress(statuses[statusIndex % statuses.length]);
        statusIndex += 1;
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error('Veo did not return a generated video URI.');
      }

      onProgress('Downloading generated ad...');
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Veo ad generation failed:', error);
      const message = error instanceof Error ? error.message : 'Veo ad generation failed.';
      throw new Error(message);
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
      "Encoding Video payload..."
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
