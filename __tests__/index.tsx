import React from "react";
// @ts-ignore
import { render } from "@testing-library/react";

import useDimensions from "../src";

import "@testing-library/react/cleanup-after-each";

const TestComponent = () => {
  const [{ width, height }, ref] = useDimensions();
  return (
    // @ts-ignore
    <div ref={ref}>
      width: {width} height: {height}
    </div>
  );
};

describe("use-element-dimensions", () => {
  it("should determine dimensions after first render", () => {
    const { container } = render(<TestComponent />);

    // @ts-ignore
    expect(container).toHaveTextContent("Component Title");
  });
});
