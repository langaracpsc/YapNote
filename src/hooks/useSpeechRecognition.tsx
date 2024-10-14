import { useEffect, useState } from "react";

export const useSpeechRecognition = ({ onResult }: { onResult: (transcript: string) => void | undefined }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);

    const speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    speechRecognition.lang = 'en-US';
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = Array.from(event.results);
        const latestResult: any = results[results.length - 1];
        const transcript = latestResult[0].transcript;

        setTranscript(transcript);

        if (onResult && latestResult.isFinal) {
            onResult(transcript);
        }
    };

    speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
    };

    const startListening = () => {
        setIsListening(true);
        speechRecognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
        speechRecognition.stop();
    };

    return { isListening, transcript, error, startListening, stopListening };
}