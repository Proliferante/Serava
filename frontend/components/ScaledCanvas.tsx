"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// useLayoutEffect on the client (measures before paint → no flash), useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ScaledCanvasProps = {
  /** Design width in px (Figma frame width). */
  width: number;
  /** Design height in px (Figma frame height). */
  height: number;
  children: ReactNode;
};

/**
 * Renders a fixed-size design canvas and scales it proportionally to the
 * available viewport width, keeping the layout pixel-identical to the Figma
 * frame at every screen size.
 *
 * The wrapper reserves its height via `aspect-ratio` (no JS needed), and the
 * scaled content stays invisible until measured — this removes the zoom/flash
 * that happened when the canvas first rendered at scale 1 and then snapped.
 */
export default function ScaledCanvas({ width, height, children }: ScaledCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => setScale(el.clientWidth / width);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${width} / ${height}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          opacity: scale ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
