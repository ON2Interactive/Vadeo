import { useCallback } from 'react';
import { Page, EditorState } from '../../types';
import { RemixEngine } from './RemixEngine';
import { GridType } from '../Editor/GridOverlay';

export const useRemix = (
    activePage: Page,
    pages: Page[],
    activeGrid: GridType,
    pushToHistory: (newPages: Page[]) => void
) => {
    const handleRemix = useCallback(() => {
        // Generate new page variant
        const remixedPage = RemixEngine.applyRemix(activePage, activeGrid);

        const newPages = pages.map(p =>
            p.id === activePage.id ? remixedPage : p
        );

        pushToHistory(newPages);
    }, [activePage, pages, pushToHistory, activeGrid]);

    return {
        handleRemix
    };
};
