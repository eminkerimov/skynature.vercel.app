import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.scss";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SkyNature encountered an unexpected error.", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section
        className={styles.fallback}
        role="alert"
        aria-labelledby="error-boundary-title"
      >
        <div className={styles.panel}>
          <span className={styles.mark} aria-hidden="true">
            !
          </span>
          <p className={styles.eyebrow}>A brief pause on the trail</p>
          <h1 className={styles.title} id="error-boundary-title">
            Something went wrong
          </h1>
          <p className={styles.message}>
            We could not load this part of SkyNature. Reload the page to try
            again.
          </p>
          <button
            className={styles.reloadButton}
            type="button"
            onClick={this.handleReload}
          >
            Reload page
          </button>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
