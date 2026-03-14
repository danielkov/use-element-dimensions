import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

const isServer = typeof window === "undefined";

const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;

type Listener = () => void;
type SetRef = (element?: Element | null) => void;

export type ElementDimensions = ResizeObserverEntry;
export type ElementRect = DOMRect;

interface EntrySubscriber {
  handleEntry(entry: ResizeObserverEntry): void;
}

interface ElementObservationStore<T> extends EntrySubscriber {
  cleanup(): void;
  flushPendingNotification(): void;
  getServerSnapshot(): T;
  getSnapshot(): T;
  setElement(element: Element | null): void;
  subscribe(listener: Listener): () => void;
}

const canObserve = () => typeof ResizeObserver !== "undefined";

const createRectSnapshot = (rect: DOMRectReadOnly): DOMRect => ({
  bottom: rect.bottom,
  height: rect.height,
  left: rect.left,
  right: rect.right,
  top: rect.top,
  width: rect.width,
  x: rect.x,
  y: rect.y,
  toJSON() {
    return {
      bottom: this.bottom,
      height: this.height,
      left: this.left,
      right: this.right,
      top: this.top,
      width: this.width,
      x: this.x,
      y: this.y,
    };
  },
});

const createEmptyRect = () =>
  createRectSnapshot({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  });

const emptyRect = Object.freeze(createEmptyRect()) as ElementRect;

const emptyBoxSize = Object.freeze([{ inlineSize: 0, blockSize: 0 }]) as
  ReadonlyArray<ResizeObserverSize>;

const emptyDimensions = Object.freeze({
  borderBoxSize: emptyBoxSize,
  contentBoxSize: emptyBoxSize,
  devicePixelContentBoxSize: emptyBoxSize,
  contentRect: emptyRect,
  target: (null as unknown) as Element,
}) as ElementDimensions;

let sharedObserver: ResizeObserver | null = null;
const subscribersByElement = new Map<Element, Set<EntrySubscriber>>();

const getSharedObserver = (): ResizeObserver => {
  if (!sharedObserver) {
    sharedObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        subscribersByElement.get(entry.target)?.forEach((subscriber) => {
          subscriber.handleEntry(entry);
        });
      }
    });
  }

  return sharedObserver;
};

const observeElement = (element: Element, subscriber: EntrySubscriber) => {
  let subscribers = subscribersByElement.get(element);

  if (!subscribers) {
    subscribers = new Set<EntrySubscriber>();
    subscribersByElement.set(element, subscribers);
    getSharedObserver().observe(element);
  }

  subscribers.add(subscriber);
};

const unobserveElement = (element: Element, subscriber: EntrySubscriber) => {
  const subscribers = subscribersByElement.get(element);

  if (!subscribers) {
    return;
  }

  subscribers.delete(subscriber);

  if (subscribers.size > 0) {
    return;
  }

  subscribersByElement.delete(element);

  if (sharedObserver) {
    sharedObserver.unobserve(element);

    if (subscribersByElement.size === 0) {
      sharedObserver.disconnect();
      sharedObserver = null;
    }
  }
};

const areRectsEqual = (a: DOMRectReadOnly, b: DOMRectReadOnly) =>
  a.bottom === b.bottom &&
  a.height === b.height &&
  a.left === b.left &&
  a.right === b.right &&
  a.top === b.top &&
  a.width === b.width &&
  a.x === b.x &&
  a.y === b.y;

const readElementRect = (element: Element): ElementRect =>
  createRectSnapshot(element.getBoundingClientRect());

abstract class BaseStore<T> implements ElementObservationStore<T> {
  private readonly listeners = new Set<Listener>();
  private readonly serverSnapshot: T;
  private hasPendingNotification = false;
  protected element: Element | null = null;
  protected snapshot: T;

