import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Oups ! Quelque chose a mal tourné.</h1>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                Une erreur inattendue est survenue lors de l'affichage de cette page. 
                Veuillez rafraîchir l'application ou retourner à l'accueil.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-danger whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
              >
                <RefreshCw size={18} /> Rafraîchir la page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-2 bg-surface-alt hover:bg-border text-foreground py-3 rounded-xl font-semibold transition-all"
              >
                <Home size={18} /> Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
