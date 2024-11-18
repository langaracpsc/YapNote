import { useState, useRef } from "react";

export const useSpeechRecognition = ({ onResult }: { onResult: (transcript: string) => void | undefined }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);

    const speechRecognitionRef = useRef<any>(null);

    if (!speechRecognitionRef.current) {
        speechRecognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        speechRecognitionRef.current.lang = 'en-US';
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.maxAlternatives = 1;

        speechRecognitionRef.current.onresult = (event: any) => {
            const results = Array.from(event.results);
            const latestResult: any = results[results.length - 1];
            const transcript = latestResult[0].transcript;

            setTranscript(transcript);

            if (onResult && latestResult.isFinal) {
                onResult(transcript);
            }
        };

        speechRecognitionRef.current.onerror = (event: any) => {
            setError(event.error);
        };
    }

    const startListening = () => {
        speechRecognitionRef.current.start();
        setIsListening(true);
    };

    const stopListening = () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, error, startListening, stopListening };
}