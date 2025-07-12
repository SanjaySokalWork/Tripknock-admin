'use client';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex-1 flex flex-col items-center relative
              ${index === 0 ? 'pl-0' : ''}
              ${index === steps.length - 1 ? 'pr-0' : ''}
            `}
          >
            {/* Progress Line */}
            {index !== 0 && (
              <div
                className={`absolute h-0.5 top-5 -translate-y-1/2 transform 
                  ${index <= currentStep ? 'bg-primary-500' : 'bg-secondary-200'}`}
                style={{
                  left: `calc(${(index - 1) * (100 / (steps.length - 1))}% + 2rem)`,
                  right: `calc(${100 - (index * (100 / (steps.length - 1)))}% + 2rem)`,
                  width: `calc(${100 / (steps.length - 1)}% - 4rem)`,
                }}
              />
            )}
            
            {/* Step Circle */}
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10
                ${index < currentStep 
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : index === currentStep
                    ? 'border-primary-500 bg-white text-primary-500'
                    : 'border-secondary-200 bg-white text-secondary-400'
                }`}
            >
              {index < currentStep ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            {/* Step Label */}
            <div className="mt-3 text-center w-full px-2">
              <div className={`text-sm font-medium mb-0.5 ${
                index <= currentStep ? 'text-primary-600' : 'text-secondary-400'
              }`}>
                {step.label}
              </div>
              <div className="text-xs text-secondary-400 line-clamp-2">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
