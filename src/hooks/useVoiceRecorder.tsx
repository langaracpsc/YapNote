import { useEffect, useState, useRef } from "react";

export const useVoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setAudioBlob(event.data);
            }
        };
        setIsRecording(true);
        mediaRecorderRef.current.start();
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            setIsRecording(false);
            mediaRecorderRef.current.stop();
        }
    }

    useEffect(() => {
        if (audioBlob) {
            setAudioURL(URL.createObjectURL(audioBlob));
        }
    }, [audioBlob]);      

    return { isRecording, audioURL, audioBlob, startRecording, stopRecording };
}       