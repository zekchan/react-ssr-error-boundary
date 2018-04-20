/**
 * @jest-environment jsdom
 */
import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import ErrorFallback from './index'

configure({adapter: new Adapter()})

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

    expect(component.html()).toBe('<div><div>No errors!</div></div>')
  })

  it('Renders fallBack component if children rendering throws error', () => {
    function BadComponent () {
      throw new Error()
    }

    turnOffErrors()
    const component = mount(<ErrorFallback fallBack={() => <FallBack />}>
      <BadComponent />
    </ErrorFallback>)

    expect(component.html()).toBe('<div><div>FallBack!</div></div>')
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

    expect(component.html()).toBe('<div></div>')
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

    const component = mount(
      <ContextProvider>
        <ErrorFallback fallBack={() => <FallBack />}>
          <GoodComponent />
        </ErrorFallback>
      </ContextProvider>
    )

    expect(component.html()).toBe('<div><div>No errors! Context variable</div></div>')
  })
})