  constructor(serverSnapshot: T) {
    this.serverSnapshot = serverSnapshot;
    this.snapshot = serverSnapshot;
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  getServerSnapshot = () => this.serverSnapshot;

  setElement = (element: Element | null) => {
    if (this.element === element) {
      return;
    }

    if (this.element && canObserve()) {
      unobserveElement(this.element, this);
    }

    this.element = element;
    this.handleElementChange(element);
  };

  flushPendingNotification = () => {
    if (!this.hasPendingNotification || !this.listeners.size) {
      return;
    }

    this.hasPendingNotification = false;
    this.emit();
  };

  cleanup = () => {
    this.hasPendingNotification = false;

    if (this.element && canObserve()) {
      unobserveElement(this.element, this);
    }

    this.element = null;
    this.snapshot = this.serverSnapshot;
  };

  protected observeCurrentElement = () => {
    if (this.element && canObserve()) {
      observeElement(this.element, this);
    }
  };

  protected resetSnapshot = () => {
    this.updateSnapshot(this.serverSnapshot);
  };

  protected updateSnapshot = (snapshot: T) => {
    this.snapshot = snapshot;

    if (!this.listeners.size) {
      this.hasPendingNotification = true;
      return;
    }

    this.emit();
  };

  private emit = () => {
    this.listeners.forEach((listener) => {
      listener();
    });
  };

  abstract handleEntry(entry: ResizeObserverEntry): void;

  protected abstract handleElementChange(element: Element | null): void;
}

class ElementDimensionsStore extends BaseStore<ElementDimensions> {
  constructor() {
    super(emptyDimensions);
  }

  handleEntry = (entry: ResizeObserverEntry) => {
    this.updateSnapshot(entry);
  };

  protected handleElementChange = (element: Element | null) => {
    if (!element) {
      this.resetSnapshot();
      return;
    }

    this.resetSnapshot();
    this.observeCurrentElement();
  };
}

class ElementRectStore extends BaseStore<ElementRect> {
  constructor() {
    super(emptyRect);
  }

  handleEntry = (entry: ResizeObserverEntry) => {
    const nextRect = readElementRect(entry.target);

    if (areRectsEqual(this.snapshot, nextRect)) {
      return;
    }

    this.updateSnapshot(nextRect);
  };

  protected handleElementChange = (element: Element | null) => {
    if (!element) {
      this.resetSnapshot();
      return;
    }

    this.updateSnapshot(readElementRect(element));
    this.observeCurrentElement();
  };
}

const useObservedStore = <TSnapshot, TSelected = TSnapshot>(
  createStore: () => ElementObservationStore<TSnapshot>,
  selector?: (snapshot: TSnapshot) => TSelected
): [TSelected, SetRef] => {
  const storeRef = useRef<ElementObservationStore<TSnapshot> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  const store = storeRef.current;
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const getSnapshot = useCallback(
    () => {
      const snapshot = store.getSnapshot();
      return selectorRef.current
        ? selectorRef.current(snapshot)
        : ((snapshot as unknown) as TSelected);
    },
    [store]
  );

  const getServerSnapshot = useCallback(
    () => {
      const snapshot = store.getServerSnapshot();
      return selectorRef.current
        ? selectorRef.current(snapshot)
        : ((snapshot as unknown) as TSelected);
    },
    [store]
  );

  const value = useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setRef = useCallback(
    (element?: Element | null) => {
      store.setElement(element ?? null);
    },
    [store]
  );

  useIsomorphicLayoutEffect(() => {
    store.flushPendingNotification();

    return () => {
      store.cleanup();
    };
  }, [store]);

  return [value, setRef];
};

function useDimensions(): [ElementDimensions, SetRef];
function useDimensions<T>(
  selector: (dimensions: ElementDimensions) => T
): [T, SetRef];
function useDimensions<T = ElementDimensions>(
  selector?: (dimensions: ElementDimensions) => T
): [T, SetRef] {
  return useObservedStore(() => new ElementDimensionsStore(), selector);
}

function useElementRect(): [ElementRect, SetRef];
function useElementRect<T>(selector: (rect: ElementRect) => T): [T, SetRef];
function useElementRect<T = ElementRect>(
  selector?: (rect: ElementRect) => T
): [T, SetRef] {
  return useObservedStore(() => new ElementRectStore(), selector);
}

export { useElementRect };
export default useDimensions;
