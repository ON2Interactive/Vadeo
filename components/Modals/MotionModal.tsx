import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { AspectRatio } from '../../types';

export type MotionAnimationPreset =
  | 'fade'
  | 'crossfade'
  | 'slide-up'
  | 'slide-left'
  | 'zoom-in'
  | 'ken-burns';

interface Props {
  onClose: () => void;
  onStartMotion: (aspectRatio: AspectRatio, duration: number, animation: MotionAnimationPreset, timingPrompt: string, brief: string, headline: string, cta: string, files: File[]) => void;
  isGenerating: boolean;
  initialAspectRatio: AspectRatio;
}

const ASPECT_OPTIONS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9'];
const DURATION_OPTIONS = [5, 10, 15, 30, 45, 60] as const;
const ANIMATION_OPTIONS: Array<{ value: MotionAnimationPreset; label: string }> = [
  { value: 'fade', label: 'Fade' },
  { value: 'crossfade', label: 'Crossfade' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'ken-burns', label: 'Ken Burns' },
];
const MOTION_UPLOAD_LIMIT = 6;
const MOTION_UPLOAD_INPUT_ID = 'vadeo-motion-upload';

const inputClass =
  'w-full bg-transparent border-0 border-b border-zinc-700 rounded-none px-0 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors select-text';

const MotionModal: React.FC<Props> = ({
  onClose,
  onStartMotion,
  isGenerating,
  initialAspectRatio,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    ASPECT_OPTIONS.includes(initialAspectRatio) ? initialAspectRatio : '16:9'
  );
  const [duration, setDuration] = useState<number>(30);
  const [animation, setAnimation] = useState<MotionAnimationPreset>('crossfade');
  const [timingPrompt, setTimingPrompt] = useState('Transition each asset in 3s');
  const [brief, setBrief] = useState('');
  const [headline, setHeadline] = useState('');
  const [cta, setCta] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => () => {
    previews.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
  }, [previews]);

  const handleUpload = (fileList: FileList | null) => {
    const nextFiles = Array.from(fileList || [])
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));

    setFiles((current) => {
      const merged = [...current, ...nextFiles];
      const deduped = merged.filter((file, index, collection) => {
        return collection.findIndex((candidate) =>
          candidate.name === file.name &&
          candidate.size === file.size &&
          candidate.lastModified === file.lastModified
        ) === index;
      });

      return deduped.slice(0, MOTION_UPLOAD_LIMIT);
    });
  };

  const handleRemoveFile = (targetFile: File) => {
    setFiles((current) => current.filter((file) => file !== targetFile));
  };

  return (
    <div className="fixed inset-0 z-[165] flex items-center justify-center p-6 bg-black animate-in fade-in duration-300 select-text">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
        aria-label="Close Motion modal"
      >
        <X size={20} />
      </button>

      <div className="w-full max-w-5xl px-10 py-12 text-white">
        <div className="mb-10">
          <h2 className="text-5xl font-bold tracking-tight">Motion</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="border-b border-zinc-700 pb-4">
              <div className="flex items-center justify-end gap-3">
                <label
                  htmlFor={MOTION_UPLOAD_INPUT_ID}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition-colors hover:border-white hover:text-white"
                  title="Upload up to 6 images or videos"
                >
                  <Upload size={16} />
                </label>
                <input
                  ref={uploadInputRef}
                  id={MOTION_UPLOAD_INPUT_ID}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={isGenerating}
                  onChange={(e) => handleUpload(e.target.files)}
                  className="sr-only"
                />
              </div>

              {previews.length > 0 && (
                <div className="mt-4 flex gap-4">
                  {previews.map((preview, index) => (
                    <div key={`${preview.file.name}-${index}`} className="space-y-2">
                      <div className="relative h-[60px] w-[60px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
                        {preview.file.type.startsWith('video/') ? (
                          <video
                            src={preview.url}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img src={preview.url} alt={`Motion upload preview ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(preview.file)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white transition-colors hover:bg-black"
                          title="Remove asset"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {preview.file.type.startsWith('video/') ? `Video ${index + 1}` : `Image ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-3">
              <label className="text-xs text-zinc-500">Aspect ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                disabled={isGenerating}
                className={`${inputClass} appearance-none`}
              >
                {ASPECT_OPTIONS.map((ratio) => (
                  <option key={ratio} value={ratio} className="bg-[#121214] text-white">
                    {ratio}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-zinc-500">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isGenerating}
                className={`${inputClass} appearance-none`}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-[#121214] text-white">
                    {option}s
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-zinc-500">Animation</label>
              <select
                value={animation}
                onChange={(e) => setAnimation(e.target.value as MotionAnimationPreset)}
                disabled={isGenerating}
                className={`${inputClass} appearance-none`}
              >
                {ANIMATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#121214] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-zinc-500">Timing direction</label>
            <input
              value={timingPrompt}
              onChange={(e) => setTimingPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Transition each asset in 3s"
              className={inputClass}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs text-zinc-500">Creative brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isGenerating}
              placeholder="Describe the ad structure, pacing, and overall direction."
              className={`${inputClass} h-[88px] resize-y overflow-auto pr-6 pb-4 pointer-events-auto`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-xs text-zinc-500">Headline</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                disabled={isGenerating}
                placeholder="Create Video Ads"
                className={inputClass}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-zinc-500">CTA</label>
              <input
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                disabled={isGenerating}
                placeholder="Start Free Trial"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onStartMotion(aspectRatio, duration, animation, timingPrompt, brief, headline, cta, files)}
            disabled={isGenerating || files.length === 0}
            className="h-14 rounded-full px-6 flex items-center justify-center transition-all active:scale-[0.98] bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white text-sm font-semibold"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : 'Start Motion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotionModal;
