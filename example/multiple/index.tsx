import * as React from "react";
import { render } from "react-dom";
import useDimensions from "../../src";
import { useCallback, useState } from "react";

const root = document.getElementById("root");

const useInterval = (callback, delay) => {
  const savedCallback = React.useRef(null);

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const Test = () => {
  const [{ width, height }, ref] = useDimensions();
  return (
    <div ref={ref} style={{ width: "10%" }}>
      {width} {height}
    </div>
  );
};

const Example = () => {
  const [arr, setArr] = useState([]);

  const set = useCallback(() => {
    setArr(arr.concat([0]));
  }, [arr.length]);

  useInterval(set, 1000);

  return (
    <>
      <div className="example" style={{ display: "flex", flexWrap: "wrap" }}>
        {arr.map((_, index) => (
          <Test key={index} />
        ))}
      </div>
      <h3>Number of items observed: {arr.length}</h3>
    </>
  );
};

render(<Example />, root);
