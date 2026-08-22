import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-300 rounded-2xl p-6 shadow-xl space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-100 text-black rounded-2xl mx-auto flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-8 h-8 text-black" />
            </div>
            
            <h2 className="text-xl font-extrabold text-black">
              Умный Органайзер Самозанятого
            </h2>
            
            <p className="text-xs text-black font-semibold">
              Произошла непредвиденная ошибка интерфейса. Ваши данные сохранены в локальном хранилище.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-left text-xs font-mono text-black font-semibold overflow-x-auto max-h-32">
                {this.state.error.message || 'Script Error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                <span>Обновить страницу</span>
              </button>
              
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-300"
              >
                <Home className="w-4 h-4 text-black" />
                <span>На главную</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
