import React from 'react';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Xatolik yuz berdi</h2>
            <p>Sahifani yuklashda muammo bo'ldi. Iltimos, sahifani yangilang.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="reload-btn"
            >
              Sahifani yangilash
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Texnik ma'lumotlar</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;