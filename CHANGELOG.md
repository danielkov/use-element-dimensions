# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/danielkov/use-element-dimensions/compare/v2.1.3...v3.0.0) (2026-03-14)


### ⚠ BREAKING CHANGES

* useDimensions now returns the raw ResizeObserverEntry payload and consumers needing viewport DOMRect values must switch to useElementRect.

### Features

* split ResizeObserver entry and element rect hooks ([1c25c9c](https://github.com/danielkov/use-element-dimensions/commit/1c25c9c11ff54f917ddbbd390ed1589ffe3e8e28))


### Bug Fixes

* renovate config ([b0cea61](https://github.com/danielkov/use-element-dimensions/commit/b0cea612f419900b34b3e4a4cf9ec83d6af0e632))

### [2.1.3](https://github.com/danielkov/use-element-dimensions/compare/v2.1.2...v2.1.3) (2020-12-04)

### [2.1.2](https://github.com/danielkov/use-element-dimensions/compare/v2.1.1...v2.1.2) (2020-10-29)


### Bug Fixes

* noop instead of error, when not supported ([8fde267](https://github.com/danielkov/use-element-dimensions/commit/8fde267140b6d46a73fce30e3c8fbc36e48a0aae))

### [2.1.1](https://github.com/danielkov/use-element-dimensions/compare/v2.1.0...v2.1.1) (2020-10-04)


### Bug Fixes

* stub DOMRect for SSR ([346dca4](https://github.com/danielkov/use-element-dimensions/commit/346dca44f3b08c0a12356910814b7db72b6f4494))

## [2.1.0](https://github.com/danielkov/use-element-dimensions/compare/v2.0.0...v2.1.0) (2020-10-04)


### Features

* expand API ([4908ccd](https://github.com/danielkov/use-element-dimensions/commit/4908ccdcb501cc2f84b94758444860c256b7502c))

## [2.0.0](https://github.com/danielkov/use-element-dimensions/compare/v1.0.0...v2.0.0) (2020-10-03)


### ⚠ BREAKING CHANGES

* - Browsers not supporting ResizeObserver need to polyfill

### Features

* rely on browser instead of polyfill ([eb280ae](https://github.com/danielkov/use-element-dimensions/commit/eb280ae0710199ce4cc72a7b9d59dca44bcd9624))


### Bug Fixes

* **ci:** added filters for branches to all tasks ([#10](https://github.com/danielkov/use-element-dimensions/issues/10)) ([8e997a3](https://github.com/danielkov/use-element-dimensions/commit/8e997a3e5db785b8fbfbfd212d19474d1797a5b9))
* **deps:** update dependency @juggle/resize-observer to v2.3.0 ([#22](https://github.com/danielkov/use-element-dimensions/issues/22)) ([ed93e35](https://github.com/danielkov/use-element-dimensions/commit/ed93e35efd8d57bb4cd4b5584fb6d4cba92a439a))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
