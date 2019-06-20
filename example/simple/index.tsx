import * as React from "react";
import { render } from "react-dom";
import useDimensions from "../../src";
import { useCallback, useState } from "react";

const root = document.getElementById("root");

const Example = () => {
  const [{ width, height }, ref] = useDimensions();
  const [animating, setAnimating] = useState(false);
  const toggle = useCallback(() => {
    setAnimating(!animating);
  }, [animating]);
  return (
    <>
      <div ref={ref} className={animating ? "example" : ""}>
        Example width: {width} height: {height}
      </div>
      <button onClick={toggle}>Toggle Animation</button>
    </>
  );
};

render(<Example />, root);
