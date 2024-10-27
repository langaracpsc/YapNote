import { AssemblyAI, TranscribeParams, Transcript } from 'assemblyai';
import { useState } from 'react';


export default function useDiarization({ onResult }: { onResult: (result: Transcript) => void }) {
    const assemblyAI = new AssemblyAI({
        apiKey: import.meta.env.VITE_ASSEMBLYAI_API_KEY
    });

    const [results, setResults] = useState<Transcript | null>(null);
    
    const [status, setStatus] = useState<string | null>("idle");

    const runDiarization = async (audio: Blob) => {
        setStatus("diarizing");

        const params: TranscribeParams = {  
            audio: new File([audio], 'audio.wav', { type: audio.type }),
            speaker_labels: true
        };

        console.log('Transcription params:', params);

        try {
            const transcript = await assemblyAI.transcripts.transcribe(params);
            console.log('Transcription completed:', transcript);
            setResults(transcript);
            onResult(transcript);
            
            setStatus("done");
        } catch (error) {
            console.error('Transcription error:', error);
        } finally {
            setStatus("idle");
        }
    };

    return {
        runDiarization,
        results,
        status
    };
}