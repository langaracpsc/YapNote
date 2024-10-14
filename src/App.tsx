import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';

function App() {
  const [transcriptOutput, setTranscriptOutput] = useState<string>('');

  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition({ onResult: (result: string) => {
    console.log(result);
    setTranscriptOutput(transcriptOutput + result);
  } });

  const { isRecording, audioURL, startRecording, stopRecording } = useVoiceRecorder();

  if (error) {
    alert(error);
  }

  const start = async () => {
    startListening();
    startRecording();
  }

  const stop = async () => {
    stopListening();
    stopRecording();
  }

  return (
    <>
      <h1>YapNote</h1>
      <div>
        <button onClick={(isListening) ? stop  : start} className={`${isListening ? "bg-gray-500" : "bg-blue-500"} text-white p-2 rounded-md`}>{isListening ? 'Listening...' : 'Start Listening'}</button>
      </div>
      <p>{transcript}</p>
      {(!isRecording && audioURL) && <audio src={audioURL?.toString()} controls />}
      {(!isRecording) && <a href={audioURL?.toString()} download>Download</a>}
    </>
  )
}

export default App
