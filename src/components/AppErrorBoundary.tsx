import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro de renderização', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container" role="alert">
          <h1>Não foi possível carregar esta página.</h1>
          <button className="button" onClick={() => window.location.reload()}>Tentar novamente</button>
        </main>
      );
    }

    return this.props.children;
  }
}

