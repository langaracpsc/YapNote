import './App.css'
import NoteView from './components/NoteView';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen bg-background">
        <div className="flex flex-col w-full">
          <header className="h-14 flex items-center px-6 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">YapNote</h1>
          </header>
          <main className="flex-1">
            <NoteView />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App; 
