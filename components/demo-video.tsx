"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

const DEMO_VIDEO_URL = "/demo.mp4";

export function DemoVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handlePlay() {
    setPlaying(true);
    videoRef.current?.play();
  }

  return (
    <div className="relative w-full max-w-4xl aspect-video rounded-xl border border-border bg-muted/50 overflow-hidden">
      <video
        ref={videoRef}
        src={DEMO_VIDEO_URL}
        className="w-full h-full object-cover"
        playsInline
        controls={playing}
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <div className="flex items-center justify-center size-14 rounded-full bg-foreground/10 group-hover:bg-foreground/20 backdrop-blur-xs border border-border transition-colors">
            <Play className="size-6 fill-foreground text-foreground ml-0.5" />
          </div>
        </button>
      )}
    </div>
  );
}
