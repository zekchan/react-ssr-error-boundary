/**
 * @jest-environment node
 */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ErrorFallback, { withContext } from './index'
import { shim, clearContexts } from './server'
shim()

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
    expect(html).toMatchSnapshot()
  })

  it('Renders fallBack component if children rendering throws error', () => {
    function BadComponent () {
      throw new Error()
    }

    turnOffErrors()
    const html = renderToStaticMarkup(<ErrorFallback fallBack={() => <FallBack />}>
      <BadComponent />
    </ErrorFallback>)

    expect(html).toBe('<div>FallBack!</div>')
    expect(html).toMatchSnapshot()
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
    expect(html).toMatchSnapshot()
  })

  it('Renders child component with new context dependencies', () => {
    const Context = React.createContext()

    function GoodComponent () {
      return (
        <Context.Consumer>
          {context => <div>No errors! {context.someContext}</div>}
        </Context.Consumer>
      )
    }

    function ContextProvider (props) {
      return (
        <Context.Provider value={{someContext: 'Context variable'}}>
          {props.children}
        </Context.Provider>
      )
    }

    const html = renderToStaticMarkup(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(html).toBe('<div><div>No errors! Context variable</div></div>')
    clearContexts()
  })

  it('Renders child component with multiple new context dependencies', () => {
    const Context1 = React.createContext()
    const Context2 = React.createContext()
    const Context3 = React.createContext()

    function GoodComponent () {
      return (
        <Context1.Consumer>
          {context1 => (
              <Context2.Consumer>
                {context2 => (
                    <Context3.Consumer>
                      {context3 => (
                          <div>No errors! {context1.someContext} {context2.someContext} {context3.someContext}</div>
                      )}
                    </Context3.Consumer>
                )}
              </Context2.Consumer>
          )}
        </Context1.Consumer>
      )
    }

    function ContextProvider (props) {
      return (
        <Context1.Provider value={{someContext: 'Context variable1'}}>
          <Context2.Provider value={{someContext: 'Context variable2'}}>
            <Context3.Provider value={{someContext: 'Context variable3'}}>
              {props.children}
            </Context3.Provider>
          </Context2.Provider>
        </Context1.Provider>
      )
    }

    const html = renderToStaticMarkup(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(html).toBe('<div><div>No errors! Context variable1 Context variable2 Context variable3</div></div>')
    expect(html).toMatchSnapshot()
    clearContexts()
  })

  it('Renders fallBack component if children rendering throws error with new contexts', () => {
    const Context = React.createContext()

    function BadComponent () {
      return (
        <Context.Consumer>
          {() => <BadComponentInner/>}
        </Context.Consumer>
      )
    }

    function BadComponentInner () {
      throw new Error()
    }

    function ContextProvider (props) {
      return (
        <Context.Provider value={{someContext: 'Context variable'}}>
          {props.children}
        </Context.Provider>
      )
    }

    turnOffErrors()
    const html = renderToStaticMarkup(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <BadComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(html).toBe('<div>FallBack!</div>')
    expect(html).toMatchSnapshot()
    turnOnErrors()
    clearContexts()
  })

  it('Running createContext shim twice has no effect', () => {
    const {createContext} = React
    shim()
    expect(React.createContext).toBe(createContext)
  })
})
