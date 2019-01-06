import React, { Component } from 'react'

const server = typeof window === 'undefined' && require('./server')

export function withContext (contextTypes = {}) {
  const ProvideContext = server && server.makeProvider(contextTypes)

  class ServerBoundary extends Component {
    static defaultProps = {
      fallBack: () => null
    }
    static contextTypes = contextTypes
    state = {
      elementToRender: this.props.children
    }

    componentDidCatch () {
      this.setState({
        elementToRender: this.props.fallBack()
      })
    }

    render () {
      if (server) return server.render(this, ProvideContext)
      return <div>{this.state.elementToRender}</div>
    }
  }

  return ServerBoundary
}

export default withContext()
