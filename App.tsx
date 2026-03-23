
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Stage, Layer as KonvaLayer, Rect, Line } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import {
  EditorState,
  Page,
  Layer,
  LayerType,
  AspectRatio,
  Point,
  TextLayer,
  ShapeLayer,
  ImageLayer,
  Project,
  ExportConfig
} from './types';
import {
  ASPECT_RATIOS,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_PAGE_ID
} from './constants';
import Toolbar from './components/Toolbar/Toolbar';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import CanvasElement from './components/Editor/CanvasElement';
import ProjectGallery from './components/Editor/ProjectGallery';
import ExportDialog from './components/Editor/ExportDialog';
import ProModal from './components/Modals/ProModal';
import AIModal from './components/Modals/AIModal';
import VadeoAdModal from './components/Modals/VadeoAdModal';
import MotionModal from './components/Modals/MotionModal';
import type { MotionAnimationPreset } from './components/Modals/MotionModal';
import CreditsModal from './components/Modals/CreditsModal';
import SettingsModal from './components/Modals/SettingsModal';
import GridOverlay, { GridType } from './components/Editor/GridOverlay';


import { useExport } from './hooks/useExport';
import { aiService, type VeoResolution } from './aiService';
import { dbHelpers, authHelpers, storageHelpers, type TrialState } from './lib/supabase';
import { localProjectStore } from './lib/localProjects';
import { getGenerationCountForUser, getRemainingGenerations, PLAN_GENERATION_LIMIT, recordGenerationSuccess } from './lib/generationUsage';
import { getStoredPlanForUser } from './lib/subscriptionStorage';
// import { db } from './db'; // Removing IDB dependency for Project saving
import { RemixEngine } from './components/Remix/RemixEngine';
import { useRemix } from './components/Remix/useRemix';
import { useMasking } from './components/Masking/useMasking';
import { TimelineEngine } from './components/Timeline/TimelineEngine';
import Timeline from './components/Timeline/Timeline';
import { useTimeline } from './components/Timeline/useTimeline';
import {
  Download,
  Undo2,
  Redo2,
  Maximize2,
  Loader2,
  ZoomIn,
  ZoomOut,
  Save,
  Library,
  CheckCircle2,
  Crown,
  Sparkles,
  ChevronLeft,
  Zap,
  Grid
} from 'lucide-react';

interface AppProps {
  initialProject?: any;
  onBackToDashboard?: () => void;
  trialState?: TrialState;
}

type PlanTier = 'none' | 'starter' | 'standard' | 'premium';

const DEV_BYPASS_CREDITS = false;
const DEV_UNLIMITED_CREDITS = 9999;
const IMAGE_UPLOAD_INPUT_ID = 'editor-image-upload';
const VIDEO_UPLOAD_INPUT_ID = 'editor-video-upload';
const DEV_BYPASS_AUTH_SAVE = true;
const VADEO_MAX_AD_IMAGES = 3;
const GENERATED_AUDIO_FADE_MS = 1000;
const DEFAULT_TIMELINE_DURATION_MS = 5000;
const VEO_GENERATED_DURATION_SEC = 8;
const TRIAL_MOTION_DOWNLOAD_LIMIT = 2;

type PickerCapableInput = HTMLInputElement & {
  showPicker?: () => void;
};

