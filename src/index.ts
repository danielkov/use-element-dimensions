import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const isServer = typeof window === "undefined";

const noop = () => {};

const noopObserver = { observe: noop, unobserve: noop };

const resizeObserver = isServer
  ? noopObserver
  : new ResizeObserver((entries) => {
      for (let entry of entries) {
        const {
          contentRect: { width, height },
          target,
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

const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;

const useDimensions = (): [
  { width: number; height: number },
  (element: Element) => void
] => {
  const ref = useRef<$Element>(null);

  const [dimensions, set] = useState({ width: 0, height: 0 });

  const setRef = useCallback((element: Element) => {
    if (ref.current) {
      resizeObserver.unobserve(ref.current);
    }
    if (element instanceof Element) {
      (element as $Element).$$useElementDimensionsSet = set;
      resizeObserver.observe(element);
    }
  }, []);

  useIsomorphicLayoutEffect(
    () => () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    },
    []
  );

  return [dimensions, setRef];
};

export default useDimensions;
