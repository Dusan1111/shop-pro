"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoginTransition from "./LoginTransition";

export default function TransitionProvider() {
  const [showTransition, setShowTransition] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we should show the login transition
    const shouldShowTransition = sessionStorage.getItem('showLoginTransition');
    if (shouldShowTransition === 'true') {
      setShowTransition(true);
      sessionStorage.removeItem('showLoginTransition');
    }
  }, [pathname]);

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  if (!showTransition) return null;

  return <LoginTransition onComplete={handleTransitionComplete} />;
}
