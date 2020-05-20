import React, { Component } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Array to store React contexts
const contexts = []

// Use specific context
export function useContext (Context) {
  contexts.push(Context);
}

// Clear contexts in use
export function clearContexts () {
  contexts.length = 0
}

// Shim `React.createContext()` to capture contexts
let shimmed = false

export function shim () {
  if (shimmed) return
  shimmed = true

  const { createContext } = React
  React.createContext = function() {
    const Context = createContext.apply(this, arguments)
    contexts.push(Context)
    return Context
  }
}

// Create Provider component for specific context types
export function _makeProvider (contextTypes) {
  return class ProvideContext extends Component {
    static childContextTypes = contextTypes

    getChildContext () {
      return this.props.context
    }

    render () {
      return this.props.children
    }
  }
}

// Server-side render, propagating contexts to children
export function _render (self, ProvideContext) {
  // Wrap element in provider for legacy context
  const element = (
    <ProvideContext context={self.context}>
      {self.props.children}
    </ProvideContext>
  )

  // Wrap element in consumers and providers for new context.
  // Consumers are added outside HTML render, to capture value of all contexts.
  // Providers are added inside HTML render, to reinject context values back
  // into the rendered element.
  return stackConsumers(values => {
    const elementWithProviders = stackProviders(element, values)

    try {
      const __html = renderToStaticMarkup(elementWithProviders)
      return <div dangerouslySetInnerHTML={{__html}} />
    } catch (e) {
      return <>{self.props.fallBack()}</>
    }
  })
}

// Create stack of consumer components
function stackConsumers (retFn) {
  const values = []
  let fn = () => retFn(values)

  for (let i = 0; i < contexts.length; i++) {
    const Context = contexts[i]
    const childFn = fn

    fn = () => (
      <Context.Consumer>
        {value => {
          values[i] = value
          return childFn()
        }}
      </Context.Consumer>
    )
  }

  return fn()
}

// Create stack of provider components
function stackProviders (element, values) {
  for (let i = 0; i < values.length; i++) {
    const Context = contexts[i]
    const childElement = element

    element = (
      <Context.Provider value={values[i]}>
        {childElement}
      </Context.Provider>
    )
  }

  return element
}
