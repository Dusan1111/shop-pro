"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LoginTransition.module.scss";

interface LoginTransitionProps {
  onComplete: () => void;
}

export default function LoginTransition({ onComplete }: LoginTransitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start playing the video
    video.play().catch((error) => {
      console.error("Video playback failed:", error);
      // If video fails to play, skip to completion
      onComplete();
    });

    const handleTimeUpdate = () => {
      // Start fade out 0.5 seconds before video ends
      if (video.duration - video.currentTime <= 0.5 && !isEnding) {
        setIsEnding(true);
      }
    };

    const handleEnded = () => {
      // Small delay before calling onComplete to allow fade animation
      setTimeout(() => {
        onComplete();
      }, 0);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onComplete, isEnding]);

  return (
    <div className={`${styles.transitionOverlay} ${isEnding ? styles.fadeOut : ""}`}>
      <video
        ref={videoRef}
        className={styles.transitionVideo}
        muted
        playsInline
        preload="auto"
      >
        <source src="/assets/animation.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
