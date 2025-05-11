import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipConfig {
  id: string;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

const TOOLTIPS: TooltipConfig[] = [
  {
    id: "prompt",
    content: "Type what you want to automate",
    side: "bottom",
  },
  {
    id: "canvas",
    content: "Visual output appears here",
    side: "top",
  },
  {
    id: "save",
    content: "Click to persist your workflow",
    side: "left",
  },
];

export function CanvasTooltips() {
  const [showTooltips, setShowTooltips] = useState(false);

  useEffect(() => {
    const hasSeenTooltips = localStorage.getItem("hasSeenTooltips");
    if (!hasSeenTooltips) {
      setShowTooltips(true);
      // Set a timeout to hide tooltips after 10 seconds
      const timeout = setTimeout(() => {
        setShowTooltips(false);
        localStorage.setItem("hasSeenTooltips", "true");
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, []);

  if (!showTooltips) return null;

  return (
    <TooltipProvider>
      {TOOLTIPS.map((tooltip) => (
        <Tooltip key={tooltip.id} defaultOpen>
          <TooltipTrigger asChild>
            <div id={tooltip.id} className="absolute" />
          </TooltipTrigger>
          <TooltipContent side={tooltip.side} sideOffset={5}>
            {tooltip.content}
          </TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );
}