const App: React.FC<AppProps> = ({ initialProject, onBackToDashboard, trialState }) => {
  // --- Manage Body Scroll ---
  useEffect(() => {
    document.title = 'Vadeo | Editor';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // --- Project Management State ---
  const [projectId, setProjectId] = useState<string>(uuidv4());
  const [projectName, setProjectName] = useState<string>('Untitled Design');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showVadeoAdModal, setShowVadeoAdModal] = useState(false);
  const [showMotionModal, setShowMotionModal] = useState(false);
  const [aiLayerId, setAILayerId] = useState<string | null>(null);

  // New State for Supabase Integration
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(() => {
    const storedPlan = getStoredPlanForUser(typeof window !== 'undefined' ? localStorage.getItem('vadeo_last_user_id') || '' : '');
    if (storedPlan === 'starter' || storedPlan === 'standard' || storedPlan === 'premium') {
      return storedPlan;
    }
    return DEV_BYPASS_CREDITS ? 'premium' : 'none';
  });
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsBusyAction, setSettingsBusyAction] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [creatorNotice, setCreatorNotice] = useState<string | null>(null);
  const [isNewProject, setIsNewProject] = useState(true);
  const [remainingGenerations, setRemainingGenerations] = useState<number>(0);
  const [usedGenerations, setUsedGenerations] = useState<number>(0);
  const [remainingMotionAiRuns, setRemainingMotionAiRuns] = useState<number>(0);
  const [usedMotionAiRuns, setUsedMotionAiRuns] = useState<number>(0);
  const [motionAiLimit, setMotionAiLimit] = useState<number>(0);
  const [trialMotionDownloadsUsed, setTrialMotionDownloadsUsed] = useState<number>(0);
  const [accountName, setAccountName] = useState<string>('Vadeo User');
  const isTrialActive = trialState?.status === 'active';
  const isTrialExpired = trialState?.status === 'expired';
  const hasTrialEditorAccess = currentPlan === 'none' && (isTrialActive || isTrialExpired);
  const remainingTrialMotionDownloads = Math.max(0, TRIAL_MOTION_DOWNLOAD_LIMIT - trialMotionDownloadsUsed);

  const handleBackClick = () => {
    if (onBackToDashboard) onBackToDashboard();
  };

  const hasGenerationAccess =
    DEV_BYPASS_CREDITS ||
    isAdminUser ||
    ((currentPlan === 'standard' || currentPlan === 'premium') && remainingGenerations > 0);
  const hasPremiumAccess = DEV_BYPASS_CREDITS || isAdminUser || currentPlan === 'premium';
  const planLabel = DEV_BYPASS_CREDITS
    ? 'Premium'
    : isAdminUser
      ? 'Admin'
      : isTrialActive
        ? 'Free Trial'
        : isTrialExpired
          ? 'Trial Expired'
      : currentPlan === 'premium'
        ? `Premium${Number.isFinite(remainingGenerations) ? ` (${remainingGenerations}/${PLAN_GENERATION_LIMIT} left)` : ''}`
        : currentPlan === 'standard'
          ? `Standard${Number.isFinite(remainingGenerations) ? ` (${remainingGenerations}/${PLAN_GENERATION_LIMIT} left)` : ''}`
          : currentPlan === 'starter'
            ? 'Starter'
            : 'No Subscription';

  const applyPlan = (plan: PlanTier) => {
    setCurrentPlan(plan);
    const isPremium = plan === 'premium';
    setEditorState(prev => ({ ...prev, isPro: DEV_BYPASS_CREDITS ? true : isPremium }));
  };

  // Initialize User & Plan
  useEffect(() => {
    authHelpers.getCurrentUser().then(async (user) => {
      if (user) {
        setUserId(user.id);
        localStorage.setItem('vadeo_last_user_id', user.id);
        setIsAdminUser(Boolean(user.is_admin));
        setAccountName(user.full_name || user.email?.split('@')[0] || 'Vadeo User');
        await dbHelpers.initUserProfile(user.id);
        const accessState = await dbHelpers.getAccessState().catch(() => null);
        if (accessState?.profile) {
          setAccountName(accessState.profile.full_name || user.full_name || user.email?.split('@')[0] || 'Vadeo User');
        }
        if (accessState?.trial) {
          setTrialMotionDownloadsUsed(accessState.trial.motionDownloadsUsed || 0);
        }
        const nextPlan = accessState?.subscription?.plan;
        if (nextPlan === 'starter' || nextPlan === 'standard' || nextPlan === 'premium') {
          applyPlan(nextPlan);
        } else if (!accessState) {
          const storedPlan = getStoredPlanForUser(user.id);
          if (storedPlan) {
            applyPlan(storedPlan);
          }
        } else {
          applyPlan('none');
        }
        if (accessState?.generationUsage) {
          setUsedGenerations(accessState.generationUsage.used || 0);
          setRemainingGenerations(accessState.generationUsage.remaining || 0);
        } else {
          const fallbackPlan = nextPlan || getStoredPlanForUser(user.id);
          setUsedGenerations(getGenerationCountForUser(user.id));
          setRemainingGenerations(getRemainingGenerations(user.id, fallbackPlan));
        }
        if (accessState?.motionAiUsage) {
          setUsedMotionAiRuns(accessState.motionAiUsage.used || 0);
          setRemainingMotionAiRuns(accessState.motionAiUsage.remaining || 0);
          setMotionAiLimit(accessState.motionAiUsage.limit || 0);
        } else {
          setUsedMotionAiRuns(0);
          setRemainingMotionAiRuns(0);
          setMotionAiLimit(0);
        }
      } else {
        setUserId(null);
        setIsAdminUser(false);
        setAccountName('Vadeo User');
        setCurrentPlan(DEV_BYPASS_CREDITS ? 'premium' : 'none');
        setUsedGenerations(0);
        setRemainingGenerations(0);
        setUsedMotionAiRuns(0);
        setRemainingMotionAiRuns(0);
        setMotionAiLimit(0);
        setTrialMotionDownloadsUsed(0);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAdminUser && currentPlan === 'none' && isTrialExpired && !showSettingsModal) {
      setSettingsError(null);
      setShowSettingsModal(true);
    }
  }, [currentPlan, isAdminUser, isTrialExpired, showSettingsModal]);

  // Initialize from Prop (Supabase Data)
  useEffect(() => {
    if (initialProject) {
      setProjectId(initialProject.id);
      setProjectName(initialProject.name || 'Untitled Project');

      // Handle Supabase structure (editor_state) vs potential legacy structure
      const loadedPages = initialProject.editor_state?.pages || initialProject.pages;

      if (loadedPages) {
        setEditorState(prev => ({
          ...prev,
          pages: loadedPages,
          activePageId: loadedPages[0]?.id || DEFAULT_PAGE_ID,
          history: [loadedPages],
          historyIndex: 0
        }));
      }
      setIsNewProject(false);
    }
  }, [initialProject]);


  // --- Editor State ---
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // ... existing init logic ...
    const initialPage: Page = {
      id: DEFAULT_PAGE_ID,
      name: 'Scene 1',
      aspectRatio: '16:9',
      width: ASPECT_RATIOS['16:9'].w,
      height: ASPECT_RATIOS['16:9'].h,
      backgroundColor: '#ffffff',
      layers: [],
    };

    return {
      pages: [initialPage],
      activePageId: DEFAULT_PAGE_ID,
      zoom: 0.1,
      pan: { x: 0, y: 0 },
      selectedLayerId: null,
      history: [[initialPage]],
      historyIndex: 0,
      isPro: DEV_BYPASS_CREDITS ? true : false,
      selectedLayerIds: [],
      playheadTime: 0,
      isPlaying: false,
      selectedKeyframe: null
    };
  });

  // ... Tool & UI State ...
  const [activeTool, setActiveTool] = useState<string>('select');
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [exportProgress, setExportProgress] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [activeGuides, setActiveGuides] = useState<{ x?: number, y?: number } | null>(null);
  const [isCanvasEditing, setIsCanvasEditing] = useState(false);
  const [activeGrid, setActiveGrid] = useState<GridType>('none');
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Export States

  // AI State
  const [aiMode, setAIMode] = useState<'motion' | 'edit_image' | 'edit_video' | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageUploadInputRef = useRef<HTMLInputElement>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const thumbnailTimeoutRef = useRef<number | null>(null);

  const activePage = editorState.pages.find(p => p.id === editorState.activePageId)!;
  const isMotionProject = activePage.layers.some((layer) => typeof layer.name === 'string' && layer.name.startsWith('Motion '));
  const isTrialMotionExportLocked =
    !DEV_BYPASS_CREDITS &&
    !isAdminUser &&
    hasTrialEditorAccess &&
    isMotionProject &&
    trialMotionDownloadsUsed >= TRIAL_MOTION_DOWNLOAD_LIMIT;

  const handleUpgrade = () => {
    applyPlan('premium');
  };

  const handleOpenSettings = () => {
    setSettingsError(null);
    setShowSettingsModal(true);
  };

  const handlePlanSelectFromSettings = (plan: 'starter' | 'standard' | 'premium') => {
    setSettingsError(null);
    setShowSettingsModal(false);
    window.location.assign(`/pricing?plan=${plan}`);
  };

  const handleManageBilling = async () => {
    try {
      setSettingsBusyAction('billing_portal');
      setSettingsError(null);

      const response = await fetch('/api/stripe/create-billing-portal-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || 'Unable to open billing portal right now.');
      }

      window.location.assign(payload.url);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Unable to open billing portal right now.');
    } finally {
      setSettingsBusyAction(null);
    }
  };

  const handleSettingsLogout = async () => {
    try {
      setSettingsBusyAction('logout');
      setSettingsError(null);
      await authHelpers.signOut();
      window.location.assign('/signup');
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Unable to log out right now.');
    } finally {
      setSettingsBusyAction(null);
    }
  };

  // --- Supabase Save Logic ---
  const handleSaveProject = useCallback(async () => {
    if (!userId) {
      if (DEV_BYPASS_AUTH_SAVE) {
        const savedProject = await localProjectStore.save({
          id: projectId,
          name: projectName,
          editorState,
          thumbnail: editorState.pages[0]?.thumbnail
        });
        setProjectId(savedProject.id);
        setIsNewProject(false);
        setLastSaved(Date.now());
        return;
      }
      console.warn("Cannot save: No authenticated user");
      alert("Cannot save: You are not logged in. Please log in to save your work.");
      return;
    }

    try {
      setIsSaving(true);
      const thumbnail = editorState.pages[0]?.thumbnail;

      let result;
      if (isNewProject) {
        result = await dbHelpers.saveProject(userId, projectName, editorState, thumbnail);
        if (result.data) {
          setProjectId(result.data.id);
          setIsNewProject(false);
          console.log("Project created:", result.data.id);
        }
      } else {
        result = await dbHelpers.updateProject(projectId, projectName, editorState, thumbnail);
        console.log("Project updated:", projectId);
      }

      if (result.error) throw result.error;
      setLastSaved(Date.now());
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
      // Fallback or error notification
      alert(`Failed to save project: ${err.message || 'Unknown error'}`);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  }, [userId, projectId, projectName, editorState, isNewProject]);

  // --- Autosave Implementation (30s) ---
  // Use a ref to access latest state in interval without resetting timer
  const autosaveRef = useRef({ userId, projectId, projectName, editorState, isNewProject });
  useEffect(() => {
    autosaveRef.current = { userId, projectId, projectName, editorState, isNewProject };
  }, [userId, projectId, projectName, editorState, isNewProject]);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = autosaveRef.current;
      if (!current.userId) {
        if (DEV_BYPASS_AUTH_SAVE) {
          const performLocalAutosave = async () => {
            if (!current.isNewProject) {
              await localProjectStore.save({
                id: current.projectId,
                name: current.projectName,
                editorState: current.editorState,
                thumbnail: current.editorState.pages[0]?.thumbnail
              });
            }
            setLastSaved(Date.now());
          };

          performLocalAutosave().catch((error) => {
            console.error('Local autosave error:', error);
          });
        }
        return;
      }

      const performAutosave = async () => {
        try {
          const thumbnail = current.editorState.pages[0]?.thumbnail;
          if (current.isNewProject) {
            const result = await dbHelpers.saveProject(
              current.userId,
              current.projectName,
              current.editorState,
              thumbnail
            );

            if (result.error) throw result.error;
            if (result.data?.id) {
              setProjectId(result.data.id);
              setIsNewProject(false);
              console.log('Autosave created new project:', result.data.id);
            }
          } else {
            const result = await dbHelpers.updateProject(
              current.projectId,
              current.projectName,
              current.editorState,
              thumbnail
            );
            if (result.error) throw result.error;
          }
          setLastSaved(Date.now());
          console.log("Autosave complete.");
        } catch (e) {
          console.error("Autosave error:", e);
        }
      };

      console.log("Triggering Autosave Check...");
      performAutosave();

    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, []); // Run once on mount

  const handleLoadProject = async (id: string) => {
    try {
      if (!userId && DEV_BYPASS_AUTH_SAVE) {
        const project = await localProjectStore.get(id);
        if (!project) return;

        setProjectId(project.id);
        setProjectName(project.name);

        const loadedPages = project.editor_state?.pages;
        if (loadedPages) {
          setEditorState(prev => ({
            ...prev,
            pages: loadedPages,
            activePageId: loadedPages[0]?.id || DEFAULT_PAGE_ID,
            selectedLayerId: null,
            history: [loadedPages],
            historyIndex: 0
          }));
        }

        setIsNewProject(false);
        setShowGallery(false);
        return;
      }

      const { data: project, error } = await dbHelpers.getProject(id);
      if (project) {
        setProjectId(project.id);
        setProjectName(project.name);

        // Handle Supabase structure (editor_state)
        const loadedPages = project.editor_state?.pages || project.pages;

        if (loadedPages) {
          setEditorState(prev => ({
            ...prev,
            pages: loadedPages,
            activePageId: loadedPages[0]?.id || DEFAULT_PAGE_ID,
            selectedLayerId: null,
            history: [loadedPages],
            historyIndex: 0
          }));
        }
        setShowGallery(false);
      }
    } catch (err) {
      console.error('Failed to load:', err);
    }
  };

  const pushToHistory = useCallback((newPages: Page[]) => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newPages]);
      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (editorState.historyIndex > 0) {
      setEditorState(prev => ({
        ...prev,
        pages: prev.history[prev.historyIndex - 1],
        historyIndex: prev.historyIndex - 1,
        selectedLayerId: null
      }));
    }
  }, [editorState.historyIndex]);

  const handleRedo = useCallback(() => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      setEditorState(prev => ({
        ...prev,
        pages: prev.history[prev.historyIndex + 1],
        historyIndex: prev.historyIndex + 1,
        selectedLayerId: null
      }));
    }
  }, [editorState.historyIndex, editorState.history.length]);

  const updateActivePage = useCallback((updates: Partial<Page>) => {
    setEditorState(prev => {
      const newPages = prev.pages.map(p =>
        p.id === prev.activePageId ? { ...p, ...updates } : p
      );

      // Derive history update logic here to keep it atomic
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newPages]);

      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const addGeneratedVideoLayer = useCallback((src: string, name: string = 'Vadeo ad', forcedDurationSec?: number) => {
    const tempVideo = document.createElement('video');
    tempVideo.src = src;
    tempVideo.onloadedmetadata = () => {
      const naturalWidth = tempVideo.videoWidth || 1280;
      const naturalHeight = tempVideo.videoHeight || 720;
      const aspectRatio = naturalWidth / naturalHeight;
      const width = Math.min(960, naturalWidth);
      const height = width / aspectRatio;
      const duration = forcedDurationSec ?? tempVideo.duration ?? 5;
      const newLayerId = uuidv4();

      const newLayer: ImageLayer = {
        id: newLayerId,
        name,
        type: LayerType.IMAGE,
        x: 100,
        y: 100,
        width,
        height,
        rotation: 0,
        opacity: 1,
        src,
        mediaType: 'video',
        playing: true,
        loop: true,
        volume: 1,
        currentTime: 0,
        duration,
        audioFadeInMs: GENERATED_AUDIO_FADE_MS,
        audioFadeOutMs: GENERATED_AUDIO_FADE_MS,
        visible: true,
        locked: false
      };

      let nextEditorState: EditorState | null = null;

      setEditorState(prev => {
        const newPages = prev.pages.map((page) =>
          page.id === prev.activePageId
            ? { ...page, layers: [...page.layers, newLayer] }
            : page
        );

        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push([...newPages]);

        nextEditorState = {
          ...prev,
          pages: newPages,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          selectedLayerId: newLayerId,
          selectedLayerIds: [newLayerId],
          playheadTime: 0,
          isPlaying: false,
          selectedKeyframe: null
        };

        return nextEditorState;
      });

      if (nextEditorState) {
        setIsNewProject(false);
        setLastSaved(Date.now());

        if (!userId && DEV_BYPASS_AUTH_SAVE) {
          void localProjectStore.save({
            id: projectId,
            name: projectName,
            editorState: nextEditorState,
            thumbnail: nextEditorState.pages[0]?.thumbnail
          }).catch((error) => {
            console.error('Failed to immediately persist generated video:', error);
          });
        }
      }
    };
  }, [projectId, projectName, userId]);

  const normalizeVeoAspectRatio = useCallback((ratio: AspectRatio): '16:9' | '9:16' => {
    return ratio === '9:16' ? '9:16' : '16:9';
  }, []);

  const timelineDurationMs = useMemo(() => {
    const maxVideoDurationMs = activePage.layers.reduce((maxDuration, layer) => {
      if (layer.type !== LayerType.IMAGE || layer.mediaType !== 'video') {
        return maxDuration;
      }

      return Math.max(maxDuration, Math.round((layer.duration || 0) * 1000));
    }, 0);

    const maxKeyframeTimeMs = activePage.layers.reduce((maxTime, layer) => {
      const layerMax = layer.keyframes?.reduce((layerTime, keyframe) => Math.max(layerTime, keyframe.time), 0) || 0;
      return Math.max(maxTime, layerMax);
    }, 0);

    return Math.max(DEFAULT_TIMELINE_DURATION_MS, maxVideoDurationMs, maxKeyframeTimeMs);
  }, [activePage.layers]);

  const syncCanvasToAspectRatio = useCallback((ratio: AspectRatio) => {
    const targetDims = ASPECT_RATIOS[ratio];
    if (!targetDims) return;

    updateActivePage({
      aspectRatio: ratio,
      width: targetDims.w,
      height: targetDims.h
    });
  }, [updateActivePage]);

  const handleUploadedFile = useCallback((file: File, type: 'IMAGE_UPLOAD' | 'VIDEO_UPLOAD') => {
    const url = URL.createObjectURL(file);
    const isVideo = type === 'VIDEO_UPLOAD';

    if (isVideo) {
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const duration = tempVideo.duration;
        const naturalWidth = tempVideo.videoWidth || 800;
        const naturalHeight = tempVideo.videoHeight || 450;
        const aspectRatio = naturalWidth / naturalHeight;
        const width = Math.min(800, naturalWidth);
        const height = width / aspectRatio;
        const newLayerId = uuidv4();

        const newLayer: ImageLayer = {
          id: newLayerId,
          name: 'Video',
          type: LayerType.IMAGE,
          x: 100,
          y: 100,
          width,
          height,
          rotation: 0,
          opacity: 1,
          src: url,
          mediaType: 'video',
          playing: true,
          loop: true,
          volume: 1,
          currentTime: 0,
          duration,
          visible: true,
          locked: false
        };

        updateActivePage({ layers: [...activePage.layers, newLayer] });
        setEditorState(prev => ({ ...prev, selectedLayerId: newLayer.id, selectedLayerIds: [newLayer.id] }));

        if (userId) {
          console.log('☁️ Starting background upload for video...');
          storageHelpers.uploadVideo(userId, file, projectId).then(({ data, error }) => {
            if (error) {
              console.error('❌ Background upload failed:', error);
              alert("Video upload failed. It may disappear on refresh. Please use a smaller file or check your connection.");
            } else if (data) {
              console.log('✅ Background upload complete. Swapping URL.', data.url);
              setEditorState(currentState => {
                const currentActivePage = currentState.pages.find(p => p.id === currentState.activePageId);
                if (!currentActivePage) return currentState;

                const updatedLayers = currentActivePage.layers.map(l =>
                  l.id === newLayerId ? { ...l, src: data.url } : l
                );

                const newPages = currentState.pages.map(p =>
                  p.id === currentState.activePageId ? { ...p, layers: updatedLayers } : p
                );

                return {
                  ...currentState,
                  pages: newPages
                };
              });
            }
          });
        } else {
          console.warn("⚠️ User not logged in. Video will not be saved to cloud.");
        }
      };
      return;
    }

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const naturalWidth = img.naturalWidth || 800;
      const naturalHeight = img.naturalHeight || 450;
      const aspectRatio = naturalWidth / naturalHeight;
      const width = Math.min(800, naturalWidth);
      const height = width / aspectRatio;

      const newLayer: ImageLayer = {
        id: uuidv4(),
        name: 'Image',
        type: LayerType.IMAGE,
        x: 100,
        y: 100,
        width,
        height,
        rotation: 0,
        opacity: 1,
        src: url,
        mediaType: 'image',
        visible: true,
        locked: false
      };

      updateActivePage({ layers: [...activePage.layers, newLayer] });
      setEditorState(prev => ({ ...prev, selectedLayerId: newLayer.id, selectedLayerIds: [newLayer.id] }));
    };
  }, [activePage.layers, projectId, updateActivePage, userId]);

  const handleDroppedFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const supportedFiles = fileArray.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));

    if (supportedFiles.length === 0) {
      alert('Please drop an image or video file.');
      return;
    }

    supportedFiles.forEach((file) => {
      const uploadType = file.type.startsWith('video/') ? 'VIDEO_UPLOAD' : 'IMAGE_UPLOAD';
      handleUploadedFile(file, uploadType);
    });
  }, [handleUploadedFile]);

  const handleImagePicker = useCallback(() => {
    const input = imageUploadInputRef.current as PickerCapableInput | null;
    if (!input) return;

    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
    } catch (error) {
      console.error('Image picker failed.', error);
    }
  }, []);

  const handleVideoPicker = useCallback(() => {
    const input = videoUploadInputRef.current as PickerCapableInput | null;
    if (!input) return;

    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
    } catch (error) {
      console.error('Video picker failed.', error);
    }
  }, []);

  const handleAddElement = useCallback((type: LayerType | 'IMAGE_UPLOAD' | 'VIDEO_UPLOAD') => {
    if (type === 'IMAGE_UPLOAD' || type === 'VIDEO_UPLOAD') return;

    let newLayer: Layer;
    const base = { id: uuidv4(), x: 200, y: 200, rotation: 0, opacity: 1, width: 400, height: 400, visible: true, locked: false };

    switch (type) {
      case LayerType.TEXT:
        newLayer = {
          ...base, name: 'Text', type: LayerType.TEXT, text: 'New Text', width: 600,
          fontSize: 60, fontFamily: 'Helvetica', fontWeight: 'bold', fill: '#000000',
          align: 'center', lineHeight: 1.2, letterSpacing: 0
        } as TextLayer;
        break;
      case LayerType.RECT:
        newLayer = { ...base, name: 'Rectangle', type: LayerType.RECT, fill: '#6366f1', stroke: '#4f46e5', strokeWidth: 0, cornerRadius: 0 } as ShapeLayer;
        break;
      case LayerType.CIRCLE:
        newLayer = { ...base, name: 'Circle', type: LayerType.CIRCLE, fill: '#ec4899', stroke: '#db2777', strokeWidth: 0 } as ShapeLayer;
        break;
      case LayerType.STAR:
        newLayer = { ...base, name: 'Star', type: LayerType.STAR, fill: '#8b5cf6', stroke: '#7c3aed', strokeWidth: 0, sides: 5, innerRadius: 50 } as ShapeLayer;
        break;
      case LayerType.TRIANGLE:
        newLayer = { ...base, name: 'Triangle', type: LayerType.TRIANGLE, fill: '#10b981', stroke: '#059669', strokeWidth: 0, sides: 3 } as ShapeLayer;
        break;
      case LayerType.POLYGON:
        newLayer = { ...base, name: 'Polygon', type: LayerType.POLYGON, fill: '#f59e0b', stroke: '#d97706', strokeWidth: 0, sides: 6 } as ShapeLayer;
        break;
      case LayerType.LINE:
        newLayer = { ...base, name: 'Line', type: LayerType.RECT, width: 400, height: 4, fill: '#6366f1', stroke: '#4f46e5', strokeWidth: 0, cornerRadius: 0 } as ShapeLayer;
        break;
      case LayerType.ARROW:
        newLayer = { ...base, name: 'Arrow', type: LayerType.ARROW, fill: '#6366f1', stroke: '#4f46e5', strokeWidth: 0, width: 200, height: 100 } as ShapeLayer;
        break;
      case LayerType.DIAMOND:
        newLayer = { ...base, name: 'Diamond', type: LayerType.DIAMOND, fill: '#ec4899', stroke: '#db2777', strokeWidth: 0, width: 200, height: 200 } as ShapeLayer;
        break;
      case LayerType.HEART:
        newLayer = { ...base, name: 'Heart', type: LayerType.HEART, fill: '#ef4444', stroke: '#b91c1c', strokeWidth: 0, width: 200, height: 200 } as ShapeLayer;
        break;
      case LayerType.TRAPEZOID:
        newLayer = { ...base, name: 'Trapezoid', type: LayerType.TRAPEZOID, fill: '#f59e0b', stroke: '#d97706', strokeWidth: 0, width: 200, height: 150 } as ShapeLayer;
        break;
      default: return;
    }
    updateActivePage({ layers: [...activePage.layers, newLayer] });
    setEditorState(prev => ({ ...prev, selectedLayerId: newLayer.id }));
    setActiveTool('select');
  }, [activePage, updateActivePage]);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setEditorState(prev => {
      const activePage = prev.pages.find(p => p.id === prev.activePageId);
      if (!activePage) return prev;

      const updatedLayers = activePage.layers.map((l) => {
        if (l.id === id) {
          // Base update first
          let updatedLayer = { ...l, ...updates };

          // --- Auto-Keyframing Logic ---
          const animatableProps = ['x', 'y', 'rotation', 'opacity', 'width', 'height', 'fontSize'];
          const isAnimatableUpdate = Object.keys(updates).some(k => animatableProps.includes(k));

          if (isAnimatableUpdate && prev.playheadTime > 0) {
            const kfTime = prev.selectedKeyframe?.layerId === id
              ? prev.selectedKeyframe.time
              : prev.playheadTime;

            let keyframes = [...(l.keyframes || [])];
            let kf = keyframes.find(k => k.time === kfTime);

            if (!kf && kfTime === prev.playheadTime) {
              // Create new keyframe if it doesn't exist at this time
              const currentView = TimelineEngine.getInterpolatedLayer(l, kfTime);
              kf = {
                time: kfTime,
                x: currentView.x,
                y: currentView.y,
                rotation: currentView.rotation,
                opacity: currentView.opacity,
                width: currentView.width,
                height: currentView.height,
                ...(l.type === LayerType.TEXT ? { fontSize: (currentView as TextLayer).fontSize } : {})
              };
              keyframes.push(kf);
              keyframes.sort((a, b) => a.time - b.time);

              // Auto-select the new keyframe in the NEXT render cycle to avoid stale state issues
              setTimeout(() => {
                setEditorState(current => ({
                  ...current,
                  selectedKeyframe: { layerId: id, time: kfTime }
                }));
              }, 0);
            }

            if (kf) {
              const updatedKf = { ...kf, ...updates };
              // Filter out internal layer metadata
              delete (updatedKf as any).id;
              delete (updatedKf as any).name;
              delete (updatedKf as any).type;

              updatedLayer = {
                ...updatedLayer,
                keyframes: keyframes.map(k => k.time === kfTime ? updatedKf : k)
              };
            }
          } else if (prev.selectedKeyframe && prev.selectedKeyframe.layerId === id) {
            // Manual keyframe update
            const kfTime = prev.selectedKeyframe.time;
            const kf = l.keyframes?.find(k => k.time === kfTime);
            if (kf) {
              const updatedKf = { ...kf, ...updates };
              delete (updatedKf as any).id;
              delete (updatedKf as any).name;
              delete (updatedKf as any).type;
              updatedLayer = {
                ...updatedLayer,
                keyframes: l.keyframes?.map(k => k.time === kfTime ? updatedKf : k)
              };
            }
          }
          return updatedLayer;
        }
        return l;
      });

      // Update pages and history
      const newPages = prev.pages.map(p =>
        p.id === prev.activePageId ? { ...p, layers: updatedLayers as Layer[] } : p
      );

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newPages]);

      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, [setEditorState]);

  const duplicateLayer = useCallback((id: string) => {
    setEditorState(prev => {
      const activePage = prev.pages.find(p => p.id === prev.activePageId);
      if (!activePage) return prev;

      const source = activePage.layers.find(l => l.id === id);
      if (!source) return prev;

      const newLayer = { ...source, id: uuidv4(), name: `${source.name} Copy`, x: source.x + 20, y: source.y + 20 };
      const newPages = prev.pages.map(p =>
        p.id === prev.activePageId ? { ...p, layers: [...p.layers, newLayer] } : p
      );

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newPages]);

      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        selectedLayerId: newLayer.id,
        selectedLayerIds: [newLayer.id]
      };
    });
  }, []);

  const reorderLayers = useCallback((newLayers: Layer[]) => {
    setEditorState(prev => {
      const newPages = prev.pages.map(p =>
        p.id === prev.activePageId ? { ...p, layers: newLayers } : p
      );

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newPages]);

      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const deleteLayer = useCallback((id: string) => {
    setEditorState(prev => {
      const activePage = prev.pages.find(p => p.id === prev.activePageId);
      if (!activePage) return prev;

      const newLayers = activePage.layers.filter(l => l.id !== id);
      const newPages = prev.pages.map(p =>
        p.id === prev.activePageId ? { ...p, layers: newLayers } : p
      );

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newPages]);

      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        selectedLayerId: null,
        selectedLayerIds: []
      };
    });
  }, []);

  // Centralized selection logic
  const handleLayerSelect = useCallback((id: string | null, isMulti: boolean = false) => {
    setEditorState(prev => {
      const currentSelected = prev.selectedLayerIds || [];

      if (!id) {
        return { ...prev, selectedLayerId: null, selectedLayerIds: [] };
      }

      if (isMulti) {
        // Toggle selection
        let newSelected;
        if (currentSelected.includes(id)) {
          newSelected = currentSelected.filter(existingId => existingId !== id);
        } else {
          newSelected = [...currentSelected, id];
        }

        // Update primary selected ID (usually the last one selected)
        return {
          ...prev,
          selectedLayerId: newSelected.length > 0 ? newSelected[newSelected.length - 1] : null,
          selectedLayerIds: newSelected
        };
      } else {
        // Single selection
        return { ...prev, selectedLayerId: id, selectedLayerIds: [id] };
      }
    });
  }, []);

  // --- Remix Feature (Isolated) ---
  const { handleRemix } = useRemix(activePage, editorState.pages, activeGrid, pushToHistory);

  // --- Masking Feature (Isolated) ---
  const { handleMask, handleUnmask } = useMasking(editorState, setEditorState);

  // --- Pro Timeline Logic (Isolated) ---
  const {
    handleTogglePlay,
    handleAddKeyframe,
    handleKeyframeSelect,
    handleKeyframeMove,
    handleDeleteKeyframe
  } = useTimeline(editorState, setEditorState);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editorState.selectedKeyframe) {
          handleDeleteKeyframe();
        } else if (editorState.selectedLayerId || editorState.selectedLayerIds.length > 0) {
          deleteLayer(editorState.selectedLayerId || editorState.selectedLayerIds[0]);
        }
      }

      if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedKeyframe, editorState.selectedLayerId, editorState.selectedLayerIds, editorState.isPlaying, handleDeleteKeyframe, handleTogglePlay, deleteLayer]);


  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSpeed = 0.001;
      setEditorState(prev => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom - e.deltaY * zoomSpeed));
        return { ...prev, zoom: newZoom };
      });
    } else {
      setEditorState(prev => ({
        ...prev,
        pan: { x: prev.pan.x - e.deltaX, y: prev.pan.y - e.deltaY }
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const isBackgroundClick = e.target === workspaceRef.current || e.target === e.currentTarget;
    if (isBackgroundClick) {
      setEditorState(prev => ({ ...prev, selectedLayerId: null, selectedLayerIds: [] }));
      if (document.activeElement instanceof HTMLTextAreaElement) {
        document.activeElement.blur();
      }
    }
    if (activeTool === 'hand' || isSpacePressed || e.button === 1 || isBackgroundClick) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setEditorState(prev => ({ ...prev, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  useEffect(() => {
    if (thumbnailTimeoutRef.current) window.clearTimeout(thumbnailTimeoutRef.current);
    thumbnailTimeoutRef.current = window.setTimeout(() => {
      if (stageRef.current) {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 0.1 });
        setEditorState(prev => ({
          ...prev,
          pages: prev.pages.map(p => p.id === activePage.id ? { ...p, thumbnail: dataURL } : p)
        }));
      }
    }, 1000);
    return () => { if (thumbnailTimeoutRef.current) window.clearTimeout(thumbnailTimeoutRef.current); };
  }, [activePage.layers, activePage.backgroundColor, activePage.id]);

  const handleZoomIn = () => setEditorState(prev => ({ ...prev, zoom: Math.min(MAX_ZOOM, prev.zoom + 0.1) }));
  const handleZoomOut = () => setEditorState(prev => ({ ...prev, zoom: Math.max(MIN_ZOOM, prev.zoom - 0.1) }));

  const centerWorkspace = useCallback(() => {
    if (!workspaceRef.current) return;
    const width = workspaceRef.current.offsetWidth;
    const height = workspaceRef.current.offsetHeight;
    if (width === 0 || height === 0) return;

    const padding = 120;
    const availableW = width - padding;
    const availableH = height - padding;
    const zoomW = availableW / activePage.width;
    const zoomH = availableH / activePage.height;
    const targetZoom = Math.min(zoomW, zoomH, 1.0);

    setEditorState(prev => ({
      ...prev,
      zoom: targetZoom,
      pan: {
        x: (width - activePage.width * targetZoom) / 2,
        y: (height - activePage.height * targetZoom) / 2
      }
    }));
  }, [activePage.width, activePage.height]);

  useEffect(() => {
    if (!workspaceRef.current) return;
    const container = workspaceRef.current;
    const observer = new ResizeObserver(() => {
      centerWorkspace();
    });
    observer.observe(container);
    const timer = setTimeout(centerWorkspace, 100);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [centerWorkspace]);

  // Center workspace whenever project ID changes (Load or New Project)
  useEffect(() => {
    // Small delay to ensure DOM and State are ready
    const timer = setTimeout(() => {
      centerWorkspace();
    }, 100);
    return () => clearTimeout(timer);
  }, [projectId, centerWorkspace]);

  /* --- AI GENERATION LOGIC --- */

  const handleTriggerAIVideo = (layerId: string) => {
    setAILayerId(layerId);
    setAIMode('edit_image');
    setShowAIModal(true);
  };

  const handleTriggerVadeoAd = () => {
    if (!hasGenerationAccess) {
      setShowCreditsModal(true);
      return;
    }
    setShowVadeoAdModal(true);
  };

  const getGenerationResolution = (): VeoResolution => {
    if (DEV_BYPASS_CREDITS || isAdminUser || currentPlan === 'premium') {
      return '4k';
    }
    return '1080p';
  };

  const handleConfirmAI = async (prompt: string, useSimulation: boolean = false) => {
    if (!aiLayerId) return;
    setShowAIModal(false);
    const layer = activePage.layers.find(l => l.id === aiLayerId) as ImageLayer;
    if (!layer) return;

    if (!hasGenerationAccess && !useSimulation) {
      alert("Upgrade to Standard or Premium to generate videos.");
      setShowCreditsModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusText(useSimulation ? "Running Neural Simulation..." : "Contacting Nano Banana...");

    try {
      let resultUrl = '';

      if (useSimulation) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        resultUrl = layer.src;
      } else {
        // Real AI Execution

        // 1. Fetch Source Image
        setStatusText("Uploading Source...");
        const response = await fetch(layer.src);
        const blob = await response.blob();

        // 2. Calculate Aspect Ratio
        // Simple approximation
        const ratio = layer.width / layer.height;
        let aspectRatio = "1:1";
        if (ratio > 1.7) aspectRatio = "16:9";
        else if (ratio < 0.6) aspectRatio = "9:16";
        else if (ratio > 1.3) aspectRatio = "4:3";
        else if (ratio < 0.8) aspectRatio = "3:4";

        // 3. Call AI Service
        setStatusText("Nano Banana Editors Working...");
        // const resultBlob = await aiService.generateNanoBananaImage(blob, prompt, aspectRatio);
        console.warn("Nano Banana AI Service not implemented yet.");
        setStatusText("AI Feature Disabled");
        setIsGenerating(false);
        return;
      }
    } catch (err: any) {
      console.error(err);
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setAILayerId(null);
      setAIMode(null);
    }
  };

  const handleGenerateVadeoAd = async (files: File[], prompt: string, aspectRatio: AspectRatio) => {
    if (!hasGenerationAccess) {
      alert('Standard includes up to 20 generations. Upgrade or renew to continue.');
      setShowCreditsModal(true);
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, VADEO_MAX_AD_IMAGES);

    if (imageFiles.length === 0) {
      alert('Upload at least one image to generate an ad.');
      return;
    }

    setIsGenerating(true);
    setStatusText('Preparing ad generation...');

    try {
      const targetDims = ASPECT_RATIOS[aspectRatio];
      if (targetDims) {
        updateActivePage({
          aspectRatio,
          width: targetDims.w,
          height: targetDims.h
        });
      }

      const imageInputs = await Promise.all(imageFiles.map(async (file) => {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result.split(',')[1] || '' : '';
            if (!result) {
              reject(new Error('Failed to read uploaded image.'));
              return;
            }
            resolve(result);
          };
          reader.onerror = () => reject(new Error('Failed to read uploaded image.'));
          reader.readAsDataURL(file);
        });

        return {
          base64,
          mimeType: file.type || 'image/png'
        };
      }));

      const veoAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const resultUrl = await aiService.generateVideoAdFromImages(
        imageInputs,
        prompt,
        veoAspectRatio,
        getGenerationResolution(),
        (status) => setStatusText(status),
        false
      );

      addGeneratedVideoLayer(resultUrl, 'Vadeo ad', VEO_GENERATED_DURATION_SEC);
      const generationResult = await dbHelpers.recordGenerationSuccess(userId);
      if (!generationResult.error && generationResult.data) {
        setUsedGenerations(generationResult.data.used);
        setRemainingGenerations(generationResult.data.remaining);
      } else {
        setRemainingGenerations(recordGenerationSuccess(userId, currentPlan === 'none' ? null : currentPlan));
        setUsedGenerations(getGenerationCountForUser(userId));
      }
      setShowVadeoAdModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`Ad generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleGenerateTextVideo = async (prompt: string, aspectRatio: AspectRatio, audioEnabled: boolean, audioType: 'auto' | 'dialogue' | 'sound-effects' | 'ambient', imageFile?: File | null) => {
    if (!hasGenerationAccess) {
      alert('Standard includes up to 20 generations. Upgrade or renew to continue.');
      setShowCreditsModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusText('Preparing Veo generation...');

    try {
      syncCanvasToAspectRatio(aspectRatio);

      let resultUrl: string;

      if (imageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (!result) {
              reject(new Error('Failed to read uploaded image.'));
              return;
            }
            resolve(result);
          };
          reader.onerror = () => reject(new Error('Failed to read uploaded image.'));
          reader.readAsDataURL(imageFile);
        });

        resultUrl = await aiService.generateVideoFromImage(
          base64,
          '',
          prompt,
          normalizeVeoAspectRatio(aspectRatio),
          getGenerationResolution(),
          (status) => setStatusText(status),
          false,
          audioEnabled,
          audioType
        );
      } else {
        resultUrl = await aiService.generateVideoFromPrompt(
          prompt,
          normalizeVeoAspectRatio(aspectRatio),
          getGenerationResolution(),
          (status) => setStatusText(status),
          false,
          audioEnabled,
          audioType
        );
      }

      addGeneratedVideoLayer(resultUrl, 'Generated video', VEO_GENERATED_DURATION_SEC);
      const generationResult = await dbHelpers.recordGenerationSuccess(userId);
      if (!generationResult.error && generationResult.data) {
        setUsedGenerations(generationResult.data.used);
        setRemainingGenerations(generationResult.data.remaining);
      } else {
        setRemainingGenerations(recordGenerationSuccess(userId, currentPlan === 'none' ? null : currentPlan));
        setUsedGenerations(getGenerationCountForUser(userId));
      }
      setShowVadeoAdModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`Video generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleGenerateFrameVideo = async (startFile: File, endFile: File, prompt: string, aspectRatio: AspectRatio, audioEnabled: boolean, audioType: 'auto' | 'dialogue' | 'sound-effects' | 'ambient') => {
    if (!hasGenerationAccess) {
      alert('Standard includes up to 20 generations. Upgrade or renew to continue.');
      setShowCreditsModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusText('Preparing frame-to-video generation...');

    try {
      syncCanvasToAspectRatio(aspectRatio);
      const startBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          if (!result) {
            reject(new Error('Failed to read uploaded frame.'));
            return;
          }
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read uploaded frame.'));
        reader.readAsDataURL(startFile);
      });

      const endBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          if (!result) {
            reject(new Error('Failed to read uploaded end frame.'));
            return;
          }
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read uploaded end frame.'));
        reader.readAsDataURL(endFile);
      });

      const resultUrl = await aiService.generateVideoFromImage(
        startBase64,
        endBase64,
        prompt,
        normalizeVeoAspectRatio(aspectRatio),
        getGenerationResolution(),
        (status) => setStatusText(status),
        false,
        audioEnabled,
        audioType
      );
      addGeneratedVideoLayer(resultUrl, 'Frame video', VEO_GENERATED_DURATION_SEC);
      const generationResult = await dbHelpers.recordGenerationSuccess(userId);
      if (!generationResult.error && generationResult.data) {
        setUsedGenerations(generationResult.data.used);
        setRemainingGenerations(generationResult.data.remaining);
      } else {
        setRemainingGenerations(recordGenerationSuccess(userId, currentPlan === 'none' ? null : currentPlan));
        setUsedGenerations(getGenerationCountForUser(userId));
      }
      setShowVadeoAdModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`Frame-to-video generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleGenerateReferenceVideo = async (files: File[], prompt: string, aspectRatio: AspectRatio, audioEnabled: boolean, audioType: 'auto' | 'dialogue' | 'sound-effects' | 'ambient') => {
    if (!hasGenerationAccess) {
      alert('Standard includes up to 20 generations. Upgrade or renew to continue.');
      setShowCreditsModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusText('Preparing reference-video generation...');

    try {
      syncCanvasToAspectRatio(aspectRatio);
      const imageInputs = await Promise.all(files.slice(0, VADEO_MAX_AD_IMAGES).map(async (file) => {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result.split(',')[1] || '' : '';
            if (!result) {
              reject(new Error('Failed to read uploaded image.'));
              return;
            }
            resolve(result);
          };
          reader.onerror = () => reject(new Error('Failed to read uploaded image.'));
          reader.readAsDataURL(file);
        });

        return {
          base64,
          mimeType: file.type || 'image/png'
        };
      }));

      const resultUrl = await aiService.generateVideoAdFromImages(
        imageInputs,
        prompt,
        normalizeVeoAspectRatio(aspectRatio),
        getGenerationResolution(),
        (status) => setStatusText(status),
        false,
        audioEnabled,
        audioType
      );
      addGeneratedVideoLayer(resultUrl, 'Reference video', VEO_GENERATED_DURATION_SEC);
      const generationResult = await dbHelpers.recordGenerationSuccess(userId);
      if (!generationResult.error && generationResult.data) {
        setUsedGenerations(generationResult.data.used);
        setRemainingGenerations(generationResult.data.remaining);
      } else {
        setRemainingGenerations(recordGenerationSuccess(userId, currentPlan === 'none' ? null : currentPlan));
        setUsedGenerations(getGenerationCountForUser(userId));
      }
      setShowVadeoAdModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`Reference-video generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleStartCreator = async (aspectRatio: AspectRatio, duration: number, websiteUrl: string, brief: string, headline: string, cta: string, files: File[], audioEnabled: boolean, audioType: 'auto' | 'dialogue' | 'sound-effects' | 'ambient') => {
    if (!isAdminUser && currentPlan !== 'standard' && currentPlan !== 'premium') {
      alert('Motion AI is available on Standard and Premium.');
      setShowCreditsModal(true);
      return;
    }

    if (!isAdminUser && remainingMotionAiRuns <= 0) {
      setSettingsError('Motion AI usage is depleted for your current plan. Upgrade or renew to continue.');
      setShowSettingsModal(true);
      return;
    }

    if (files.length === 0) {
      alert('Upload at least one image to start Motion AI.');
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, VADEO_MAX_AD_IMAGES);
    if (imageFiles.length === 0) {
      alert('Motion AI currently supports image uploads only.');
      return;
    }

    const targetDims = ASPECT_RATIOS[aspectRatio];
    if (!targetDims) {
      alert('Unsupported aspect ratio for Motion AI.');
      return;
    }

    setIsGenerating(true);
    setStatusText('Preparing Motion AI generation...');

    try {
      syncCanvasToAspectRatio(aspectRatio);
      const motionAiResolution = getGenerationResolution();

      const imageInputs = await Promise.all(imageFiles.map(async (file) => {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result.split(',')[1] || '' : '';
            if (!result) {
              reject(new Error('Failed to read uploaded image.'));
              return;
            }
            resolve(result);
          };
          reader.onerror = () => reject(new Error('Failed to read uploaded image.'));
          reader.readAsDataURL(file);
        });

        return {
          base64,
          mimeType: file.type || 'image/png'
        };
      }));

      const normalizedRatio = normalizeVeoAspectRatio(aspectRatio);
      const promptContext = [
        websiteUrl ? `Brand website: ${websiteUrl}.` : null,
        headline ? `Headline: ${headline}.` : null,
        cta ? `CTA: ${cta}.` : null,
        brief ? `Creative brief: ${brief}.` : null,
      ].filter(Boolean).join(' ');

      const segmentPrompts = [
        [
          'Create the opening segment of a premium 15-second social video ad.',
          'Focus on the hook, immediate visual interest, and product introduction.',
          'Do not bake any text, subtitles, logos, lower thirds, or CTA buttons into the video because they will be added in post.',
          promptContext
        ].filter(Boolean).join(' '),
        [
          'Create the closing segment of a premium 15-second social video ad.',
          'Focus on product payoff, benefit emphasis, and a strong closing hero moment that sets up the CTA.',
          'Keep continuity with the opening segment in styling, subject, lighting, and motion language.',
          'Do not bake any text, subtitles, logos, lower thirds, or CTA buttons into the video because they will be added in post.',
          promptContext
        ].filter(Boolean).join(' ')
      ];

      setStatusText('Generating Motion AI clip 1 of 2...');
      const firstClipUrl = await aiService.generateVideoAdFromImages(
        imageInputs,
        segmentPrompts[0],
        normalizedRatio,
        motionAiResolution,
        (status) => setStatusText(`Clip 1: ${status}`),
        false,
        audioEnabled,
        audioType
      );

      setStatusText('Generating Motion AI clip 2 of 2...');
      const secondClipUrl = await aiService.generateVideoAdFromImages(
        imageInputs,
        segmentPrompts[1],
        normalizedRatio,
        motionAiResolution,
        (status) => setStatusText(`Clip 2: ${status}`),
        false,
        audioEnabled,
        audioType
      );

      const buildCoverPlacement = (assetWidth: number, assetHeight: number) => {
        const scale = Math.max(targetDims.w / assetWidth, targetDims.h / assetHeight);
        const width = assetWidth * scale;
        const height = assetHeight * scale;
        return {
          x: (targetDims.w - width) / 2,
          y: (targetDims.h - height) / 2,
          width,
          height,
        };
      };

      const loadVideoMetadata = (src: string) => new Promise<{ src: string; width: number; height: number; durationSec: number }>((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          resolve({
            src,
            width: video.videoWidth || targetDims.w,
            height: video.videoHeight || targetDims.h,
            durationSec: video.duration || VEO_GENERATED_DURATION_SEC
          });
        };
        video.onerror = () => reject(new Error('Failed to load generated Motion AI video.'));
        video.src = src;
      });

      const [firstClip, secondClip] = await Promise.all([
        loadVideoMetadata(firstClipUrl),
        loadVideoMetadata(secondClipUrl)
      ]);

      const totalDurationMs = Math.max(15000, duration * 1000);
      const firstStartMs = 0;
      const firstEndMs = 8000;
      const secondStartMs = 7000;
      const secondEndMs = totalDurationMs;

      const buildVideoLayer = (
        name: string,
        clip: { src: string; width: number; height: number; durationSec: number },
        startMs: number,
        endMs: number,
        isFirst: boolean,
      ): ImageLayer => {
        const placement = buildCoverPlacement(clip.width, clip.height);
        const clipDurationMs = Math.round((clip.durationSec || VEO_GENERATED_DURATION_SEC) * 1000);
        const fadeMs = 1000;
        return {
          id: uuidv4(),
          name,
          type: LayerType.IMAGE,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          rotation: 0,
          opacity: isFirst ? 1 : 0,
          src: clip.src,
          mediaType: 'video',
          playing: true,
          loop: false,
          volume: 1,
          currentTime: 0,
          duration: clip.durationSec || VEO_GENERATED_DURATION_SEC,
          audioFadeInMs: audioEnabled ? GENERATED_AUDIO_FADE_MS : 0,
          audioFadeOutMs: audioEnabled ? GENERATED_AUDIO_FADE_MS : 0,
          clipStartMs: startMs,
          clipEndMs: endMs,
          visible: true,
          locked: false,
          keyframes: [
            { time: 0, opacity: isFirst ? 1 : 0, currentTime: 0 },
            { time: startMs, opacity: isFirst ? 1 : 0, currentTime: 0 },
            { time: Math.min(endMs, startMs + fadeMs), opacity: 1, currentTime: Math.min(clipDurationMs, fadeMs) / 1000 },
            { time: Math.max(startMs + fadeMs, endMs - fadeMs), opacity: 1, currentTime: Math.max(0, clipDurationMs - fadeMs) / 1000 },
            { time: endMs, opacity: endMs >= totalDurationMs ? 1 : 0, currentTime: Math.min(clipDurationMs, endMs - startMs) / 1000 },
            { time: totalDurationMs, opacity: endMs >= totalDurationMs ? 1 : 0, currentTime: clip.durationSec || VEO_GENERATED_DURATION_SEC },
          ]
        };
      };

      const primaryHeadline = headline.trim() || 'Motion AI';
      const briefLine = brief.trim() || '';
      const primaryCta = cta.trim() || 'Start Free Trial';

      const pages: Page[] = [{
        id: uuidv4(),
        name: 'Scene 1',
        aspectRatio,
        width: targetDims.w,
        height: targetDims.h,
        backgroundColor: '#050505',
        layers: [
          buildVideoLayer('Motion AI Clip 1', firstClip, firstStartMs, firstEndMs, true),
          buildVideoLayer('Motion AI Clip 2', secondClip, secondStartMs, secondEndMs, false),
          {
            id: uuidv4(),
            name: 'Motion AI Overlay',
            type: LayerType.RECT,
            x: 0,
            y: targetDims.h * 0.58,
            width: targetDims.w,
            height: targetDims.h * 0.42,
            rotation: 0,
            opacity: 0.72,
            fill: '#050505',
            stroke: '#050505',
            strokeWidth: 0,
            cornerRadius: 0,
            visible: true,
            locked: false,
          } as ShapeLayer,
          {
            id: uuidv4(),
            name: 'Motion AI Title',
            type: LayerType.TEXT,
            x: targetDims.w * 0.08,
            y: targetDims.h * 0.65,
            width: targetDims.w * 0.7,
            height: 160,
            rotation: 0,
            opacity: 1,
            text: primaryHeadline,
            fontSize: Math.max(42, Math.round(targetDims.w * 0.04)),
            fontFamily: 'Helvetica',
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'left',
            letterSpacing: 0,
            lineHeight: 1.05,
            visible: true,
            locked: false,
          } as TextLayer,
          ...(briefLine ? [{
            id: uuidv4(),
            name: 'Motion AI Detail',
            type: LayerType.TEXT,
            x: targetDims.w * 0.08,
            y: targetDims.h * 0.77,
            width: targetDims.w * 0.64,
            height: 120,
            rotation: 0,
            opacity: 0.95,
            text: briefLine,
            fontSize: Math.max(18, Math.round(targetDims.w * 0.013)),
            fontFamily: 'Helvetica',
            fontWeight: 'normal',
            fill: '#d4d4d8',
            align: 'left',
            letterSpacing: 0,
            lineHeight: 1.35,
            visible: true,
            locked: false,
          } as TextLayer] : []),
          {
            id: uuidv4(),
            name: 'Motion AI CTA',
            type: LayerType.TEXT,
            x: targetDims.w * 0.08,
            y: targetDims.h * 0.905,
            width: targetDims.w * 0.55,
            height: 50,
            rotation: 0,
            opacity: 1,
            text: primaryCta,
            fontSize: Math.max(18, Math.round(targetDims.w * 0.014)),
            fontFamily: 'Helvetica',
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'left',
            letterSpacing: 0.5,
            lineHeight: 1.2,
            visible: true,
            locked: false,
          } as TextLayer
        ]
      }];

      setEditorState(prev => ({
        ...prev,
        pages,
        activePageId: pages[0].id,
        history: [[...pages]],
        historyIndex: 0,
        selectedLayerId: null,
        selectedLayerIds: [],
        playheadTime: 0,
        isPlaying: false,
        selectedKeyframe: null,
      }));

      setProjectName((current) => current === 'Untitled Design' || current === 'Untitled Project' ? (primaryHeadline || 'Motion AI Draft') : current);
      setLastSaved(null);
      setIsNewProject(false);
      setShowVadeoAdModal(false);
      setActiveTool('select');

      const motionAiResult = await dbHelpers.recordMotionAiSuccess(userId);
      if (!motionAiResult.error && motionAiResult.data) {
        setUsedMotionAiRuns(motionAiResult.data.used || 0);
        setRemainingMotionAiRuns(motionAiResult.data.remaining || 0);
        setMotionAiLimit(motionAiResult.data.limit || 0);
      }

      setCreatorNotice(`Motion AI created a 15s ${motionAiResolution} draft with 2 Veo segments and Remotion-style overlays.`);
      window.setTimeout(() => setCreatorNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(`Motion AI generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleStartMotion = async (aspectRatio: AspectRatio, duration: number, animation: MotionAnimationPreset, timingPrompt: string, brief: string, headline: string, cta: string, files: File[]) => {
    if (files.length === 0) {
      alert('Upload at least one image or video to start Motion.');
      return;
    }

    const targetDims = ASPECT_RATIOS[aspectRatio];
    if (!targetDims) {
      alert('Unsupported aspect ratio for Motion.');
      return;
    }

    const readMotionAsset = (file: File) => new Promise<{
      src: string;
      width: number;
      height: number;
      mediaType: 'image' | 'video';
      durationSec?: number;
    }>((resolve, reject) => {
      const src = URL.createObjectURL(file);

      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          resolve({
            src,
            width: video.videoWidth || targetDims.w,
            height: video.videoHeight || targetDims.h,
            mediaType: 'video',
            durationSec: video.duration || undefined,
          });
        };
        video.onerror = () => reject(new Error('Failed to load uploaded video.'));
        video.src = src;
        return;
      }

      const image = new Image();
      image.onload = () => {
        resolve({
          src,
          width: image.naturalWidth || targetDims.w,
          height: image.naturalHeight || targetDims.h,
          mediaType: 'image',
        });
      };
      image.onerror = () => reject(new Error('Failed to load uploaded image.'));
      image.src = src;
    });

    const parseTimingPromptMs = (input: string) => {
      const normalized = input.trim().toLowerCase();
      if (!normalized) return null;

      const valueMatch = normalized.match(/(\d+(?:\.\d+)?)/);
      if (!valueMatch) return null;

      const value = Number(valueMatch[1]);
      if (!Number.isFinite(value) || value <= 0) return null;

      if (normalized.includes('ms') || normalized.includes('millisecond')) {
        return Math.round(value);
      }

      return Math.round(value * 1000);
    };

    try {
      const assets = await Promise.all(files.map(readMotionAsset));
      const primaryHeadline = headline.trim() || 'Create Video Ads';
      const primaryCta = cta.trim() || 'Start Free Trial';
      const briefLine = brief.trim();
      const requestedStepMs = parseTimingPromptMs(timingPrompt) || 3000;

      const buildCoverPlacement = (assetWidth: number, assetHeight: number) => {
        const scale = Math.max(targetDims.w / assetWidth, targetDims.h / assetHeight);
        const width = assetWidth * scale;
        const height = assetHeight * scale;
        return {
          x: (targetDims.w - width) / 2,
          y: (targetDims.h - height) / 2,
          width,
          height,
        };
      };

      const assetSegmentDurationsMs = assets.map((asset) => {
        if (asset.mediaType === 'video' && asset.durationSec && asset.durationSec > 0) {
          return Math.max(requestedStepMs, Math.round(asset.durationSec * 1000));
        }
        return requestedStepMs;
      });
      const computedDurationMs = assetSegmentDurationsMs.reduce((sum, segmentMs) => sum + segmentMs, 0);
      const totalDurationMs = Math.max(duration * 1000, computedDurationMs);
      const transitionMs = Math.min(1000, Math.max(400, requestedStepMs * 0.3));

      const resolveAnimationPreset = (assetIndex: number): Exclude<MotionAnimationPreset, 'random-mix'> => {
        if (animation !== 'random-mix') {
          return animation;
        }

        const curatedMix: Array<Exclude<MotionAnimationPreset, 'random-mix'>> = [
          'ken-burns',
          'crossfade',
          'slide-left',
          'zoom-in',
          'fade',
          'slide-up',
        ];

        return curatedMix[assetIndex % curatedMix.length];
      };

      const getMotionKeyframes = (
        index: number,
        startMs: number,
        endMs: number,
        fadeInStart: number,
        fadeInEnd: number,
        fadeOutStart: number,
        fadeOutEnd: number,
        basePlacement: { x: number; y: number; width: number; height: number }
      ) => {
        const resolvedAnimation = resolveAnimationPreset(index);
        const isFirst = index === 0;
        const isLast = index === assets.length - 1;
        const defaultFrames = [
          { time: 0, opacity: isFirst ? 1 : 0 },
          { time: fadeInStart, opacity: isFirst ? 1 : 0 },
          { time: fadeInEnd, opacity: 1 },
          { time: fadeOutStart, opacity: 1 },
          { time: fadeOutEnd, opacity: isLast ? 1 : 0 },
          { time: totalDurationMs, opacity: isLast ? 1 : 0 }
        ];

        if (resolvedAnimation === 'fade' || resolvedAnimation === 'crossfade') {
          return defaultFrames;
        }

        if (resolvedAnimation === 'slide-up') {
          return [
            { time: 0, opacity: isFirst ? 1 : 0, y: basePlacement.y + (isFirst ? 0 : 60) },
            { time: fadeInStart, opacity: isFirst ? 1 : 0, y: basePlacement.y + (isFirst ? 0 : 60) },
            { time: fadeInEnd, opacity: 1, y: basePlacement.y },
            { time: fadeOutStart, opacity: 1, y: basePlacement.y },
            { time: fadeOutEnd, opacity: isLast ? 1 : 0, y: isLast ? basePlacement.y : basePlacement.y - 40 },
            { time: totalDurationMs, opacity: isLast ? 1 : 0, y: isLast ? basePlacement.y : basePlacement.y - 40 }
          ];
        }

        if (resolvedAnimation === 'slide-left') {
          return [
            { time: 0, opacity: isFirst ? 1 : 0, x: basePlacement.x + (isFirst ? 0 : 80) },
            { time: fadeInStart, opacity: isFirst ? 1 : 0, x: basePlacement.x + (isFirst ? 0 : 80) },
            { time: fadeInEnd, opacity: 1, x: basePlacement.x },
            { time: fadeOutStart, opacity: 1, x: basePlacement.x },
            { time: fadeOutEnd, opacity: isLast ? 1 : 0, x: isLast ? basePlacement.x : basePlacement.x - 60 },
            { time: totalDurationMs, opacity: isLast ? 1 : 0, x: isLast ? basePlacement.x : basePlacement.x - 60 }
          ];
        }

        if (resolvedAnimation === 'zoom-in') {
          const startScale = 1.08;
          const startWidth = basePlacement.width * startScale;
          const startHeight = basePlacement.height * startScale;
          const startX = basePlacement.x - (startWidth - basePlacement.width) / 2;
          const startY = basePlacement.y - (startHeight - basePlacement.height) / 2;
          const endScale = 1.16;
          const endWidth = basePlacement.width * endScale;
          const endHeight = basePlacement.height * endScale;
          const endX = basePlacement.x - (endWidth - basePlacement.width) / 2;
          const endY = basePlacement.y - (endHeight - basePlacement.height) / 2;
          return [
            { time: 0, opacity: isFirst ? 1 : 0, x: startX, y: startY, width: startWidth, height: startHeight },
            { time: fadeInStart, opacity: isFirst ? 1 : 0, x: startX, y: startY, width: startWidth, height: startHeight },
            { time: fadeInEnd, opacity: 1, x: startX, y: startY, width: startWidth, height: startHeight },
            { time: Math.max(fadeInEnd, endMs - transitionMs), opacity: 1, x: endX, y: endY, width: endWidth, height: endHeight },
            { time: fadeOutEnd, opacity: isLast ? 1 : 0, x: endX, y: endY, width: endWidth, height: endHeight },
            { time: totalDurationMs, opacity: isLast ? 1 : 0, x: endX, y: endY, width: endWidth, height: endHeight }
          ];
        }

        if (resolvedAnimation === 'ken-burns') {
          const startScale = 1.08;
          const endScale = 1.18;
          const startWidth = basePlacement.width * startScale;
          const startHeight = basePlacement.height * startScale;
          const endWidth = basePlacement.width * endScale;
          const endHeight = basePlacement.height * endScale;
          const panOffsetX = Math.min(120, targetDims.w * 0.04);
          const panOffsetY = Math.min(80, targetDims.h * 0.03);
          const startX = basePlacement.x - (startWidth - basePlacement.width) / 2 - panOffsetX / 2;
          const startY = basePlacement.y - (startHeight - basePlacement.height) / 2 + panOffsetY / 2;
          const endX = basePlacement.x - (endWidth - basePlacement.width) / 2 + panOffsetX / 2;
          const endY = basePlacement.y - (endHeight - basePlacement.height) / 2 - panOffsetY / 2;
          return [
            { time: 0, opacity: isFirst ? 1 : 0, x: startX, y: startY, width: startWidth, height: startHeight },
            { time: fadeInStart, opacity: isFirst ? 1 : 0, x: startX, y: startY, width: startWidth, height: startHeight },
            { time: fadeInEnd, opacity: 1, x: startX, y: startY, width: startWidth, height: startHeight },
            { time: Math.max(fadeInEnd, endMs - transitionMs), opacity: 1, x: endX, y: endY, width: endWidth, height: endHeight },
            { time: fadeOutEnd, opacity: isLast ? 1 : 0, x: endX, y: endY, width: endWidth, height: endHeight },
            { time: totalDurationMs, opacity: isLast ? 1 : 0, x: endX, y: endY, width: endWidth, height: endHeight }
          ];
        }

        return defaultFrames;
      };

      let segmentCursorMs = 0;
      const mediaLayers: Layer[] = assets.map((asset, index) => {
        const placement = buildCoverPlacement(asset.width, asset.height);
        const layerId = uuidv4();
        const segmentDurationMs = assetSegmentDurationsMs[index];
        const startMs = segmentCursorMs;
        const endMs = segmentCursorMs + segmentDurationMs;
        const fadeInStart = index === 0 ? 0 : Math.max(0, startMs - transitionMs / 2);
        const fadeInEnd = index === 0 ? 0 : startMs + transitionMs / 2;
        const fadeOutStart = index === assets.length - 1 ? totalDurationMs : Math.max(startMs, endMs - transitionMs / 2);
        const fadeOutEnd = index === assets.length - 1 ? totalDurationMs : Math.min(totalDurationMs, endMs + transitionMs / 2);
        segmentCursorMs = endMs;

        return {
          id: layerId,
          name: `Motion Asset ${index + 1}`,
          type: LayerType.IMAGE,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          rotation: 0,
          opacity: index === 0 ? 1 : 0,
          src: asset.src,
          mediaType: asset.mediaType,
          playing: asset.mediaType === 'video',
          loop: false,
          volume: asset.mediaType === 'video' ? 1 : undefined,
          currentTime: asset.mediaType === 'video' ? 0 : undefined,
          duration: asset.mediaType === 'video' ? (asset.durationSec || segmentDurationMs / 1000) : undefined,
          visible: true,
          locked: false,
          keyframes: getMotionKeyframes(index, startMs, endMs, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, placement)
        } as ImageLayer;
      });

      const motionLayers: Layer[] = [
        ...mediaLayers,
        {
          id: uuidv4(),
          name: 'Motion Overlay',
          type: LayerType.RECT,
          x: 0,
          y: targetDims.h * 0.58,
          width: targetDims.w,
          height: targetDims.h * 0.42,
          rotation: 0,
          opacity: 0.72,
          fill: '#050505',
          stroke: '#050505',
          strokeWidth: 0,
          cornerRadius: 0,
          visible: true,
          locked: false,
        } as ShapeLayer,
        {
          id: uuidv4(),
          name: 'Motion Title',
          type: LayerType.TEXT,
          x: targetDims.w * 0.08,
          y: targetDims.h * 0.65,
          width: targetDims.w * 0.7,
          height: 160,
          rotation: 0,
          opacity: 1,
          text: primaryHeadline,
          fontSize: Math.max(42, Math.round(targetDims.w * 0.04)),
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#ffffff',
          align: 'left',
          letterSpacing: 0,
          lineHeight: 1.05,
          visible: true,
          locked: false,
        } as TextLayer,
      ];

      if (briefLine) {
        motionLayers.push({
          id: uuidv4(),
          name: 'Motion Detail',
          type: LayerType.TEXT,
          x: targetDims.w * 0.08,
          y: targetDims.h * 0.77,
          width: targetDims.w * 0.64,
          height: 120,
          rotation: 0,
          opacity: 0.95,
          text: briefLine,
          fontSize: Math.max(18, Math.round(targetDims.w * 0.013)),
          fontFamily: 'Helvetica',
          fontWeight: 'normal',
          fill: '#d4d4d8',
          align: 'left',
          letterSpacing: 0,
          lineHeight: 1.35,
          visible: true,
          locked: false,
        } as TextLayer);
      }

      motionLayers.push(
        {
          id: uuidv4(),
          name: 'Motion CTA',
          type: LayerType.TEXT,
          x: targetDims.w * 0.08,
          y: targetDims.h * 0.905,
          width: targetDims.w * 0.55,
          height: 50,
          rotation: 0,
          opacity: 1,
          text: primaryCta,
          fontSize: Math.max(18, Math.round(targetDims.w * 0.014)),
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fill: '#ffffff',
          align: 'left',
          letterSpacing: 0.5,
          lineHeight: 1.2,
          visible: true,
          locked: false,
        } as TextLayer
      );

      const pages: Page[] = [{
        id: uuidv4(),
        name: 'Scene 1',
        aspectRatio,
        width: targetDims.w,
        height: targetDims.h,
        backgroundColor: '#050505',
        layers: motionLayers,
      }];

      setEditorState(prev => ({
        ...prev,
        pages,
        activePageId: pages[0].id,
        history: [[...pages]],
        historyIndex: 0,
        selectedLayerId: null,
        selectedLayerIds: [],
        playheadTime: 0,
        isPlaying: false,
        selectedKeyframe: null,
      }));
      setProjectName((current) => current === 'Untitled Design' || current === 'Untitled Project' ? (primaryHeadline || 'Motion Draft') : current);
      setLastSaved(null);
      setShowMotionModal(false);
      setActiveTool('select');

      const summaryParts = [
        `Motion draft created in ${aspectRatio}.`,
        `${files.length} asset${files.length > 1 ? 's' : ''} sequenced in one scene.`,
        animation === 'random-mix' ? 'Animation: random mix.' : `Animation: ${animation.replace('-', ' ')}.`,
        timingPrompt.trim() ? `Timing: ${timingPrompt.trim()}.` : `${duration}s selected.`,
      ];

      setCreatorNotice(summaryParts.join(' '));
      window.setTimeout(() => {
        setCreatorNotice(null);
      }, 4000);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to build motion draft.');
    }
  };

  /* --- EXPORT LOGIC --- */


  /* --- EXPORT LOGIC (Refactored to Hook) --- */
  const {
    executeExport,
    hasVideo,
    maxVideoDuration,
    isExporting: hookIsExporting,
    downloadReadyUrl,
    downloadReadyFilename,
    setDownloadReadyUrl
  } = useExport({
    stageRef,
    activePage,
    projectName,
    playheadTime: editorState.playheadTime,
    isPlaying: editorState.isPlaying,
    onExportComplete: (config) => {
      if (
        config.format === 'video' &&
        !DEV_BYPASS_CREDITS &&
        !isAdminUser &&
        hasTrialEditorAccess &&
        isMotionProject &&
        userId
      ) {
        const nextCount = trialMotionDownloadsUsed + 1;
        setTrialMotionDownloadsUsed(nextCount);
        void dbHelpers.updateTrialState({ motionDownloadsUsed: nextCount }).catch((error) => {
          console.error('Failed to persist trial motion download count:', error);
        });
      }
    },
    selectedLayerId: editorState.selectedLayerId,
    selectedLayerIds: editorState.selectedLayerIds,
    selectedKeyframe: editorState.selectedKeyframe,
    setEditorState,
    updateActivePage,
    setStatusText,
    setExportProgress
  });

  // Sync local exporting state with hook
  useEffect(() => {
    setIsExporting(hookIsExporting);
  }, [hookIsExporting]);

  // Restore Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        isCanvasEditing;

      if (e.code === 'Space' && !isInputActive) {
        setIsSpacePressed(true);
        e.preventDefault();
      }

      if (!isInputActive) {
        if (e.key.toLowerCase() === 'v') setActiveTool('select');
        if (e.key.toLowerCase() === 'h') setActiveTool('hand');
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        centerWorkspace();
      }

      if (isInputActive) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) handleRedo(); else handleUndo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSaveProject(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); if (editorState.selectedLayerId) duplicateLayer(editorState.selectedLayerId); }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (editorState.selectedLayerId) {
          const newLayers = activePage.layers.filter(l => l.id !== editorState.selectedLayerId);
          updateActivePage({ layers: newLayers });
          setEditorState(prev => ({ ...prev, selectedLayerId: null }));
        }
      }

      // Keyboard Nudging
      const nudgeKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (nudgeKeys.includes(e.key) && (editorState.selectedLayerId || (editorState.selectedLayerIds && editorState.selectedLayerIds.length > 0))) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const targetIds = editorState.selectedLayerIds && editorState.selectedLayerIds.length > 0
          ? editorState.selectedLayerIds
          : [editorState.selectedLayerId!];

        targetIds.forEach(id => {
          const layer = activePage.layers.find(l => l.id === id);
          if (layer) {
            const updates: any = {};
            if (e.key === 'ArrowUp') updates.y = layer.y - step;
            if (e.key === 'ArrowDown') updates.y = layer.y + step;
            if (e.key === 'ArrowLeft') updates.x = layer.x - step;
            if (e.key === 'ArrowRight') updates.x = layer.x + step;
            updateLayer(id, updates);
          }
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [editorState.selectedLayerId, activePage.layers, updateActivePage, handleUndo, handleRedo, duplicateLayer, projectName, projectId, centerWorkspace, isCanvasEditing]);

  const handleConfirmExport = (config: ExportConfig) => {
    if (isTrialMotionExportLocked) {
      setSettingsError('Your free trial includes 2 Motion downloads. Subscribe to export more Motion videos.');
      setShowSettingsModal(true);
      setShowExportDialog(false);
      return;
    }
    setShowExportDialog(false);
    executeExport(config);
  };

  const handleCanvasEditingToggle = (editing: boolean) => {
    setIsCanvasEditing(editing);
    if (editing) {
      setActiveTool('select');
    }
  };


  /* --- NEW PROJECT HANDLER --- */
  const handleCreateNewProject = () => {
    // Reset to a clean state
    setProjectId(uuidv4());
    setProjectName('Untitled Design');
    setIsNewProject(true); // Enable new project state so it doesn't auto-save immediately
    setLastSaved(null);

    const initialPage: Page = {
      id: DEFAULT_PAGE_ID,
      name: 'Scene 1',
      aspectRatio: '16:9',
      width: ASPECT_RATIOS['16:9'].w,
      height: ASPECT_RATIOS['16:9'].h,
      backgroundColor: '#ffffff',
      layers: [],
    };

    setEditorState({
      pages: [initialPage],
      activePageId: DEFAULT_PAGE_ID,
      zoom: 0.1,
      pan: { x: 0, y: 0 },
      selectedLayerId: null,
      history: [[initialPage]],
      historyIndex: 0,
      isPro: DEV_BYPASS_CREDITS ? true : currentPlan === 'premium',
      selectedLayerIds: [],
      playheadTime: 0,
      isPlaying: false,
      selectedKeyframe: null
    });

    setShowGallery(false);
  };


  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none z-[100]">
      <input
        id={IMAGE_UPLOAD_INPUT_ID}
        ref={imageUploadInputRef}
        type="file"
        accept="image/*"
        className="absolute w-px h-px opacity-0 -left-[9999px] top-0"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadedFile(file, 'IMAGE_UPLOAD');
          e.target.value = '';
        }}
      />
      <input
        id={VIDEO_UPLOAD_INPUT_ID}
        ref={videoUploadInputRef}
        type="file"
        accept="video/*"
        className="absolute w-px h-px opacity-0 -left-[9999px] top-0"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadedFile(file, 'VIDEO_UPLOAD');
          e.target.value = '';
        }}
      />
      {showGallery && (
        <ProjectGallery
          onClose={() => setShowGallery(false)}
          onLoadProject={handleLoadProject}
          onNewProject={handleCreateNewProject}
          useLocalProjects={DEV_BYPASS_AUTH_SAVE && !userId}
        />
      )}
      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} onConfirm={handleConfirmExport} aspectRatio={activePage.aspectRatio} currentWidth={activePage.width} currentHeight={activePage.height} hasVideo={hasVideo} suggestedDuration={Math.max(maxVideoDuration, Math.round(timelineDurationMs / 1000))} isPro={hasPremiumAccess} onShowPro={() => setShowProModal(true)} />}
      {showProModal && !DEV_BYPASS_CREDITS && <ProModal onClose={() => setShowProModal(false)} onUpgrade={handleUpgrade} />}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        accountName={accountName}
        currentPlanLabel={planLabel}
        currentPlanStatus={
          isAdminUser
            ? 'admin access'
            : isTrialActive
              ? '24-hour access'
              : isTrialExpired
                ? 'expired'
                : currentPlan === 'none'
                  ? 'inactive'
                  : 'active'
        }
        usageCopy={
          isAdminUser
            ? 'Admin access is active. You can enter the editor without a paid plan.'
            : isTrialActive
              ? `Your 24-hour free trial is active. Workspace access and Motion are enabled, but video generations are not included during trial. ${remainingTrialMotionDownloads} of ${TRIAL_MOTION_DOWNLOAD_LIMIT} Motion downloads remaining.`
              : isTrialExpired
                ? `Choose a paid plan to continue inside Vadeo. ${remainingTrialMotionDownloads} of ${TRIAL_MOTION_DOWNLOAD_LIMIT} Motion downloads remaining.`
              : currentPlan === 'premium' || currentPlan === 'standard'
                ? `${usedGenerations} of ${PLAN_GENERATION_LIMIT} generations used. ${remainingGenerations} remaining. Motion AI: ${usedMotionAiRuns} of ${motionAiLimit} used. ${remainingMotionAiRuns} remaining.`
                : currentPlan === 'starter'
                ? 'Starter is active. Generation tools are disabled on this plan.'
                : 'Choose a plan to unlock editor access and generation.'
        }
        canManageBilling={!isAdminUser && currentPlan !== 'none'}
        onManageBilling={() => void handleManageBilling()}
        onUpgradeStarter={() => handlePlanSelectFromSettings('starter')}
        onUpgradeStandard={() => handlePlanSelectFromSettings('standard')}
        onUpgradePremium={() => handlePlanSelectFromSettings('premium')}
        onLogout={() => void handleSettingsLogout()}
        busyAction={settingsBusyAction}
        error={settingsError}
      />
      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} onGenerate={handleConfirmAI} />}
      {showVadeoAdModal && (
        <VadeoAdModal
          onClose={() => setShowVadeoAdModal(false)}
          onGenerateText={handleGenerateTextVideo}
          onGenerateFrameVideo={handleGenerateFrameVideo}
          onGenerateRefVideo={handleGenerateReferenceVideo}
          onStartCreator={handleStartCreator}
          isGenerating={isGenerating}
          initialAspectRatio={activePage.aspectRatio}
        />
      )}
      {showMotionModal && (
        <MotionModal
          onClose={() => setShowMotionModal(false)}
          onStartMotion={handleStartMotion}
          isGenerating={isGenerating}
          initialAspectRatio={activePage.aspectRatio}
        />
      )}

      {showCreditsModal && (
        <CreditsModal
          onClose={() => setShowCreditsModal(false)}
          onSelectPlan={(planId) => {
            if (planId === 'STARTER') {
              applyPlan('starter');
            } else if (planId === 'PRO') {
              applyPlan('standard');
            } else {
              applyPlan('premium');
            }
            setShowCreditsModal(false);
          }}
        />
      )}

      {/* AI LOADING OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6 p-8 bg-zinc-900/90 border border-white/10 rounded-3xl shadow-2xl max-w-sm text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-white animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Creating Magic</h3>
              <p className="text-sm text-zinc-400">{statusText || "Processing..."}</p>
            </div>
          </div>
        </div>
      )}
      {isExporting && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center gap-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${exportProgress}%` }} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-black text-white uppercase tracking-[0.2em] animate-pulse">
              {statusText}
            </p>
            <span className="text-[10px] text-zinc-500 font-mono">{Math.round(exportProgress)}% COMPLETE</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="h-16 bg-[#0f0f11] border-b border-zinc-800 flex items-center px-4 justify-between select-none z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 w-48"
              placeholder="Untitled Project"
            />
            <span className="text-[10px] text-zinc-500">
              {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'Unsaved changes'}
            </span>
          </div>
          {/* Plan Display */}
          <div className="h-8 w-px bg-zinc-800 mx-2" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 ${hasGenerationAccess ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-300 border-amber-500/30 bg-amber-500/10'}`}>
            <Zap size={14} className={hasGenerationAccess ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-xs font-bold">{planLabel}</span>
          </div>

          {!DEV_BYPASS_CREDITS && !hasGenerationAccess && (
            <button
              onClick={() => setShowCreditsModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse transition-all"
            >
              <Crown size={14} />
              Upgrade Plan
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 ml-2">
          <button onClick={handleSaveProject} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 text-sm font-bold text-zinc-300 rounded-lg transition-all border border-zinc-700/50">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : lastSaved ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Save size={16} />}
            {isSaving ? 'Saving' : lastSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => setShowGallery(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-zinc-300 rounded-lg transition-all border border-zinc-700/50">
              <Library size={16} /> Open
            </button>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={handleTriggerVadeoAd}
              disabled={!hasGenerationAccess}
              className={`p-2 rounded transition-colors ${
                hasGenerationAccess
                  ? 'hover:bg-zinc-800 text-white'
                  : 'text-zinc-700 cursor-not-allowed opacity-50'
              }`}
              title={hasGenerationAccess ? 'Create Video Ad' : 'Upgrade to Standard or Premium'}
            >
              <Sparkles size={18} strokeWidth={1.9} fill="currentColor" />
            </button>
            <button
              onClick={() => setShowMotionModal(true)}
              className="px-3 py-2 rounded text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Open Motion"
            >
              Motion
            </button>
            <button onClick={handleUndo} disabled={editorState.historyIndex <= 0} className="p-2 hover:bg-zinc-800 disabled:opacity-20 rounded transition-colors"><Undo2 size={18} /></button>
            <button onClick={handleRedo} disabled={editorState.historyIndex >= editorState.history.length - 1} className="p-2 hover:bg-zinc-800 disabled:opacity-20 rounded transition-colors"><Redo2 size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"><ZoomOut size={16} /></button>
            <div className="px-2 text-xs font-medium text-zinc-100 min-w-[48px] text-center">{Math.round(editorState.zoom * 100)}%</div>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"><ZoomIn size={16} /></button>
          </div>

          {/* Grid Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowGridMenu(!showGridMenu)}
              className={`p-2 rounded hover:bg-zinc-800 transition-colors ${activeGrid !== 'none' ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-400'}`}
              title="Canvas Grids"
            >
              <Grid size={18} />
            </button>
            {showGridMenu && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1e1e20] border border-zinc-700 rounded-lg shadow-xl p-1.5 min-w-[140px] z-[60] flex flex-col gap-1">
                {(['none', 'thirds', '4x4', '6x6', 'swiss', 'fibonacci', 'golden', 'bauhaus'] as GridType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => { setActiveGrid(type); setShowGridMenu(false); }}
                    className={`text-left px-3 py-2 rounded text-xs font-medium transition-colors ${activeGrid === type ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
                  >
                    {type === 'none' ? 'No Grid' :
                      type === 'thirds' ? 'Rule of Thirds' :
                        type === 'swiss' ? 'Swiss Grid' :
                          type === 'fibonacci' ? 'Fibonacci (Phi)' :
                            type === 'golden' ? 'Golden Triangle' :
                              type === 'bauhaus' ? 'Bauhaus (Geometric)' :
                                `${type} Grid`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={centerWorkspace} className="p-2 hover:bg-zinc-800 rounded text-zinc-400" title="Fit to Screen (Ctrl+0)"><Maximize2 size={18} /></button>
          <button
            onClick={() => {
              if (isTrialMotionExportLocked) {
                setSettingsError('Your free trial includes 2 Motion downloads. Subscribe to export more Motion videos.');
                setShowSettingsModal(true);
                return;
              }
              setShowExportDialog(true);
            }}
            disabled={isExporting || isGenerating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
          {!DEV_BYPASS_CREDITS && !hasPremiumAccess && (
            <button
              onClick={() => setShowProModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pro-gradient text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              <Sparkles size={14} />Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {creatorNotice && (
        <div className="fixed top-20 left-1/2 z-[180] -translate-x-1/2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-100 shadow-[0_0_20px_rgba(37,99,235,0.2)] backdrop-blur">
          {creatorNotice}
        </div>
      )}

      {isDragActive && (
        <div className="absolute inset-x-0 top-[130px] bottom-0 z-[90] bg-blue-500/10 backdrop-blur-[2px] border-2 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="px-8 py-6 rounded-2xl bg-zinc-950/90 border border-blue-400/40 text-center shadow-2xl">
            <div className="text-lg font-bold text-white mb-2">Drop Images or Videos</div>
            <div className="text-sm text-zinc-400">Release to add files directly to the canvas</div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar
          onAddElement={handleAddElement}
          onToolSelect={setActiveTool}
          onRemix={handleRemix}
          onGenerateAd={handleTriggerVadeoAd}
          onOpenSettings={handleOpenSettings}
          canGenerateAds={hasGenerationAccess}
          activeTool={activeTool}
          imageUploadInputId={IMAGE_UPLOAD_INPUT_ID}
          videoUploadInputId={VIDEO_UPLOAD_INPUT_ID}
        />
        <main
          ref={workspaceRef}
          className={`flex-1 bg-zinc-950 relative overflow-hidden transition-all duration-75 ${isPanning || isSpacePressed || activeTool === 'hand' ? 'cursor-grabbing' : 'cursor-default'}`}
          onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDragActive) setIsDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const relatedTarget = e.relatedTarget as Node | null;
            if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
              setIsDragActive(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            if (e.dataTransfer?.files?.length) {
              handleDroppedFiles(e.dataTransfer.files);
            }
          }}
        >
          <div
            className="absolute origin-top-left pointer-events-none"
            style={{ transform: `translate(${editorState.pan.x}px, ${editorState.pan.y}px) scale(${editorState.zoom})` }}
          >
            <div className="bg-transparent shadow-[0_0_100px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden" style={{ width: activePage.width, height: activePage.height }}>
              <Stage
                ref={stageRef}
                width={activePage.width}
                height={activePage.height}
                onMouseDown={(e) => {
                  if (activeTool === 'hand') return;
                  if (e.target === e.target.getStage()) setEditorState(prev => ({ ...prev, selectedLayerId: null, selectedLayerIds: [] }));
                }}
              >
                <KonvaLayer>
                  <Rect width={activePage.width} height={activePage.height} fill={activePage.backgroundColor || '#ffffff'} listening={false} />
                  {activeGuides && activeGuides.x !== undefined && <Line points={[activeGuides.x, 0, activeGuides.x, activePage.height]} stroke="#ff00ff" strokeWidth={1 / editorState.zoom} dash={[4 / editorState.zoom, 4 / editorState.zoom]} />}
                  {activeGuides && activeGuides.y !== undefined && <Line points={[0, activeGuides.y, activePage.width, activeGuides.y]} stroke="#ff00ff" strokeWidth={1 / editorState.zoom} dash={[4 / editorState.zoom, 4 / editorState.zoom]} />}
                  <GridOverlay width={activePage.width} height={activePage.height} type={isExporting ? 'none' : activeGrid} />
                  {activePage.layers.map((layer) => {
                    // Use interpolated state whenever playhead is active or keyframe is selected
                    const isKeyframeSelected = editorState.selectedKeyframe?.layerId === layer.id;
                    const targetTime = isKeyframeSelected
                      ? editorState.selectedKeyframe!.time
                      : editorState.playheadTime;

                    const shouldInterpolate = editorState.isPlaying || editorState.playheadTime > 0 || isKeyframeSelected;

                    const displayLayer = shouldInterpolate
                      ? TimelineEngine.getInterpolatedLayer(layer, targetTime)
                      : layer;

                    return (<CanvasElement
                      key={layer.id}
                      layer={displayLayer}
                      page={activePage}
                      isSelected={layer.id === editorState.selectedLayerId || (editorState.selectedLayerIds || []).includes(layer.id)}
                      onSelect={(id, isMulti) => { if (activeTool === 'select') handleLayerSelect(id, isMulti); }}
                      onDragMove={setActiveGuides}
                      onChange={(updates) => updateLayer(layer.id, updates)}
                      onEditingChange={handleCanvasEditingToggle}
                    />
                    );
                  })}
                </KonvaLayer>
              </Stage>
            </div>
          </div>
        </main>

        <PropertiesPanel
          pages={editorState.pages}
          activePageId={editorState.activePageId}
          selectedLayer={(() => {
            const layerId = editorState.selectedLayerId || editorState.selectedLayerIds[0];
            const layer = activePage.layers.find(l => l.id === layerId);
            if (!layer) return null;

            // Mirror canvas rendering: use interpolated state for properties display
            const isKeyframeSelected = editorState.selectedKeyframe?.layerId === layer.id;
            const targetTime = isKeyframeSelected
              ? editorState.selectedKeyframe!.time
              : editorState.playheadTime;

            if (editorState.isPlaying || editorState.playheadTime > 0 || isKeyframeSelected) {
              return TimelineEngine.getInterpolatedLayer(layer, targetTime);
            }
            return layer;
          })()}
          isPlaying={editorState.isPlaying}
          onTogglePlay={handleTogglePlay}
          onUpdateLayer={updateLayer}
          onDuplicateLayer={duplicateLayer}
          onDeleteLayer={deleteLayer}
          onUpdatePage={updateActivePage}
          onSelectLayer={handleLayerSelect}
          onReorderLayers={reorderLayers}
          onGenerateVideo={handleTriggerAIVideo}
          onPageAction={{
            select: (id) => setEditorState(prev => ({ ...prev, activePageId: id, selectedLayerId: null })),
            add: () => {
              const newId = uuidv4();
              const newPage: Page = { ...activePage, id: newId, layers: [], name: `Scene ${editorState.pages.length + 1}`, backgroundColor: '#ffffff' };
              pushToHistory([...editorState.pages, newPage]);
              setEditorState(prev => ({ ...prev, activePageId: newId, selectedLayerId: null }));
            },
            duplicate: (id) => {
              const source = editorState.pages.find(p => p.id === id)!;
              const newId = uuidv4();
              const newPage = { ...source, id: newId, name: `${source.name} Copy` };
              pushToHistory([...editorState.pages, newPage]);
              setEditorState(prev => ({ ...prev, activePageId: newId, selectedLayerId: null }));
            },
            delete: (id) => {
              if (editorState.pages.length <= 1) return;
              const newPages = editorState.pages.filter(p => p.id !== id);
              pushToHistory(newPages);
              setEditorState(prev => ({ ...prev, activePageId: newPages[0].id, selectedLayerId: null }));
            },
            rename: (id, name) => {
              const newPages = editorState.pages.map(p => p.id === id ? { ...p, name } : p);
              pushToHistory(newPages);
            }
          }}
          onMask={handleMask}
          onUnmask={handleUnmask}
          selectedLayerIds={editorState.selectedLayerIds}
          onRemix={handleRemix}
          onAddKeyframe={handleAddKeyframe}
        />
      </div>

      <Timeline
        activePage={activePage}
        playheadTime={editorState.playheadTime}
        isPlaying={editorState.isPlaying}
        duration={timelineDurationMs}
        selectedKeyframe={editorState.selectedKeyframe}
        onPlayheadChange={(time) => setEditorState(prev => ({ ...prev, playheadTime: time, selectedKeyframe: null }))}
        onTogglePlay={handleTogglePlay}
        onAddKeyframe={handleAddKeyframe}
        onKeyframeSelect={handleKeyframeSelect}
        onKeyframeMove={handleKeyframeMove}
      />
    </div >
  );
};

export default App;
