import { ProjectMetadata } from '../types';
import { localMediaStore } from './localMedia';

const STORAGE_KEY = 'vadeo_dev_projects';

type LocalProjectRecord = {
  id: string;
  name: string;
  editor_state: any;
  thumbnail?: string;
  updated_at: string;
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readProjects = (): LocalProjectRecord[] => {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read local projects:', error);
    return [];
  }
};

const writeProjects = (projects: LocalProjectRecord[]) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to write local projects:', error);
  }
};

const persistEditorMedia = async (editorState: any) => {
  if (!editorState?.pages) return editorState;

  const pages = await Promise.all(
    editorState.pages.map(async (page: any) => {
      const layers = await Promise.all(
        (page.layers || []).map(async (layer: any) => {
          if (layer?.type === 'IMAGE' && typeof layer.src === 'string') {
            return {
              ...layer,
              src: await localMediaStore.persistBlobUrl(layer.src)
            };
          }
          return layer;
        })
      );

      return { ...page, layers };
    })
  );

  return { ...editorState, pages };
};

const sanitizeEditorStateForPersistence = (editorState: any) => {
  if (!editorState?.pages) return editorState;

  return {
    pages: editorState.pages,
    activePageId: editorState.activePageId,
    zoom: editorState.zoom,
    pan: editorState.pan,
    isPro: editorState.isPro
  };
};

const resolveEditorMedia = async (editorState: any) => {
  if (!editorState?.pages) return editorState;

  const pages = await Promise.all(
    editorState.pages.map(async (page: any) => {
      const layers = await Promise.all(
        (page.layers || []).map(async (layer: any) => {
          if (layer?.type === 'IMAGE' && typeof layer.src === 'string' && localMediaStore.isLocalMediaUri(layer.src)) {
            return {
              ...layer,
              src: await localMediaStore.resolveSrc(layer.src)
            };
          }
          return layer;
        })
      );

      const resolvedThumbnail =
        typeof page.thumbnail === 'string' && localMediaStore.isLocalMediaUri(page.thumbnail)
          ? await localMediaStore.resolveSrc(page.thumbnail)
          : page.thumbnail;

      return { ...page, layers, thumbnail: resolvedThumbnail };
    })
  );

  return { ...editorState, pages };
};

export const localProjectStore = {
  list(): LocalProjectRecord[] {
    return readProjects().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async get(projectId: string): Promise<LocalProjectRecord | null> {
    const project = readProjects().find((item) => item.id === projectId) ?? null;
    if (!project) return null;

    return {
      ...project,
      editor_state: await resolveEditorMedia(project.editor_state)
    };
  },

  async save(project: { id: string; name: string; editorState: any; thumbnail?: string }) {
    const projects = readProjects();
    const persistedEditorState = await persistEditorMedia(
      sanitizeEditorStateForPersistence(project.editorState)
    );
    const persistedThumbnail =
      typeof project.thumbnail === 'string'
        ? await localMediaStore.persistBlobUrl(project.thumbnail)
        : project.thumbnail;
    const nextProject: LocalProjectRecord = {
      id: project.id,
      name: project.name,
      editor_state: persistedEditorState,
      thumbnail: persistedThumbnail,
      updated_at: new Date().toISOString()
    };

    const existingIndex = projects.findIndex((item) => item.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = nextProject;
    } else {
      projects.push(nextProject);
    }

    writeProjects(projects);
    return nextProject;
  },

  delete(projectId: string) {
    writeProjects(readProjects().filter((project) => project.id !== projectId));
  },

  toMetadata(projects: LocalProjectRecord[]): ProjectMetadata[] {
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      thumbnail: project.thumbnail,
      updatedAt: new Date(project.updated_at).getTime()
    }));
  }
};
