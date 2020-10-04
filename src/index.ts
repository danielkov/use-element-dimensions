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
        const { target } = entry;
        const boundingClient = target.getBoundingClientRect();
        const set = (target as $Element).$$useElementDimensionsSet;
        if (set) {
          set(Object.assign(boundingClient, entry));
        }
      }
    });

export type ElementDimensions = ResizeObserverEntry & DOMRect;

type $Element = Element & {
  $$useElementDimensionsSet?: React.Dispatch<
    React.SetStateAction<ElementDimensions>
  >;
};

const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;

const contentRect = new DOMRectReadOnly();
const domRect = new DOMRect();
const size = { inlineSize: 0, blockSize: 0 };
const defaultValue: ElementDimensions = Object.assign(domRect, {
  contentBoxSize: size,
  borderBoxSize: size,
  contentRect,
  target: (null as unknown) as Element,
});

const useDimensions = (): [ElementDimensions, (element: Element) => void] => {
  const ref = useRef<$Element>(null);

  const [dimensions, set] = useState<ElementDimensions>(defaultValue);

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
