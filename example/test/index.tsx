import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { useElementRect } from "../../src";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

const style = {
  width: "100vw",
  height: "100vh",
  background: "#0c0c14",
  color: "#c8cad0",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
} as const;

const labelStyle = {
  color: "#5e6270",
  fontSize: "0.65rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "0.25rem",
} as const;

const valueStyle = {
  color: "#36f0c8",
  fontSize: "1.2rem",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
} as const;

const Test = () => {
  const [{ width, height }, ref] = useElementRect();

  return (
    <div ref={ref} style={style} id="test-container">
      <div>
        <div style={labelStyle}>width</div>
        <div style={valueStyle}>{width.toFixed(1)} px</div>
      </div>
      <div>
        <div style={labelStyle}>height</div>
        <div style={valueStyle}>{height.toFixed(1)} px</div>
      </div>
    </div>
  );
};

createRoot(root).render(
  <StrictMode>
    <Test />
  </StrictMode>
);
