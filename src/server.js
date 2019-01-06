import React, { Component } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export function makeProvider (contextTypes) {
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

export function render (self, ProvideContext) {
  try {
    const __html = renderToStaticMarkup(
      <ProvideContext context={self.context}>
        {self.props.children}
      </ProvideContext>
    )
    return <div dangerouslySetInnerHTML={{__html}} />
  } catch (e) {
    return <div>{self.props.fallBack()}</div>
  }
}
