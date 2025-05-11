import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to WorkflowViz",
    description:
      "Create beautiful workflow diagrams using natural language. Let's get you started with the basics.",
  },
  {
    title: "Natural Language Input",
    description:
      "Simply describe your workflow in plain English. For example: 'When a new lead comes in from LinkedIn, fetch their company info from Apollo and send a welcome email'.",
  },
  {
    title: "Interactive Canvas",
    description:
      "Your workflow will be visualized as an interactive diagram. Drag nodes to rearrange, click to edit details, and watch the logic flow.",
  },
  {
    title: "Save & Share",
    description:
      "Save your workflows to access them later. Share them with your team or export them for documentation.",
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ONBOARDING_STEPS[currentStep].title}</DialogTitle>
          <DialogDescription>
            {ONBOARDING_STEPS[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleDismiss}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep === ONBOARDING_STEPS.length - 1
                ? "Get Started"
                : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
