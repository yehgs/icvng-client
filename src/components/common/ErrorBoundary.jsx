// Create a new file called ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 p-4 rounded-md m-4">
          <h2 className="text-red-800 font-medium">Something went wrong.</h2>
          <p className="text-red-600">
            An error occurred while loading this page component.
          </p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
