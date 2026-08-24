import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Qátesizlik júz berdi',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('cafe_orders');
      localStorage.removeItem('cafe_waiterCalls');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121212] text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#18181b] p-6 rounded-3xl border-2 border-amber-500/40 text-center space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 mx-auto flex items-center justify-center text-amber-400 text-2xl border border-amber-500/40">
              ⚠️
            </div>
            <h2 className="font-serif font-bold text-lg text-amber-300">
              Qayta júklew talap etiledi
            </h2>
            <p className="text-xs text-zinc-400">
              Sistemada qátesizlik júz berdi. Tómendegi túyme arqalı sahypanı jańalań.
            </p>
            {this.state.errorMessage && (
              <div className="text-[11px] font-mono text-amber-300/80 bg-zinc-950 p-2.5 rounded-xl border border-amber-500/20 text-left break-words">
                {this.state.errorMessage}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer active:scale-95"
            >
              Menyudı qayta júklew
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
