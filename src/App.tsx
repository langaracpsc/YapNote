import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'

function App() {
  const [transcriptOutput, setTranscriptOutput] = useState<string>('');

  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition({ onResult: (result: string) => {
    console.log(result);
    setTranscriptOutput(transcriptOutput + result);
  } });

  return (
    <>
      <h1>YapNote</h1>
      <div>
        <button onClick={(isListening) ? stopListening : startListening} className={`${isListening ? "bg-gray-500" : "bg-blue-500"} text-white p-2 rounded-md`}>{isListening ? 'Listening...' : 'Start Listening'}</button>
      </div>
      <p>{transcript}</p>
    </>
  )
}

export default App
