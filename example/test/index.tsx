import * as React from "react";

import useDimensions from "../../dist/esm";
import { render } from "react-dom";

const Test = () => {
  const [{ width, height }, ref] = useDimensions();

  return (
    <div
      ref={ref}
      style={{ width: "100vw", height: "100vh" }}
      id="test-container"
    >
      width: {width} height: {height}
    </div>
  );
};

render(<Test />, document.getElementById("root"));
