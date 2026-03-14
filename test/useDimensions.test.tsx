import { StrictMode, useCallback, useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import useDimensions, { useElementRect } from "../src";

type RectOptions = {
  height: number;
  width: number;
  x?: number;
  y?: number;
};

type ObserverEntryOptions = {
  contentRect?: DOMRectReadOnly;
  devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>;
  target: Element;
};

const createRect = ({
  height,
  width,
  x = 0,
  y = 0,
}: RectOptions): DOMRect => {
  const left = x;
  const top = y;

  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x,
    y,
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
  } as DOMRect;
};

const createBoxSize = (rect: DOMRectReadOnly) =>
  ([{ blockSize: rect.height, inlineSize: rect.width }] as unknown) as
  ReadonlyArray<ResizeObserverSize>;

const setElementRect = (element: Element, rect: DOMRect) => {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => rect,
  });
};

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  readonly observed = new Set<Element>();
  disconnectCount = 0;

  constructor(private readonly callback: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }

  observe = (element: Element) => {
    this.observed.add(element);
  };

  unobserve = (element: Element) => {
    this.observed.delete(element);
  };

  disconnect = () => {
    this.disconnectCount += 1;
    this.observed.clear();
  };

  notify = ({
    contentRect,
    devicePixelContentBoxSize,
    target,
  }: ObserverEntryOptions) => {
    const rect =
      contentRect ?? createRect({ height: 0, width: 0, x: 0, y: 0 });

    this.callback(
      [
        {
          borderBoxSize: createBoxSize(rect),
          contentBoxSize: createBoxSize(rect),
          contentRect: rect,
          devicePixelContentBoxSize:
            devicePixelContentBoxSize ?? createBoxSize(rect),
          target,
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver
    );
  };
}

const originalResizeObserver = globalThis.ResizeObserver;

const getLatestObserver = () => {
  const observer =
    MockResizeObserver.instances[MockResizeObserver.instances.length - 1];

  if (!observer) {
    throw new Error("ResizeObserver was not created.");
  }

  return observer;
};

type DimensionsBoxProps = {
  rect: DOMRect;
};

const DimensionsBox = ({ rect }: DimensionsBoxProps) => {
  const [entry, ref] = useDimensions();
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        setElementRect(element, rect);
      }

      ref(element);
    },
    [rect, ref]
  );

  return (
    <>
      <output data-testid="dimensions">{`${entry.contentRect.width}x${entry.contentRect.height}/${entry.devicePixelContentBoxSize[0]?.inlineSize ?? 0}`}</output>
      <div data-testid="box" ref={setRef} />
    </>
  );
};

type RectBoxProps = {
  rect: DOMRect;
};

const RectBox = ({ rect }: RectBoxProps) => {
  const [elementRect, ref] = useElementRect();
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        setElementRect(element, rect);
      }

      ref(element);
    },
    [rect, ref]
  );

  return (
    <>
      <output data-testid="rect">{`${elementRect.width}x${elementRect.height}@${elementRect.left},${elementRect.top}`}</output>
      <div data-testid="box" ref={setRef} />
    </>
  );
};

type SwappingDimensionsBoxProps = {
  firstRect: DOMRect;
  secondRect: DOMRect;
};

const SwappingDimensionsBox = ({
  firstRect,
  secondRect,
}: SwappingDimensionsBoxProps) => {
  const [active, setActive] = useState<"first" | "second">("first");
  const [entry, ref] = useDimensions();
  const rect = active === "first" ? firstRect : secondRect;
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        setElementRect(element, rect);
      }

      ref(element);
    },
    [rect, ref]
  );

  return (
    <>
      <button
        onClick={() =>
          setActive((value) => (value === "first" ? "second" : "first"))
        }
        type="button"
      >
        swap
      </button>
      <output data-testid="dimensions">{entry.contentRect.width}</output>
      {active === "first" ? (
        <div data-testid="first" ref={setRef} />
      ) : (
        <div data-testid="second" ref={setRef} />
      )}
    </>
  );
};

beforeEach(() => {
  MockResizeObserver.instances = [];
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();

  if (originalResizeObserver) {
    globalThis.ResizeObserver = originalResizeObserver;
    return;
  }

  delete (globalThis as { ResizeObserver?: typeof ResizeObserver })
    .ResizeObserver;
});

describe("useDimensions", () => {
  it("returns the ResizeObserver entry without remapping fields", async () => {
    render(<DimensionsBox rect={createRect({ height: 160, width: 280 })} />);

    const observer = getLatestObserver();
    const box = screen.getByTestId("box");
    const contentRect = createRect({ height: 80, width: 120 });
    const devicePixelRect = createRect({ height: 160, width: 240 });

    act(() => {
      observer.notify({
        contentRect,
        devicePixelContentBoxSize: createBoxSize(devicePixelRect),
        target: box,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("dimensions").textContent).toBe("120x80/240");
    });
  });

  it("unobserves the previous element when the ref moves", async () => {
    render(
      <SwappingDimensionsBox
        firstRect={createRect({ height: 60, width: 120 })}
        secondRect={createRect({ height: 70, width: 200 })}
      />
    );

    const firstObserver = getLatestObserver();
    const firstElement = screen.getByTestId("first");

    expect(firstObserver.observed.has(firstElement)).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "swap" }));

    const secondElement = await screen.findByTestId("second");
    const latestObserver = getLatestObserver();

    expect(firstObserver.observed.has(firstElement)).toBe(false);
    expect(latestObserver.observed.has(secondElement)).toBe(true);

    act(() => {
      latestObserver.notify({
        contentRect: createRect({ height: 70, width: 200 }),
        target: secondElement,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("dimensions").textContent).toBe("200");
    });
  });

  it("renders correctly in StrictMode", async () => {
    render(
      <StrictMode>
        <DimensionsBox rect={createRect({ height: 45, width: 75 })} />
      </StrictMode>
    );

    const observer = getLatestObserver();
    const box = screen.getByTestId("box");

    act(() => {
      observer.notify({
        contentRect: createRect({ height: 45, width: 75 }),
        target: box,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("dimensions").textContent).toBe("75x45/75");
    });
  });
});

describe("useElementRect", () => {
  it("measures the attached element on mount", async () => {
    render(<RectBox rect={createRect({ height: 80, width: 120, x: 8, y: 4 })} />);

    await waitFor(() => {
      expect(screen.getByTestId("rect").textContent).toBe("120x80@8,4");
    });
  });

  it("uses getBoundingClientRect for rect updates", async () => {
    render(<RectBox rect={createRect({ height: 80, width: 120, x: 8, y: 4 })} />);

    const observer = getLatestObserver();
    const box = screen.getByTestId("box");
    const contentRect = createRect({ height: 50, width: 90, x: 0, y: 0 });
    const nextRect = createRect({ height: 140, width: 260, x: 24, y: 16 });

    setElementRect(box, nextRect);

    act(() => {
      observer.notify({ contentRect, target: box });
    });

    await waitFor(() => {
      expect(screen.getByTestId("rect").textContent).toBe("260x140@24,16");
    });
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(
      <RectBox rect={createRect({ height: 80, width: 120 })} />
    );

    const observer = getLatestObserver();

    unmount();

    expect(observer.disconnectCount).toBe(1);
    expect(observer.observed.size).toBe(0);
  });
});
