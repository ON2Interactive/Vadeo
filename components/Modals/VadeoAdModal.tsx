import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, SendHorizontal, Upload, Video, X } from 'lucide-react';
import { AspectRatio } from '../../types';

type GenerationTab = 'generate' | 'frame-video' | 'ref-video' | 'creator';
type AudioType = 'auto' | 'dialogue' | 'sound-effects' | 'ambient';

interface Props {
  onClose: () => void;
  onGenerateText: (prompt: string, aspectRatio: AspectRatio, audioEnabled: boolean, audioType: AudioType, imageFile?: File | null) => void;
  onGenerateFrameVideo: (startFile: File, endFile: File, prompt: string, aspectRatio: AspectRatio, audioEnabled: boolean, audioType: AudioType) => void;
  onGenerateRefVideo: (files: File[], prompt: string, aspectRatio: AspectRatio, audioEnabled: boolean, audioType: AudioType) => void;
  onStartCreator: (aspectRatio: AspectRatio, duration: number, websiteUrl: string, brief: string, headline: string, cta: string, files: File[]) => void;
  isGenerating: boolean;
  initialAspectRatio: AspectRatio;
}

const ASPECT_OPTIONS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9'];
const CREATOR_DURATION_OPTIONS = [5, 10, 15, 30, 45, 60] as const;
const AUDIO_TYPE_OPTIONS: Array<{ value: AudioType; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'dialogue', label: 'Dialogue' },
  { value: 'sound-effects', label: 'Sound effects' },
  { value: 'ambient', label: 'Ambient' }
];
const REF_IMAGE_LIMIT = 3;
const GENERATE_UPLOAD_INPUT_ID = 'vadeo-generate-upload';
const FRAME_START_UPLOAD_INPUT_ID = 'vadeo-frame-start-upload';
const CREATOR_UPLOAD_INPUT_ID = 'vadeo-creator-upload';
const REF_UPLOAD_INPUT_IDS = [
  'vadeo-ref-upload-1',
  'vadeo-ref-upload-2',
  'vadeo-ref-upload-3'
] as const;

