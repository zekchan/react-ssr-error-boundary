/**
 * @jest-environment jsdom
 */
import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import ErrorFallback from './index'

configure({ adapter: new Adapter() })

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

describe('Client side', () => {
  it('Renders child component without errors', () => {
    function GoodComponent () {
      return <div>No errors!</div>
    }

    const component = mount(<ErrorFallback fallBack={() => <FallBack />}>
      <GoodComponent />
    </ErrorFallback>)

expect(component.html()).toBe('<div>No errors!</div>')
    expect(component.html()).toMatchSnapshot()
  })

  it('Renders fallBack component if children rendering throws error', () => {
    function BadComponent () {
      throw new Error()
    }

    turnOffErrors()
    const component = mount(<ErrorFallback fallBack={() => <FallBack />}>
      <BadComponent />
    </ErrorFallback>)

expect(component.html()).toBe('<div>FallBack!</div>')
    expect(component.html()).toMatchSnapshot()
    turnOnErrors()
  })

  it('Renders nothing when children rendering throws error and no fallBack provided', () => {
    function BadComponent () {
      throw new Error()
    }

    turnOffErrors()
    const component = mount(<ErrorFallback>
      <BadComponent />
    </ErrorFallback>)

    expect(component.html()).toBe(null)
    expect(component.html()).toMatchSnapshot()
    turnOnErrors()
  })

  it('Renders child component with legacy context dependencies', () => {
    function GoodComponent (props, context) {
      return <div>No errors! {context.someContext}</div>
    }

    class ContextProvider extends React.Component {
      getChildContext () {
        return { someContext: 'Context variable' }
      }

      render () {
        return this.props.children
      }
    }

    GoodComponent.contextTypes = {
      someContext: () => {}
    }
    ContextProvider.childContextTypes = GoodComponent.contextTypes

    const component = mount(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(component.html()).toBe('<div>No errors! Context variable</div>')
    expect(component.html()).toMatchSnapshot()
  })

  it('Renders child component with context dependencies', () => {
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
        <Context.Provider value={{ someContext: 'Context variable' }}>
          {props.children}
        </Context.Provider>
      )
    }

    const component = mount(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(component.html()).toBe('<div>No errors! Context variable</div>')
    expect(component.html()).toMatchSnapshot()
  })

  it('Renders child component with multiple contexts dependencies', () => {
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
        <Context1.Provider value={{ someContext: 'Context variable1' }}>
          <Context2.Provider value={{ someContext: 'Context variable2' }}>
            <Context3.Provider value={{ someContext: 'Context variable3' }}>
              {props.children}
            </Context3.Provider>
          </Context2.Provider>
        </Context1.Provider>
      )
    }

    const component = mount(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(component.html()).toBe('<div>No errors! Context variable1 Context variable2 Context variable3</div>')
    expect(component.html()).toMatchSnapshot()
  })

  it('Renders fallBack component if children rendering throws error with contexts', () => {
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
        <Context.Provider value={{ someContext: 'Context variable' }}>
          {props.children}
        </Context.Provider>
      )
    }

    turnOffErrors()
    const component = mount(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <BadComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(component.html()).toBe('<div>FallBack!</div>')
    expect(component.html()).toMatchSnapshot()
    turnOnErrors()
  })
})
