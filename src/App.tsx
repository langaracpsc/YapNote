import './App.css'
import NoteView from './components/NoteView';

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-6 font-mono">YapNote</h1>
        <NoteView />
      </div>
    </>
  );
}

export default App; 