const VadeoAdModal: React.FC<Props> = ({
  onClose,
  onGenerateText,
  onGenerateFrameVideo,
  onGenerateRefVideo,
  onStartCreator,
  isGenerating,
  initialAspectRatio
}) => {
  const [activeTab, setActiveTab] = useState<GenerationTab>('generate');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    ASPECT_OPTIONS.includes(initialAspectRatio) ? initialAspectRatio : '16:9'
  );
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [framePrompt, setFramePrompt] = useState('');
  const [refPrompt, setRefPrompt] = useState('');
  const [creatorWebsiteUrl, setCreatorWebsiteUrl] = useState('');
  const [creatorDuration, setCreatorDuration] = useState<number>(15);
  const [creatorBrief, setCreatorBrief] = useState('');
  const [creatorHeadline, setCreatorHeadline] = useState('');
  const [creatorCta, setCreatorCta] = useState('');
  const [creatorFiles, setCreatorFiles] = useState<File[]>([]);
  const [generateAudioEnabled, setGenerateAudioEnabled] = useState(true);
  const [frameAudioEnabled, setFrameAudioEnabled] = useState(true);
  const [refAudioEnabled, setRefAudioEnabled] = useState(true);
  const [generateAudioType, setGenerateAudioType] = useState<AudioType>('auto');
  const [frameAudioType, setFrameAudioType] = useState<AudioType>('auto');
  const [refAudioType, setRefAudioType] = useState<AudioType>('auto');
  const [generateImageFile, setGenerateImageFile] = useState<File | null>(null);
  const [frameStartFile, setFrameStartFile] = useState<File | null>(null);
  const [frameEndFile, setFrameEndFile] = useState<File | null>(null);
  const [refFiles, setRefFiles] = useState<Array<File | null>>([null, null, null]);
  const generateInputRef = useRef<HTMLInputElement | null>(null);
  const frameUploadInputRef = useRef<HTMLInputElement | null>(null);
  const refUploadInputRef = useRef<HTMLInputElement | null>(null);
  const creatorUploadInputRef = useRef<HTMLInputElement | null>(null);

  const generatePreview = useMemo(
    () => (generateImageFile ? URL.createObjectURL(generateImageFile) : null),
    [generateImageFile]
  );

  const frameStartPreview = useMemo(
    () => (frameStartFile ? URL.createObjectURL(frameStartFile) : null),
    [frameStartFile]
  );

  const frameEndPreview = useMemo(
    () => (frameEndFile ? URL.createObjectURL(frameEndFile) : null),
    [frameEndFile]
  );

  const refPreviews = useMemo(
    () => refFiles.map((file) => (file ? { file, url: URL.createObjectURL(file) } : null)),
    [refFiles]
  );

  const creatorPreviews = useMemo(
    () => creatorFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [creatorFiles]
  );

  useEffect(() => () => {
    if (generatePreview) URL.revokeObjectURL(generatePreview);
  }, [generatePreview]);

  useEffect(() => () => {
    if (frameStartPreview) URL.revokeObjectURL(frameStartPreview);
  }, [frameStartPreview]);

  useEffect(() => () => {
    if (frameEndPreview) URL.revokeObjectURL(frameEndPreview);
  }, [frameEndPreview]);

  useEffect(() => () => {
    refPreviews.forEach((preview) => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    });
  }, [refPreviews]);

  useEffect(() => () => {
    creatorPreviews.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
  }, [creatorPreviews]);

  const tabButtonClass = (tab: GenerationTab) =>
    `pb-3 text-sm transition-colors border-b ${activeTab === tab
      ? 'text-white border-white'
      : 'text-zinc-500 border-transparent hover:text-zinc-300'
    }`;

  const inputClass =
    'w-full bg-transparent border-0 border-b border-zinc-700 rounded-none px-0 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors select-text';

  const renderAudioToggle = (checked: boolean, onChange: (checked: boolean) => void) => (
    <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
      <label className="text-xs text-zinc-500">Audio</label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isGenerating}
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 items-center rounded-full border px-[2px] transition-colors ${checked ? 'justify-end bg-blue-500 border-blue-500' : 'justify-start bg-zinc-900 border-zinc-700'} disabled:opacity-50`}
      >
        <span
          className={`h-4 w-4 rounded-full ${checked ? 'bg-white' : 'bg-zinc-300'}`}
        />
      </button>
    </div>
  );

  const renderAudioTypeSelect = (
    value: AudioType,
    onChange: (value: AudioType) => void,
    disabled: boolean
  ) => (
    <div className="space-y-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AudioType)}
        disabled={disabled}
        className={`${inputClass} appearance-none disabled:opacity-40`}
      >
        {AUDIO_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#121214] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const sendButton = (disabled: boolean) => (
    <button
      onClick={handleSubmit}
      disabled={disabled}
      className="h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-[0.98] bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white"
    >
      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
    </button>
  );

  const handleRefFileChange = (index: number, fileList: FileList | null) => {
    const nextFile = Array.from(fileList || []).find((file) => file.type.startsWith('image/')) || null;
    setRefFiles((prev) => {
      const next = [...prev];
      next[index] = nextFile;
      return next.slice(0, REF_IMAGE_LIMIT);
    });
  };

  const handleFrameUpload = (fileList: FileList | null) => {
    const nextFiles = Array.from(fileList || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 2);

    if (nextFiles.length === 0) return;

    setFrameStartFile(nextFiles[0] || null);
    setFrameEndFile(nextFiles[1] || null);
  };

  const handleRefUpload = (fileList: FileList | null) => {
    const nextFiles = Array.from(fileList || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, REF_IMAGE_LIMIT);

    setRefFiles([
      nextFiles[0] || null,
      nextFiles[1] || null,
      nextFiles[2] || null
    ]);
  };

  const handleCreatorUpload = (fileList: FileList | null) => {
    const nextFiles = Array.from(fileList || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, REF_IMAGE_LIMIT);

    setCreatorFiles(nextFiles);
  };

  const renderGenerateTab = () => (
    <div className="flex flex-col">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="border-b border-zinc-700 pb-4">
            <div className="flex items-center justify-end gap-3">
              <label
                htmlFor={GENERATE_UPLOAD_INPUT_ID}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition-colors hover:border-white hover:text-white"
                title="Upload optional reference image"
              >
                <Upload size={16} />
              </label>
              <input
                ref={generateInputRef}
                id={GENERATE_UPLOAD_INPUT_ID}
                type="file"
                accept="image/*"
                disabled={isGenerating}
                onChange={(e) => setGenerateImageFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
            </div>

            {generatePreview && (
              <div className="mt-4 flex gap-4">
                <div className="space-y-2">
                  <button
                    type="button"
                    onDoubleClick={() => generateInputRef.current?.click()}
                    className="h-[60px] w-[60px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
                    title="Double-click to replace image"
                  >
                    <img src={generatePreview} alt="Generate input preview" className="w-full h-full object-cover" />
                  </button>
                  <p className="text-[11px] text-zinc-400">Image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              value={creatorDuration}
              onChange={(e) => setCreatorDuration(Number(e.target.value))}
              disabled={isGenerating}
              className={`${inputClass} appearance-none`}
            >
              {CREATOR_DURATION_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-[#121214] text-white">
                  {option}s
                </option>
              ))}
            </select>
          </div>
        </div>

        {renderAudioToggle(generateAudioEnabled, setGenerateAudioEnabled)}
        {renderAudioTypeSelect(generateAudioType, setGenerateAudioType, isGenerating || !generateAudioEnabled)}

        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus={activeTab === 'generate'}
              disabled={isGenerating}
              placeholder='Example: Sleek skincare bottle on a glossy black pedestal, slow cinematic push-in, premium lighting, soft ambient synth bed.'
              className={`${inputClass} h-[60px] resize-y overflow-auto pr-6 pb-4 pointer-events-auto`}
            />
            <div className="pointer-events-none absolute bottom-3 right-1 flex flex-col gap-[2px] opacity-95">
              <span className="h-[2px] w-2 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-3 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-4 rotate-[-45deg] bg-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end bg-black pt-3 pb-1">
        {sendButton(isGenerating)}
      </div>
    </div>
  );

  const renderFrameVideoTab = () => (
    <div className="flex flex-col">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Upload two images. The first frame starts the shot, the second frame ends it.</p>
          <div className="border-b border-zinc-700 pb-4">
            <div className="flex items-center justify-end gap-3">
              <label
                htmlFor={FRAME_START_UPLOAD_INPUT_ID}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition-colors hover:border-white hover:text-white"
                title="Upload first and end frames"
              >
                <Upload size={16} />
              </label>
              <input
                ref={frameUploadInputRef}
                id={FRAME_START_UPLOAD_INPUT_ID}
                type="file"
                accept="image/*"
                multiple
                disabled={isGenerating}
                onChange={(e) => handleFrameUpload(e.target.files)}
                className="sr-only"
              />
            </div>

            {(frameStartPreview || frameEndPreview) && (
              <div className="mt-4 flex gap-4">
                {frameStartPreview && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onDoubleClick={() => {
                        const node = frameUploadInputRef.current;
                        if (!node) return;
                        node.multiple = false;
                        node.onchange = (event) => {
                          const input = event.target as HTMLInputElement;
                          setFrameStartFile(input.files?.[0] || null);
                          input.value = '';
                          node.onchange = null;
                          node.multiple = true;
                        };
                        node.click();
                      }}
                      className="h-[60px] w-[60px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
                      title="Double-click to replace first frame"
                    >
                      <img src={frameStartPreview} alt="First frame preview" className="w-full h-full object-cover" />
                    </button>
                    <p className="text-[11px] text-zinc-400">First Frame</p>
                  </div>
                )}

                {frameEndPreview && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onDoubleClick={() => {
                        const node = frameUploadInputRef.current;
                        if (!node) return;
                        node.multiple = false;
                        node.onchange = (event) => {
                          const input = event.target as HTMLInputElement;
                          setFrameEndFile(input.files?.[0] || null);
                          input.value = '';
                          node.onchange = null;
                          node.multiple = true;
                        };
                        node.click();
                      }}
                      className="h-[60px] w-[60px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
                      title="Double-click to replace end frame"
                    >
                      <img src={frameEndPreview} alt="End frame preview" className="w-full h-full object-cover" />
                    </button>
                    <p className="text-[11px] text-zinc-400">End Frame</p>
                  </div>
                )}
              </div>
            )}

            {!frameStartPreview && !frameEndPreview && (
              <div className="mt-4 flex gap-4">
                <div className="space-y-2">
                  <div className="h-[60px] w-[60px] rounded-md border border-dashed border-zinc-800 bg-zinc-950" />
                  <p className="text-[11px] text-zinc-500">First Frame</p>
                </div>
                <div className="space-y-2">
                  <div className="h-[60px] w-[60px] rounded-md border border-dashed border-zinc-800 bg-zinc-950" />
                  <p className="text-[11px] text-zinc-500">End Frame</p>
                </div>
              </div>
            )}
          </div>
        </div>

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

        {renderAudioToggle(frameAudioEnabled, setFrameAudioEnabled)}
        {renderAudioTypeSelect(frameAudioType, setFrameAudioType, isGenerating || !frameAudioEnabled)}

        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={framePrompt}
              onChange={(e) => setFramePrompt(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus={activeTab === 'frame-video'}
              disabled={isGenerating}
              placeholder='Example: Start on the uploaded frame, add subtle camera motion, premium reflections, product-focused sound effects, ending hero shot.'
              className={`${inputClass} h-[60px] resize-y overflow-auto pr-6 pb-4 pointer-events-auto`}
            />
            <div className="pointer-events-none absolute bottom-3 right-1 flex flex-col gap-[2px] opacity-95">
              <span className="h-[2px] w-2 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-3 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-4 rotate-[-45deg] bg-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end bg-black pt-3 pb-1">
        {sendButton(isGenerating || !frameStartFile || !frameEndFile)}
      </div>
    </div>
  );

  const renderRefVideoTab = () => (
    <div className="flex flex-col">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Upload up to three images. They guide the product, look, and continuity of the shot.</p>
          <div className="border-b border-zinc-700 pb-4">
            <div className="flex items-center justify-end gap-3">
              <label
                htmlFor={REF_UPLOAD_INPUT_IDS[0]}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition-colors hover:border-white hover:text-white"
                title="Upload reference images"
              >
                <Upload size={16} />
              </label>
              <input
                ref={refUploadInputRef}
                id={REF_UPLOAD_INPUT_IDS[0]}
                type="file"
                accept="image/*"
                multiple
                disabled={isGenerating}
                onChange={(e) => handleRefUpload(e.target.files)}
                className="sr-only"
              />
            </div>

            <div className="mt-4 flex gap-4">
              {refPreviews.map((preview, index) => (
                <div key={`ref-slot-${index}`} className="space-y-2">
                  {preview ? (
                    <button
                      type="button"
                      onDoubleClick={() => {
                        const node = refUploadInputRef.current;
                        if (!node) return;
                        node.multiple = false;
                        node.onchange = (event) => {
                          const input = event.target as HTMLInputElement;
                          handleRefFileChange(index, input.files);
                          input.value = '';
                          node.onchange = null;
                          node.multiple = true;
                        };
                        node.click();
                      }}
                      className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
                      title={`Double-click to replace Image ${index + 1}`}
                    >
                      <img src={preview.url} alt={preview.file.name} className="h-full w-full object-cover" />
                    </button>
                  ) : (
                    <div className="h-[60px] w-[60px] rounded-md border border-dashed border-zinc-800 bg-zinc-950" />
                  )}
                  <p className={`text-[11px] ${preview ? 'text-zinc-400' : 'text-zinc-500'}`}>Image {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

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

        {renderAudioToggle(refAudioEnabled, setRefAudioEnabled)}
        {renderAudioTypeSelect(refAudioType, setRefAudioType, isGenerating || !refAudioEnabled)}

        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={refPrompt}
              onChange={(e) => setRefPrompt(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus={activeTab === 'ref-video'}
              disabled={isGenerating}
              placeholder='Example: Use the reference images to create a polished product ad, smooth transitions, controlled motion, and a strong final packshot.'
              className={`${inputClass} h-[60px] resize-y overflow-auto pr-6 pb-4 pointer-events-auto`}
            />
            <div className="pointer-events-none absolute bottom-3 right-1 flex flex-col gap-[2px] opacity-95">
              <span className="h-[2px] w-2 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-3 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-4 rotate-[-45deg] bg-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end bg-black pt-3 pb-1">
        {sendButton(isGenerating || refFiles.filter(Boolean).length === 0)}
      </div>
    </div>
  );

  const renderCreatorTab = () => (
    <div className="flex flex-col">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="border-b border-zinc-700 pb-4">
            <div className="flex items-center justify-end gap-3">
              <label
                htmlFor={CREATOR_UPLOAD_INPUT_ID}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition-colors hover:border-white hover:text-white"
                title="Upload 1 to 3 reference images"
              >
                <Upload size={16} />
              </label>
              <input
                ref={creatorUploadInputRef}
                id={CREATOR_UPLOAD_INPUT_ID}
                type="file"
                accept="image/*"
                multiple
                disabled={isGenerating}
                onChange={(e) => handleCreatorUpload(e.target.files)}
                className="sr-only"
              />
            </div>

            {creatorPreviews.length > 0 && (
              <div className="mt-4 flex gap-4">
                {creatorPreviews.map((preview, index) => (
                  <div key={`${preview.file.name}-${index}`} className="space-y-2">
                    <button
                      type="button"
                      onDoubleClick={() => creatorUploadInputRef.current?.click()}
                      className="h-[60px] w-[60px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
                      title="Double-click to replace images"
                    >
                      <img src={preview.url} alt={`Creator upload preview ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                    <p className="text-[11px] text-zinc-400">Image {index + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <input
            value={creatorWebsiteUrl}
            onChange={(e) => setCreatorWebsiteUrl(e.target.value)}
            disabled={isGenerating}
            placeholder="Website URL (optional)"
            className={inputClass}
          />
        </div>

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
          <label className="text-xs text-zinc-500">Creative brief</label>
          <div className="relative">
            <textarea
              value={creatorBrief}
              onChange={(e) => setCreatorBrief(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus={activeTab === 'creator'}
              disabled={isGenerating}
              placeholder='Example: Create a premium 16:9 product ad with a strong hook, clean brand overlays, a benefits scene, and a CTA end card.'
              className={`${inputClass} h-[88px] resize-y overflow-auto pr-6 pb-4 pointer-events-auto`}
            />
            <div className="pointer-events-none absolute bottom-3 right-1 flex flex-col gap-[2px] opacity-95">
              <span className="h-[2px] w-2 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-3 rotate-[-45deg] bg-white" />
              <span className="h-[2px] w-4 rotate-[-45deg] bg-white" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs text-zinc-500">Headline</label>
            <input
              value={creatorHeadline}
              onChange={(e) => setCreatorHeadline(e.target.value)}
              disabled={isGenerating}
              placeholder="Create Video Ads"
              className={inputClass}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs text-zinc-500">CTA</label>
            <input
              value={creatorCta}
              onChange={(e) => setCreatorCta(e.target.value)}
              disabled={isGenerating}
              placeholder="Start Free Trial"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end bg-black pt-3 pb-1">
        <button
          onClick={handleSubmit}
          disabled={isGenerating}
          className="h-14 rounded-full px-6 flex items-center justify-center transition-all active:scale-[0.98] bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white text-sm font-semibold"
        >
          Start Creator
        </button>
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (activeTab === 'creator') {
      onStartCreator(aspectRatio, creatorDuration, creatorWebsiteUrl.trim(), creatorBrief, creatorHeadline, creatorCta, creatorFiles);
      return;
    }

    if (activeTab === 'generate') {
      onGenerateText(generatePrompt, aspectRatio, generateAudioEnabled, generateAudioType, generateImageFile);
      return;
    }

    if (activeTab === 'frame-video') {
      if (!frameStartFile || !frameEndFile) return;
      onGenerateFrameVideo(frameStartFile, frameEndFile, framePrompt, aspectRatio, frameAudioEnabled, frameAudioType);
      return;
    }

    const validRefFiles = refFiles.filter((file): file is File => Boolean(file));
    if (validRefFiles.length === 0) return;
    onGenerateRefVideo(validRefFiles, refPrompt, aspectRatio, refAudioEnabled, refAudioType);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black animate-in fade-in duration-300 select-text">
      <button
        onClick={onClose}
        disabled={isGenerating}
        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
      >
        <X size={20} />
      </button>

      <div
        className="bg-black w-full max-w-[960px] max-h-[calc(100vh-48px)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto select-text flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 flex items-center shrink-0">
          <div className="mb-[60px]">
            <h2 className="text-[36px] font-bold leading-none text-white tracking-tight">Create Video Ads</h2>
          </div>
        </div>

        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('generate')} className={tabButtonClass('generate')}>Generate</button>
            <button onClick={() => setActiveTab('frame-video')} className={tabButtonClass('frame-video')}>Frames to Video</button>
            <button onClick={() => setActiveTab('ref-video')} className={tabButtonClass('ref-video')}>Ref-Video</button>
            <button onClick={() => setActiveTab('creator')} className={tabButtonClass('creator')}>Creator</button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 pb-8">
          {activeTab === 'generate' && renderGenerateTab()}
          {activeTab === 'frame-video' && renderFrameVideoTab()}
          {activeTab === 'ref-video' && renderRefVideoTab()}
          {activeTab === 'creator' && renderCreatorTab()}
        </div>
      </div>
    </div>
  );
};

export default VadeoAdModal;
