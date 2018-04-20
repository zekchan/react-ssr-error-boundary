# React SSR error boundary
[![NPM version](https://img.shields.io/npm/v/react-ssr-error-boundary.svg)](https://www.npmjs.com/package/react-ssr-error-boundary)
[![codecov](https://codecov.io/gh/zekchan/react-ssr-error-boundary/coverage.svg)](https://codecov.io/gh/zekchan/react-ssr-error-boundary)
[![Dev Dependency Status](https://david-dm.org/zekchan/react-ssr-error-boundary/dev-status.svg)](https://david-dm.org/zekchan/react-ssr-error-boundary?type=dev)

React 16 introduced new `componentDidCatch` lifecycle method, but it is not working when you render page on server using `renderToString`.
If you want just render fallback when your component throw error you can use `react-ssr-error-boundary`.

## Installation:
Add the latest version of `react-ssr-error-boundary` to your package.json:
```
npm install react-ssr-error-boundary
```
or
```
yarn add react-ssr-error-boundary
```

## Usage:
Code below will render `<div>Error Fallback</div>` on server if ProblemComponent rendering fails:
```javascript
import ErrorFallBack from 'react-ssr-error-boundary'


function App() {
  return <ErrorFallBack fallBack={() => <div>Error Fallback</div>}>
    <ProblemComponent />
  </ErrorFallBack>
}
```
If yours ProblemComponent depends on context (your are using Redux for example), you should create your own ErrorFallBack component by providing contextTypes:

```javascript
import { withContext } from 'react-ssr-error-boundary'
const ErrorFallBack = withContext({ store: PropTypes.object })

function App() {
  return <ErrorFallBack fallBack={() => <div>Error Fallback</div>}>
    <ProblemComponent />
  </ErrorFallBack>
}
```