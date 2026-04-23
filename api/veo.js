import { GoogleGenAI } from '@google/genai';

const VEO_MODEL = 'veo-3.1-fast-generate-preview';
const IMAGE_EDIT_MODEL = 'gemini-1.5-flash';

const parseBody = (req) => {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
};

const getAction = (req, body) => {
  if (typeof req.query?.action === 'string' && req.query.action) return req.query.action;
  if (typeof body?.action === 'string' && body.action) return body.action;
  return '';
};

const getApiKey = () => String(
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  ''
).trim();

const getAiClient = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Missing server-side Google AI API key.');
  }

  return new GoogleGenAI({ apiKey });
};

const buildAudioPromptInstruction = (audioEnabled, audioType) => {
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

const buildCreativePrompt = (modeInstruction, userPrompt, audioInstruction) => (
  [
    VADEO_CREATIVE_DIRECTION,
    modeInstruction,
    audioInstruction,
    userPrompt?.trim() ? `User direction: ${userPrompt.trim()}` : ''
  ].filter(Boolean).join(' ')
);

const parseInlineImage = (value) => {
  const [header, dataPart] = String(value || '').split(',');
  const mimeMatch = header?.match(/data:(.*?);base64/);
  return {
    imageBytes: dataPart || value,
    mimeType: mimeMatch?.[1] || 'image/png',
  };
};

const isAllowedDownloadUri = (uri) => {
  try {
    const parsed = new URL(uri);
    return parsed.protocol === 'https:' && (
      parsed.hostname.endsWith('.googleapis.com') ||
      parsed.hostname.endsWith('.googleusercontent.com')
    );
  } catch {
    return false;
  }
};

const sendJson = (res, status, payload) => {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default async function handler(req, res) {
  if (!['POST', 'GET'].includes(req.method || '')) {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  const body = req.method === 'POST' ? parseBody(req) : {};
  const action = getAction(req, body);

  try {
    const apiKey = getApiKey();
    const ai = getAiClient();

    if (req.method === 'POST' && action === 'generate-image-to-video') {
      const {
        startFrameImage,
        endFrameImage,
        prompt,
        aspectRatio = '16:9',
        resolution = '1080p',
        audioEnabled = true,
        audioType = 'auto',
      } = body;

      if (!startFrameImage) {
        sendJson(res, 400, { error: 'Missing starting frame image.' });
        return;
      }

      const firstFrame = parseInlineImage(startFrameImage);
      const lastFrame = endFrameImage ? parseInlineImage(endFrameImage) : null;
      const enrichedPrompt = buildCreativePrompt(
        lastFrame
          ? 'Generate a premium interpolation shot between the provided first and last frames. Keep the opening frame grounded in the first image, progress naturally and elegantly through the motion, and resolve clearly into the ending frame with strong visual continuity.'
          : 'Animate the provided image into a premium ad shot. Keep the opening frame visually grounded in the uploaded image and build motion from it with polish and continuity.',
        prompt || 'Add cinematic motion to this scene.',
        buildAudioPromptInstruction(audioEnabled, audioType)
      );

      const operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: enrichedPrompt,
        image: {
          imageBytes: firstFrame.imageBytes,
          mimeType: firstFrame.mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution,
          durationSeconds: 8,
          aspectRatio,
          personGeneration: 'allow_adult',
          ...(lastFrame ? {
            lastFrame: {
              imageBytes: lastFrame.imageBytes,
              mimeType: lastFrame.mimeType,
            },
          } : {}),
        },
      });

      sendJson(res, 200, { operation });
      return;
    }

    if (req.method === 'POST' && action === 'generate-prompt-to-video') {
      const {
        prompt,
        aspectRatio = '16:9',
        resolution = '1080p',
        audioEnabled = true,
        audioType = 'auto',
      } = body;

      const adPrompt = buildCreativePrompt(
        'Generate a short premium product ad from text alone. Build a coherent contemporary campaign-style shot sequence with elevated motion and a clear closing hero moment.',
        prompt?.trim() || 'Create a polished short ad.',
        buildAudioPromptInstruction(audioEnabled, audioType)
      );

      const operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: adPrompt,
        config: {
          numberOfVideos: 1,
          resolution,
          durationSeconds: 8,
          aspectRatio,
          personGeneration: 'allow_all',
        },
      });

      sendJson(res, 200, { operation });
      return;
    }

    if (req.method === 'POST' && action === 'generate-ad-from-images') {
      const {
        images,
        prompt,
        aspectRatio = '16:9',
        resolution = '1080p',
        audioEnabled = true,
        audioType = 'auto',
      } = body;

      if (!Array.isArray(images) || images.length === 0) {
        sendJson(res, 400, { error: 'At least one reference image is required.' });
        return;
      }

      const referenceImages = images.slice(0, 3).map((image) => ({
        image: {
          imageBytes: image.base64,
          mimeType: image.mimeType || 'image/png',
        },
        referenceType: 'asset',
      }));

      const adPrompt = buildCreativePrompt(
        'Treat the uploaded images as authoritative references for the product, styling, and brand world. Preserve their details while turning them into a premium contemporary ad with photorealistic continuity, elegant motion, and a decisive final packshot or hero shot.',
        prompt?.trim() || 'Create a concise premium hero ad clip.',
        buildAudioPromptInstruction(audioEnabled, audioType)
      );

      const operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt: adPrompt,
        config: {
          aspectRatio,
          numberOfVideos: 1,
          resolution,
          durationSeconds: 8,
          personGeneration: 'allow_adult',
          referenceImages,
        },
      });

      sendJson(res, 200, { operation });
      return;
    }

    if (req.method === 'POST' && action === 'poll-video-operation') {
      const operation = body?.operation;
      if (!operation) {
        sendJson(res, 400, { error: 'Missing operation payload.' });
        return;
      }

      const nextOperation = await ai.operations.getVideosOperation({ operation });
      sendJson(res, 200, { operation: nextOperation });
      return;
    }

    if (req.method === 'POST' && action === 'download-video') {
      const uri = String(body?.uri || '');
      if (!uri || !isAllowedDownloadUri(uri)) {
        sendJson(res, 400, { error: 'Invalid video download URL.' });
        return;
      }

      const response = await fetch(uri, {
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Video download failed with status ${response.status}.`);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.statusCode = 200;
      res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
      res.setHeader('Cache-Control', 'no-store');
      res.end(Buffer.from(arrayBuffer));
      return;
    }

    if (req.method === 'POST' && action === 'edit-image') {
      const { imageBase64, mimeType = 'image/jpeg', prompt, aspectRatio } = body;
      if (!imageBase64) {
        sendJson(res, 400, { error: 'Missing source image.' });
        return;
      }

      const arText = aspectRatio ? ` Aspect Ratio: ${aspectRatio}.` : '';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_EDIT_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `You are an expert image editor. Function: ${prompt}.${arText} User requires the output to be an IMAGE, not text. Describe the edited image in detail.`
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            }],
            generationConfig: {},
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Image edit request failed.');
      }

      const part = data?.candidates?.[0]?.content?.parts?.[0];
      if (!part?.inline_data) {
        throw new Error(part?.text || 'The AI model returned no image data.');
      }

      sendJson(res, 200, {
        mimeType: part.inline_data.mime_type,
        data: part.inline_data.data,
      });
      return;
    }

    sendJson(res, 400, { error: 'Unknown action.' });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Veo request failed.' });
  }
}
