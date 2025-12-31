'use client';

import React, { useEffect } from 'react';
import Tutorial from '@/components/Tutorial';
import { useTutorialStore } from '@/store/tutorialStore';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const checkFirstVisit = useTutorialStore(state => state.checkFirstVisit);

    useEffect(() => {
        checkFirstVisit();
    }, [checkFirstVisit]);

    return (
        <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {children}
            </main>
            <Tutorial />
        </div>
    );
};

export default Layout;
