const VEO_API_ENDPOINT = '/api/veo';

export type VeoResolution = '720p' | '1080p' | '4k';

type AudioType = 'auto' | 'dialogue' | 'sound-effects' | 'ambient';
type VeoOperation = Record<string, any>;
type VeoImageInput = {
  base64: string;
  mimeType: string;
};

export interface GenerationProgress {
  status: string;
  progress: number;
}

const TEST_DURATION_SECONDS = 8;
const REF_IMAGE_DURATION_SECONDS = 8;

const DEMO_VIDEOS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

const parseInlineImage = (value: string) => {
  const [header, dataPart] = value.split(',');
  const mimeMatch = header?.match(/data:(.*?);base64/);
  return {
    base64: dataPart || value,
    mimeType: mimeMatch?.[1] || 'image/png'
  };
};

const postJson = async <T>(action: string, payload: Record<string, any>): Promise<T> => {
  const response = await fetch(`${VEO_API_ENDPOINT}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const data = await response.json();
      if (typeof data?.error === 'string') {
        message = data.error;
      }
    } catch {
      // Keep the fallback message if the response body is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

const pollUntilComplete = async (
  operation: VeoOperation,
  statuses: string[],
  onProgress: (status: string) => void,
  intervalMs: number
) => {
  let nextOperation = operation;
  let statusIndex = 0;

  while (!nextOperation?.done) {
    onProgress(statuses[statusIndex % statuses.length]);
    statusIndex += 1;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const result = await postJson<{ operation: VeoOperation }>('poll-video-operation', { operation: nextOperation });
    nextOperation = result.operation;
  }

  return nextOperation;
};

const downloadGeneratedVideo = async (uri: string) => {
  const response = await fetch(`${VEO_API_ENDPOINT}?action=download-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uri })
  });

  if (!response.ok) {
    let message = `Video download failed with status ${response.status}.`;
    try {
      const data = await response.json();
      if (typeof data?.error === 'string') {
        message = data.error;
      }
    } catch {
      // Ignore body parse errors here and keep the fallback message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const aiService = {
  async generateVideoFromImage(
    startFrameImage: string,
    endFrameImage: string | null | undefined,
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: VeoResolution = '1080p',
    onProgress: (status: string) => void,
    useSimulation: boolean = false,
    audioEnabled: boolean = true,
    audioType: AudioType = 'auto'
  ): Promise<string> {
    if (useSimulation) {
      return this.simulateGeneration(onProgress);
    }

    onProgress('Contacting Veo...');
    const { operation } = await postJson<{ operation: VeoOperation }>('generate-image-to-video', {
      startFrameImage,
      endFrameImage,
      prompt,
      aspectRatio,
      resolution,
      audioEnabled,
      audioType
    });

    const completedOperation = await pollUntilComplete(
      operation,
      [
        'Analyzing scene geometry...',
        'Dreaming up temporal consistency...',
        'Applying cinematic motion vectors...',
        'Synthesizing high-fidelity frames...',
        'Optimizing video container...'
      ],
      onProgress,
      8000
    );

    const downloadLink = completedOperation?.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('Video generation failed - no URI.');
    }

    onProgress('Finalizing download...');
    return downloadGeneratedVideo(downloadLink);
  },

  async generateVideoFromPrompt(
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: VeoResolution = '1080p',
    onProgress: (status: string) => void,
    useSimulation: boolean = false,
    audioEnabled: boolean = true,
    audioType: AudioType = 'auto'
  ): Promise<string> {
    if (useSimulation) {
      return this.simulateGeneration(onProgress);
    }

    onProgress('Contacting Veo 3.1...');
    const { operation } = await postJson<{ operation: VeoOperation }>('generate-prompt-to-video', {
      prompt,
      aspectRatio,
      resolution,
      audioEnabled,
      audioType
    });

    const completedOperation = await pollUntilComplete(
      operation,
      [
        'Building shot plan...',
        'Generating ad motion...',
        'Refining timing and continuity...',
        'Finalizing video...'
      ],
      onProgress,
      10000
    );

    const downloadLink = completedOperation?.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('No video URI returned from Veo.');
    }

    onProgress('Downloading generated video...');
    return downloadGeneratedVideo(downloadLink);
  },

  async generateVideoAdFromImages(
    images: VeoImageInput[],
    userPrompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    resolution: VeoResolution = '1080p',
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

    onProgress('Preparing ad references...');
    const { operation } = await postJson<{ operation: VeoOperation }>('generate-ad-from-images', {
      images,
      prompt: userPrompt,
      aspectRatio,
      resolution,
      audioEnabled,
      audioType
    });

    const completedOperation = await pollUntilComplete(
      operation,
      [
        'Building ad concept...',
        'Locking product continuity...',
        'Generating hero motion...',
        'Refining lighting and pacing...',
        'Finalizing ad clip...'
      ],
      onProgress,
      10000
    );

    const downloadLink = completedOperation?.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('Veo did not return a generated video URI.');
    }

    onProgress('Downloading generated ad...');
    return downloadGeneratedVideo(downloadLink);
  },

  async generateNanoBananaImage(
    imageBlob: Blob,
    prompt: string,
    aspectRatio?: string
  ): Promise<Blob> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Failed to read source image.'));
          return;
        }
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error('Failed to read source image.'));
      reader.readAsDataURL(imageBlob);
    });

    const image = parseInlineImage(dataUrl);
    const response = await postJson<{ mimeType: string; data: string }>('edit-image', {
      imageBase64: image.base64,
      mimeType: image.mimeType,
      prompt,
      aspectRatio
    });

    const byteCharacters = atob(response.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: response.mimeType });
  },

  async simulateGeneration(onProgress: (s: string) => void): Promise<string> {
    const simulationStatuses = [
      'Initializing Neural Simulator...',
      'Analyzing reference pixels...',
      'Interpolating motion paths...',
      'Rendering simulated frames...',
      'Encoding Video payload...'
    ];

    for (const status of simulationStatuses) {
      onProgress(status);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    onProgress('Simulation Complete.');
    const randomVideo = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
    return randomVideo;
  }
};
