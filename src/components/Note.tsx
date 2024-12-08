import { useEffect, useRef, useState } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import useDiarization from '@/hooks/useDiarization';
import Results from '@/components/Results';
import { Button } from '@/components/ui/button';
    
export interface Audio {
    blob: Blob | null;
    url: string | null;
}
export interface NoteModel {
    id: string;
    transcript: string;
    diarizationResults: any[];
    createdAt: Date | null;
    audio: Blob | null;
    url: string | null;
}


export function Note({ noteRef, onResult }: { noteRef: React.MutableRefObject<NoteModel>, onResult?: (note: NoteModel) => void }) {
    const [transcriptOutput, setTranscriptOutput] = useState<string>('');
    const [diarizationResults, setDiarizationResults] = useState<any[]>([]);

    useEffect(() => {
        // Reset state when noteRef changes
        setTranscriptOutput(''); // Reset transcript for new note
        setDiarizationResults(noteRef.current.diarizationResults || []);
        if (fileRef.current) {
            fileRef.current.value = '';
        }

        // Reset audio state
        stopRecording();
        setLocalAudioBlob(null);
    }, [noteRef.current?.id]);

    const { isListening, error, startListening, stopListening } = useSpeechRecognition({
        onResult: (result: string) => {
            setTranscriptOutput(prev => prev + ' ' + result);
        }
    });

    const { isRecording, audioURL, audioBlob, startRecording, stopRecording } = useVoiceRecorder();
    const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null);

    if (error) {
        console.error('Speech recognition error:', error);
    }

    const start = async () => {
        try {
            await startListening();
            await startRecording();
        } catch (err) {
            console.error('Error starting recording:', err);
        }
    }

    const stop = async () => {
        try {
            await stopListening();
            await stopRecording();

            if (noteRef.current) {
                noteRef.current.transcript = transcriptOutput.trim();
                noteRef.current.audio = audioBlob;
                noteRef.current.url = audioURL;
                onResult?.(noteRef.current);
            }
        } catch (err) {
            console.error('Error stopping recording:', err);
        }
    }

    useEffect(() => {
        if (audioBlob && audioBlob !== noteRef.current?.audio) {
            setLocalAudioBlob(audioBlob);
            if (noteRef.current) {
                noteRef.current.audio = audioBlob;
            }
        }
    }, [audioBlob]);

    const { runDiarization, status: diarizationStatus } = useDiarization({
        onResult: (result) => {
            if (!result?.utterances) return;

            const processedResults = result.utterances.map((utterance: any) => ({
                speaker: utterance.speaker,
                text: utterance.text
            }));

            setDiarizationResults(processedResults);
            if (noteRef.current) {
                noteRef.current.diarizationResults = processedResults;
                onResult?.(noteRef.current);
            }
        }
    });

    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        try {
            await runDiarization(file);
        } catch (err) {
            console.error('Error running diarization:', err);
        }
    };

    return (
        <div className="flex flex-col w-full gap-8">
            <div className="flex gap-3 justify-center">
                <Button
                    onClick={isListening ? stop : start}
                    variant={isListening ? "destructive" : "default"}
                    disabled={diarizationStatus === "diarizing"}
                >
                    {isListening ? 'Stop Recording' : 'Start Recording'}
                </Button>

                {(!isRecording && audioURL) && (
                    <Button
                        asChild
                        variant="secondary"
                    >
                        <a href={audioURL} download="recording.wav">
                            Download Audio
                        </a>
                    </Button>
                )}

                {(!isRecording && localAudioBlob && diarizationStatus === "idle") && (
                    <Button
                        variant="secondary"
                        onClick={() => runDiarization(localAudioBlob)}
                    >
                        Run Diarization
                    </Button>
                )}
            </div>

            {transcriptOutput && (
                <div className="rounded-lg border border-border bg-muted/50 p-6">
                    <p className="text-sm text-foreground">{transcriptOutput}</p>
                </div>
            )}

            {(!isRecording && audioURL) && (
                <div className="rounded-lg border border-border p-6">
                    <audio src={audioURL} controls className="w-full" />
                </div>
            )}

            {(!isRecording && !localAudioBlob) && (
                <div className="relative">
                    <div className="space-y-6">
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                or
                            </span>
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="audioUpload" className="text-sm font-medium text-foreground">
                                Upload Audio File
                            </label>
                            <input
                                id="audioUpload"
                                type="file"
                                accept="audio/*"
                                ref={fileRef}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFileUpload(file);
                                    }
                                }}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium hover:bg-accent/50"
                                disabled={diarizationStatus === "diarizing"}
                            />
                        </div>
                    </div>
                </div>
            )}

            {diarizationStatus === "diarizing" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Processing audio...</span>
                </div>
            )}
  
            {!isRecording && diarizationResults.length > 0 && (
                <Results 
                    results={diarizationResults} 
                    id={noteRef.current?.id || ''} 
                    note={noteRef.current}
                    onUpdate={onResult}
                />
            )}
        </div>
    )
}
