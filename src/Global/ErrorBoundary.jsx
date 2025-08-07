import React from 'react';
import {ErrorScreen} from '../Screens/ErrorScreen';
import Logger from '../Logger/Logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null, errorInfo: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    // Логування помилки через наявний Logger
    const errorMessage = `
=== ERROR BOUNDARY ===
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Time: ${new Date().toISOString()}
==================
    `;

    Logger.error(errorMessage);
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Зберігаємо детальну інформацію про помилку
    this.setState({errorInfo});
  }

  handleRetry = () => {
    Logger.log('ErrorBoundary: User clicked retry button');
    this.setState({hasError: false, error: null, errorInfo: null});
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          title="Щось пішло не так"
          message={this.state.error?.message || 'Виникла непередбачена помилка'}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
