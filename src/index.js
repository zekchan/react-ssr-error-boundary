import React, { Component } from 'react'

const server = typeof window === 'undefined' && require('./server')

export function withContext (contextTypes = {}) {
  const ProvideContext = server && server._makeProvider(contextTypes)

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
      if (server) return server._render(this, ProvideContext)
      return <div>{this.state.hasError ? this.props.fallBack() : this.props.children}</div>
    }
  }

  return ServerBoundary
}

export default withContext()
