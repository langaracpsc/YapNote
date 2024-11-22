import './App.css'
import NoteView from './components/NoteView';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-slate-950">
        <h1 className="text-3xl font-bold mb-6 font-mono dark:text-white">YapNote</h1>
        <NoteView />
      </div>
    </ThemeProvider>
  );
}

export default App; 
