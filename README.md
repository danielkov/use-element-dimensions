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

### API

The first item in the tuple returned by the hook includes all properties of the latest [`ResizeObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry) for the specific element.

#### `borderBoxSize`

An object containing the new border box size of the observed element when the callback is run.

#### `contentBoxSize`

An object containing the new content box size of the observed element when the callback is run.

#### `contentRect`

A DOMRectReadOnly object containing the new size of the observed element when the callback is run. Note that this is better supported than the above two properties, but it is left over from an earlier implementation of the Resize Observer API, is still included in the spec for web compat reasons, and may be deprecated in future versions.

#### `target`

A reference to the Element or SVGElement being observed.

The `DOMRect` returned by `target.getBoundingClientRect` also lends its properties to this value.

#### `x`

The x coordinate of the DOMRect's origin.

#### `y`

The y coordinate of the DOMRect's origin.

#### `width`

The width of the DOMRect.

#### `height`

The height of the DOMRect.

#### `top`

Returns the top coordinate value of the DOMRect (has the same value as y, or y + height if height is negative.)

#### `right`

Returns the right coordinate value of the DOMRect (has the same value as x + width, or x if width is negative.)

#### `bottom`

Returns the bottom coordinate value of the DOMRect (has the same value as y + height, or y if height is negative.)

#### `left`

Returns the left coordinate value of the DOMRect (has the same value as x, or x + width if width is negative.)

### Use case

There are already some hook libraries that provide dimensions on first render or even update them on `window` resize event, however in many cases this may not be sufficient. HTML DOM Elements can resize in response to a lot of things we don't expect, only one of which is screen size, for example:

- When animating any of the size properties.
- Setting a size properties on an encapsulating DOM Node.
- Orientation change (`resize` triggers in this case - or it should).

### Development

Everything in this package is in `src/index.ts`. If you want to run an example to develop against, install [`parcel`](https://parceljs.org/) globally and then run `parcel example/simple/index.html` from the root directory of the project.

### Building

Run `yarn build` to build for the three targets specified.

### Testing

Integration tests use [Cypress](https://cypress.io), because it is hard to do unit tests for hooks and viewport resizing.

### Examples

The examples live in the `example` directory. To run any of them, make sure `devDependencies` are installed and run `yarn parcel example/<name>/index.html`.
