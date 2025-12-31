'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTutorialStore, TUTORIAL_STEPS, TutorialStep } from '@/store/tutorialStore';
import { useI18n } from '@/lib/i18n';

interface TooltipPosition {
    top: number;
    left: number;
}

const Tutorial: React.FC = () => {
    const { locale, t } = useI18n();
    const { isActive, currentStep, nextStep, skipTutorial } = useTutorialStore();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });

    const step = TUTORIAL_STEPS[currentStep];

    const updatePosition = useCallback(() => {
        if (!step) return;

        const target = document.querySelector(step.targetSelector);
        if (target) {
            const rect = target.getBoundingClientRect();
            setTargetRect(rect);

            // Calculate tooltip position based on step.position
            const padding = 16;
            let top = 0;
            let left = 0;

            switch (step.position) {
                case 'top':
                    top = rect.top - 120;
                    left = rect.left + rect.width / 2 - 150;
                    break;
                case 'bottom':
                    top = rect.bottom + padding;
                    left = rect.left + rect.width / 2 - 150;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2 - 60;
                    left = rect.left - 320;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2 - 60;
                    left = rect.right + padding;
                    break;
            }

            // Keep tooltip in viewport
            top = Math.max(16, Math.min(top, window.innerHeight - 200));
            left = Math.max(16, Math.min(left, window.innerWidth - 320));

            setTooltipPos({ top, left });
        }
    }, [step]);

    useEffect(() => {
        if (isActive) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
            };
        }
    }, [isActive, currentStep, updatePosition]);

    if (!isActive || !step) return null;

    const title = locale === 'ja' ? step.titleJa : step.titleEn;
    const description = locale === 'ja' ? step.descriptionJa : step.descriptionEn;

    return (
        <div className="fixed inset-0 z-[1000]">
            {/* Dark overlay with cutout */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="tutorial-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 4}
                                y={targetRect.top - 4}
                                width={targetRect.width + 8}
                                height={targetRect.height + 8}
                                rx="8"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.7)"
                    mask="url(#tutorial-mask)"
                />
            </svg>

            {/* Highlight border around target */}
            {targetRect && (
                <div
                    className="absolute border-2 border-app-accent rounded-lg pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="absolute bg-app-primary border border-app-light rounded-lg shadow-xl p-4 w-[300px]"
                style={{ top: tooltipPos.top, left: tooltipPos.left }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-app-muted">
                        {currentStep + 1} / {TUTORIAL_STEPS.length}
                    </span>
                </div>
                <h3 className="text-base font-semibold text-app mb-2">{title}</h3>
                <p className="text-sm text-app-muted mb-4">{description}</p>

                <div className="flex justify-between">
                    <button
                        onClick={skipTutorial}
                        className="px-3 py-1.5 text-app-muted hover:text-app text-sm"
                    >
                        {locale === 'ja' ? 'スキップ' : 'Skip'}
                    </button>
                    <button
                        onClick={nextStep}
                        className="px-4 py-1.5 bg-app-accent hover:bg-app-accent-hover text-white text-sm rounded"
                    >
                        {currentStep < TUTORIAL_STEPS.length - 1
                            ? (locale === 'ja' ? '次へ' : 'Next')
                            : (locale === 'ja' ? '完了' : 'Done')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
