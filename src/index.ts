import * as React from "react";
import ResizeObserver from "@juggle/resize-observer";

const useDimensions = (): [
  { width: number; height: number },
  React.RefObject<Element>
] => {
  const ref = React.useRef<Element>(null);

  const [dimensions, set] = React.useState({ width: 0, height: 0 });
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      set({ width, height });
    }
  });
  React.useLayoutEffect(() => {
    if (ref.current && ref.current instanceof Element) {
      resizeObserver.observe(ref.current);
      return () => resizeObserver.unobserve(ref.current as Element);
    }
  }, [ref.current]);

  return [dimensions, ref];
};

export default useDimensions;
