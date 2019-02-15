import React, { Component } from 'react'

const isServer = typeof window === 'undefined'

export function withContext (contextTypes = {}) {
  class ProvideContext extends Component {
    static childContextTypes = contextTypes

    getChildContext () {
      return this.props.context
    }

    render () {
      return this.props.children
    }
  }

  class ServerBoundary extends Component {
    static defaultProps = {
      fallBack: () => null
    }
    static contextTypes = contextTypes
    state = {
      hasError: false
    }

    componentDidCatch () {
      this.setState({
        hasError: true
      })
    }

    render () {
      if (isServer) {
        try {
          const __html = require('react-dom/server').renderToStaticMarkup(
            <ProvideContext context={this.context}>
              {this.props.children}
            </ProvideContext>
          )
          return <div dangerouslySetInnerHTML={{__html}} />
        } catch (e) {
          return <div>{this.props.fallBack()}</div>
        }
      }

      return <div>{this.state.hasError ? this.props.fallback() : this.props.children}</div>
    }
  }

  return ServerBoundary
}

export default withContext()
