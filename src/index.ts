import * as React from "react";
import ResizeObserver from "@juggle/resize-observer";

const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    const {
      contentRect: { width, height },
      target
    } = entry;
    const set = (target as $Element).$$useElementDimensionsSet;
    if (set) {
      set({ width, height });
    }
  }
});

type $Element = Element & {
  $$useElementDimensionsSet?: React.Dispatch<
    React.SetStateAction<{
      width: number;
      height: number;
    }>
  >;
};

const useDimensions = (): [
  { width: number; height: number },
  React.RefObject<Element>
] => {
  const ref = React.useRef<$Element>(null);

  const [dimensions, set] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    if (ref.current && ref.current instanceof Element) {
      ref.current.$$useElementDimensionsSet = set;
      resizeObserver.observe(ref.current);
      return () => resizeObserver.unobserve(ref.current as Element);
    }
  }, [ref.current]);

  return [dimensions, ref];
};

export default useDimensions;
