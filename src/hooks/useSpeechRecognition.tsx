import { useState } from "react";

export const useSpeechRecognition = ({ onResult }: { onResult: (transcript: string) => void | undefined }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);

    const speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    speechRecognition.lang = 'en-US';
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.maxAlternatives = 1;
 
    speechRecognition.onresult = (event: any) => {
        const results = Array.from(event.results);
        const latestResult: any = results[results.length - 1];
        const transcript = latestResult[0].transcript;

        setTranscript(transcript);

        if (onResult && latestResult.isFinal) {
            onResult(transcript);
        }
    };

    speechRecognition.onerror = (event: any) => {
        setError(event.error);
    };

    const startListening = () => {
        speechRecognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        speechRecognition.stop();
        setIsListening(false);
    };

    return { isListening, transcript, error, startListening, stopListening };
}