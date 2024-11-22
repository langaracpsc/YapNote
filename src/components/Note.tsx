import { useEffect, useRef, useState } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import useDiarization from '@/hooks/useDiarization';
import Results from '@/components/Results';

export interface NoteModel {
    id: string;
    transcript: string;
    diarizationResults: any[];
    createdAt: Date | null;
}

export function Note({ noteRef, onResult }: { noteRef: React.MutableRefObject<NoteModel>, onResult?: (note: NoteModel) => void }) {
    const [transcriptOutput, setTranscriptOutput] = useState<string>('');
    const [diarizationResults, setDiarizationResults] = useState<any[]>([]);

    useEffect(() => {
        // Reset state when noteRef changes
        setTranscriptOutput(''); // Reset transcript for new note
        setDiarizationResults(noteRef.current.diarizationResults);
        if (fileRef.current) {
            fileRef.current.value = '';
        }

        // Reset audio state
        stopRecording();
        setLocalAudioBlob(null); // Reset audio blob for new note:s
    }, [noteRef.current.id]);

    const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition({
        onResult: (result: string) => {
            console.log(result);
            setTranscriptOutput(prev => prev + result);
        }
    });

    const { isRecording, audioURL, audioBlob, startRecording, stopRecording } = useVoiceRecorder();
    const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null);

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

        noteRef.current.transcript = transcriptOutput;
    }

    useEffect(() => {
        setLocalAudioBlob(audioBlob);
    }, [audioBlob]);

    const { runDiarization, status: diarizationStatus } = useDiarization({
        onResult: (result) => {
            const processedResults = result.utterances?.map((utterance: any) => ({
                speaker: utterance.speaker,
                text: utterance.text
            })) ?? [];

            setDiarizationResults(processedResults);
            noteRef.current.diarizationResults = processedResults;
            onResult?.(noteRef.current);
        }
    });

    const fileRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col w-full h-full gap-3">
            <div className="flex flex-col gap-4 items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Note {noteRef.current.id.split('-')[0]}</span>
            </div>
            <div className="mb-4">
                <button
                    onClick={isListening ? stop : start}
                    className={`${isListening ? "bg-red-500" : "bg-blue-500"} text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity`}
                >
                    {isListening ? 'Stop' : 'Start'}
                </button>
            </div>
            {transcript && (
                <p className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded dark:text-gray-200">{transcript}</p>
            )}
            {(!isRecording && audioURL) && (
                <div className="mb-4">
                    <audio src={audioURL} controls className="w-full" />
                </div>
            )}
            <div className="flex gap-3">
                {(!isRecording && audioURL) && (
                    <a
                        href={audioURL}
                        download
                        className="inline-block mb-4 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        Download Audio
                    </a>
                )}
                {(!isRecording && localAudioBlob && diarizationStatus === "idle") && (
                    <button
                        onClick={() => runDiarization(localAudioBlob)}
                        className="mb-4 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        Run Diarization
                    </button>
                )}
                {(!isRecording && localAudioBlob && diarizationStatus === "diarizing") && (
                    <p className="dark:text-gray-200">Diarizing...</p>
                )}
            </div>
            {(!isRecording && !localAudioBlob) && (
                <div className="mb-4">
                    <label htmlFor="audioUpload" className="block mb-2 font-semibold dark:text-gray-200">Upload Audio File:</label>
                    <input
                        id="audioUpload"
                        type="file"
                        accept="audio/*"
                        ref={fileRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                runDiarization(file);
                            }
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-gray-200"
                    />
                </div>
            )}
            {diarizationStatus === "diarizing" && fileRef.current?.files?.length && <p>Diarizing...</p>}
            {!isRecording && <Results results={diarizationResults} id={noteRef.current.id} note={noteRef.current} />}
        </div>
    )
}
