import React from 'react';
import { Check } from 'lucide-react';

interface VotingProgressProps {
  currentStep: 1 | 2 | 3;
}

export const VotingProgress: React.FC<VotingProgressProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Candidate Selection' },
    { number: 2, label: 'Review & Verify' },
    { number: 3, label: 'Sealed Receipt' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-graphite-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-gold-soft to-gold -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gold text-obsidian shadow-gold-glow'
                    : isCurrent
                    ? 'bg-charcoal text-gold-soft border-2 border-gold shadow-luxury scale-110'
                    : 'bg-charcoal text-platinum-muted border border-graphite-border'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
              </div>
              <span
                className={`text-[11px] font-medium uppercase tracking-wider mt-2 transition-colors ${
                  isCurrent ? 'text-gold-soft font-semibold' : 'text-platinum-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
