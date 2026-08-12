import React from 'react';

export default function ApplicationStepper({ currentStep, totalSteps = 6 }) {
  const steps = [
    { num: 1, label: 'Applicant' },
    { num: 2, label: 'Family' },
    { num: 3, label: 'Academic' },
    { num: 4, label: 'Hostel' },
    { num: 5, label: 'Documents' },
    { num: 6, label: 'Review & Submit' },
  ];

  return (
    <div className="stepper-header">
      {steps.map((st) => (
        <div
          key={st.num}
          className={`stepper-step ${currentStep === st.num ? 'active' : ''} ${currentStep > st.num ? 'completed' : ''}`}
        >
          <div className="step-number">{currentStep > st.num ? '✓' : st.num}</div>
          <div className="step-label">{st.label}</div>
        </div>
      ))}
    </div>
  );
}
