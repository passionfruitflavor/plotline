'use client';

import { useState, useCallback, useEffect } from 'react';

interface UsePanelResizeOptions {
    initialWidth: number;
    minWidth?: number;
    maxWidth?: number;
}

export function usePanelResize({ initialWidth, minWidth = 200, maxWidth = 600 }: UsePanelResizeOptions) {
    const [panelWidth, setPanelWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
        setPanelWidth(newWidth);
    }, [minWidth, maxWidth]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    }, [handleResizeMove]);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    }, [handleResizeMove, handleResizeEnd]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [handleResizeMove, handleResizeEnd]);

    return {
        panelWidth,
        isResizing,
        handleResizeStart,
    };
}
