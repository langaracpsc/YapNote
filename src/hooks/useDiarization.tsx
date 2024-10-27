import { AssemblyAI, TranscribeParams, Transcript } from 'assemblyai';
import { useState } from 'react';


export default function useDiarization({ onResult }: { onResult: (result: Transcript) => void }) {
    const assemblyAI = new AssemblyAI({
        apiKey: import.meta.env.VITE_ASSEMBLYAI_API_KEY
    });

    const [results, setResults] = useState<Transcript | null>(null);

    const runDiarization = async (audio: Blob, language: string) => {
        console.log('Starting diarization with audio type:', audio.type);
        console.log('Language:', language);

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
        } catch (error) {
            console.error('Transcription error:', error);
        }
    };

    return {
        runDiarization,
        results
    };
}