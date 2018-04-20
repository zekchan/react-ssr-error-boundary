/**
 * @jest-environment node
 */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ErrorFallback, { withContext } from './index'

function FallBack () {
  return <div>FallBack!</div>
}

const errorFn = console.error

function turnOffErrors () {
  console.error = () => {}
}

function turnOnErrors () {
  console.error = errorFn
}

describe('Server side', () => {
  it('Renders child component without errors', () => {
    function GoodComponent () {
      return <div>No errors!</div>
    }

    const html = renderToStaticMarkup(<ErrorFallback fallBack={() => <FallBack />}>
      <GoodComponent />
    </ErrorFallback>)

    expect(html).toBe('<div><div>No errors!</div></div>')
  })

  it('Renders fallBack component if children rendering throws error', () => {
    function BadComponent () {
      throw new Error()
    }

    turnOffErrors()
    const html = renderToStaticMarkup(<ErrorFallback fallBack={() => <FallBack />}>
      <BadComponent />
    </ErrorFallback>)

    expect(html).toBe('<div><div>FallBack!</div></div>')
    turnOnErrors()
  })

  it('Renders child component with context dependencies', () => {
    function GoodComponent (props, context) {
      return <div>No errors! {context.someContext}</div>
    }

    class ContextProvider extends React.Component {
      getChildContext () {
        return {someContext: 'Context variable'}
      }

      render () {
        return this.props.children
      }
    }

    GoodComponent.contextTypes = {
      someContext: () => {}
    }
    ContextProvider.childContextTypes = GoodComponent.contextTypes

    const ErrorFallBackWithContext = withContext(GoodComponent.contextTypes)
    const html = renderToStaticMarkup(
      <ContextProvider>
        <ErrorFallBackWithContext fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallBackWithContext>
      </ContextProvider>
    )

    expect(html).toBe('<div><div>No errors! Context variable</div></div>')
  })
})
