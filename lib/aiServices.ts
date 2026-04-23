import { aiService } from '../aiService';

export const aiServices = {
  generateNanoBananaImage(imageBlob: Blob, prompt: string, aspectRatio?: string): Promise<Blob> {
    return aiService.generateNanoBananaImage(imageBlob, prompt, aspectRatio);
  },

  async generateFalVideo(sourceUrl: string, prompt: string): Promise<string> {
    console.log('FAL Video Generation requested:', sourceUrl, prompt);
    throw new Error('FAL API Key is missing. Please provide it to enable Video Generation.');
  }
};
