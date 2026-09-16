import { Component, type ErrorInfo, type ReactNode } from 'react';

type Estado = { falhou: boolean };

export default class LimiteErro extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { falhou: false };

  static getDerivedStateFromError(): Estado { return { falhou: true }; }

  componentDidCatch(erro: Error, informacao: ErrorInfo) {
    console.error('Erro de renderização', { erro, informacao });
  }

  render() {
    if (this.state.falhou) {
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
