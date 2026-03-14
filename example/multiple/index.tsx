import type { CSSProperties } from "react";
import {
  StrictMode,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import useDimensions from "../../src";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

const useFps = () => {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef(performance.now());

  useEffect(() => {
    let id: number;
    const tick = () => {
      frames.current++;
      const now = performance.now();
      if (now - last.current >= 1000) {
        setFps(frames.current);
        frames.current = 0;
        last.current = now;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return fps;
};

const useDrag = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [ratio, setRatio] = useState(0.5);
  const dragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0.15, Math.min(0.85, (e.clientX - rect.left) / rect.width));
      setRatio(x);
    },
    [containerRef]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return { ratio, onPointerDown, onPointerMove, onPointerUp };
};

const controls = [
  { delta: 10, label: "+10", tone: "add" },
  { delta: 50, label: "+50", tone: "add" },
  { delta: -10, label: "-10", tone: "remove" },
  { delta: -50, label: "-50", tone: "remove" },
] as const;

const goldenAngle = 137.508;

const getAccent = (index: number) =>
  `hsl(${(index * goldenAngle) % 360}, 75%, 65%)`;

const formatDimension = (value: number) => value.toFixed(2);

const getCardStyle = (index: number): CSSProperties =>
  ({
    "--accent": getAccent(index),
    "--intro-delay": `${(index % 18) * 20}ms`,
  }) as CSSProperties;

const Card = ({ index }: { index: number }) => {
  const [contentRect, ref] = useDimensions((entry) => entry.contentRect);

  return (
    <article ref={ref} className="stress-card" style={getCardStyle(index)}>
      <div className="stress-card__header">
        <span className="stress-card__index">
          #{String(index + 1).padStart(3, "0")}
        </span>
        <span className="stress-card__dot" aria-hidden="true" />
      </div>
      <div className="stress-card__metrics">
        <div className="stress-card__metric">
          <span className="stress-card__label">w</span>
          <strong className="stress-card__value">
            {formatDimension(contentRect.width)}
          </strong>
        </div>
        <div className="stress-card__metric">
          <span className="stress-card__label">h</span>
          <strong className="stress-card__value">
            {formatDimension(contentRect.height)}
          </strong>
        </div>
      </div>
    </article>
  );
};

const Example = () => {
  const [count, setCount] = useState(200);
  const fps = useFps();
  const splitRef = useRef<HTMLDivElement | null>(null);
  const { ratio, onPointerDown, onPointerMove, onPointerUp } = useDrag(splitRef);

  const half = Math.ceil(count / 2);

  const updateCount = (delta: number) => {
    startTransition(() => {
      setCount((value) => Math.max(0, value + delta));
    });
  };

  return (
    <main className="stress-page">
      <section className="stress-hero">
        <p className="stress-hero__eyebrow">Stress Test</p>
        <h1 className="stress-hero__title">
          <code>use-element-dimensions</code>
        </h1>
        <p className="stress-hero__copy">
          Drag the divider to resize both panels. Every card observes its own
          dimensions and displays live width and height as the layout reflows.
        </p>
        <div className="stress-toolbar">
          {controls.map((control) => (
            <button
              key={control.label}
              className="stress-button"
              data-tone={control.tone}
              onClick={() => updateCount(control.delta)}
              type="button"
            >
              {control.label}
            </button>
          ))}
        </div>
        <div className="stress-stats">
          <div className="stress-stat">
            <span className="stress-stat__label">Observers</span>
            <strong className="stress-stat__value">{count}</strong>
          </div>
          <div className="stress-stat">
            <span className="stress-stat__label">Split</span>
            <strong className="stress-stat__value">{Math.round(ratio * 100)}:{Math.round((1 - ratio) * 100)}</strong>
          </div>
          <div className="stress-stat">
            <span className="stress-stat__label">FPS</span>
            <strong className="stress-stat__value stress-stat__value--fps">{fps}</strong>
          </div>
        </div>
      </section>
      <section
        className="split"
        ref={splitRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="split__pane" style={{ flex: ratio }}>
          <div className="split__label">Left ({half})</div>
          <div className="split__grid">
            {Array.from({ length: half }, (_, i) => (
              <Card key={i} index={i} />
            ))}
          </div>
        </div>
        <div
          className="split__handle"
          onPointerDown={onPointerDown}
        >
          <div className="split__handle-track" />
        </div>
        <div className="split__pane" style={{ flex: 1 - ratio }}>
          <div className="split__label">Right ({count - half})</div>
          <div className="split__grid">
            {Array.from({ length: count - half }, (_, i) => (
              <Card key={i} index={half + i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

createRoot(root).render(
  <StrictMode>
    <Example />
  </StrictMode>
);
