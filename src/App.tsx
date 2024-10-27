import { useState } from 'react'
import './App.css'
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import useDiarization from './hooks/useDiarization';

function App() {
  const [transcriptOutput, setTranscriptOutput] = useState<string>('');
  const [diarizationResults, setDiarizationResults] = useState<any[]>([]);

  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition({
    onResult: (result: string) => {
      console.log(result);
      setTranscriptOutput(transcriptOutput + result);
    }
  });

  const { isRecording, audioURL, audioBlob, startRecording, stopRecording } = useVoiceRecorder();

  if (error) {
    console.error(error);
  }

  const start = async () => {
    startListening();
    startRecording();
  }

  const stop = async () => {
    stopListening();
    stopRecording();
  }

  const { runDiarization, status: diarizationStatus } = useDiarization({
    onResult: (result) => {
      setDiarizationResults(result.utterances?.map((utterance: any) => {
        return {
          speaker: utterance.speaker,
          text: utterance.text
        }
      }) as any[]);
    }
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YapNote</h1>
      <div className="mb-4">
        <button
          onClick={isListening ? stop : start}
          className={`${isListening ? "bg-red-500" : "bg-blue-500"} text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
      <p className="mb-4 p-2 bg-gray-100 rounded">{transcript}</p>
      {(!isRecording && audioURL) && (
        <div className="mb-4">
          <audio src={audioURL?.toString()} controls className="w-full" />
        </div>
      )}
      <div className="flex gap-3">
        {(!isRecording && audioURL) && (
          <a
            href={audioURL?.toString()}
            download
            className="inline-block mb-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            Download Audio
          </a>
        )}
        {(!isRecording && audioBlob && diarizationStatus === "idle") && (
          <button
            onClick={() => runDiarization(audioBlob)}
            className="mb-4 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
          >
            Run Diarization
          </button>
        )}
        {
          (!isRecording && audioBlob && diarizationStatus === "diarizing") && (
            <p>Diarizing...</p>
          )
        }
      </div>
      <div className="mb-4">
        <label htmlFor="audioUpload" className="block mb-2 font-semibold">Upload Audio File:</label>
        <input
          id="audioUpload"
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              runDiarization(file);
            }
          }}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      {diarizationResults && diarizationResults.length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Diarization Results</h2>
          {diarizationResults?.map((utterance: any, index: number) => (
            <p key={index} className="mb-2">
              <strong className="text-blue-600">Speaker {utterance.speaker}:</strong> {utterance.text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
