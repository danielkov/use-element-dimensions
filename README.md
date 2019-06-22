## `use-element-dimensions` [![Cypress.io tests](https://img.shields.io/badge/cypress.io-tests-green.svg?style=for-the-badge)](https://cypress.io) ![CircleCI](https://img.shields.io/circleci/build/github/danielkov/use-element-dimensions.svg?style=for-the-badge) ![npm](https://img.shields.io/npm/v/use-element-dimensions.svg?style=for-the-badge) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-element-dimensions.svg?style=for-the-badge)

React Hook to figure out DOM Element dimensions with updates

### Usage

```jsx
import useDimensions from "use-element-dimensions";

const Example = () => {
  const [{ width, height }, ref] = useDimensions();
  return (
    <div ref={ref}>
      The width of this div is: {width} and the height is: {height}
    </div>
  );
};
```

### Use case

There are already some hook libraries that provide dimensions on first render or even update them on `window` resize event, however in many cases this may not be sufficient. HTML DOM Elements can resize in response to a lot of things we don't expect, only one of which is screen size, for example:

- When animating any of the size properties.
- Setting a size properties on an encapsulating DOM Node.
- Orientation change (`resize` triggers in this case - or it should).

This package uses [`@juggle/resize-observer`](https://juggle.studio/resize-observer/) to [Ponyfill](https://github.com/sindresorhus/ponyfill) `ResizeObserver` API. This means that you can expect the same behaviour out of every browser, regardless of them having implemented the actual API or not.

### Development

Everything in this package is in `src/index.ts`. If you want to run an example to develop against, install [`parcel`](https://parceljs.org/) globally and then run `parcel example/simple/index.html` from the root directory of the project.

### Building

Run `yarn build` to build for the three targets specified.

### Testing

Integration tests use [Cypress](https://cypress.io), because it is hard to do unit tests for hooks and viewport resizing.

### Examples

The examples live in the `example` directory. To run any of them, make sure `devDependencies` are installed and run `yarn parcel example/<name>/index.html`.
