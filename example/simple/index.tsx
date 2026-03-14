import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { useElementRect } from "../../src";

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

const formatValue = (value: number) => value.toFixed(1);

const Example = () => {
  const [{ width, height }, ref] = useElementRect();
  const [animating, setAnimating] = useState(false);
  const fps = useFps();

  return (
    <div className="page">
      <div className="panel">
        <div className="panel__titlebar">
          <div className="panel__dots">
            <span className="panel__dot" />
            <span className="panel__dot" />
            <span className="panel__dot" />
          </div>
          <span className="panel__label">use-element-dimensions</span>
          <span className="fps-badge">{fps} fps</span>
        </div>
        <div className="panel__body">
          <div
            ref={ref}
            className={`observed-box${animating ? " animating" : ""}`}
          />
          <div className="readout">
            <div className="readout__field">
              <span className="readout__label">width</span>
              <strong className="readout__value">
                {formatValue(width)}
                <span className="readout__unit"> px</span>
              </strong>
            </div>
            <div className="readout__field">
              <span className="readout__label">height</span>
              <strong className="readout__value">
                {formatValue(height)}
                <span className="readout__unit"> px</span>
              </strong>
            </div>
          </div>
          <button
            className="toggle-btn"
            data-active={animating}
            onClick={() => setAnimating((v) => !v)}
            type="button"
          >
            <span className="toggle-btn__indicator" />
            {animating ? "Stop animation" : "Start animation"}
          </button>
        </div>
      </div>
    </div>
  );
};

createRoot(root).render(
  <StrictMode>
    <Example />
  </StrictMode>
);
