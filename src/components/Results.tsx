import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import Chat from "./Chat";
import { NoteModel } from "./Note";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { AlertDialogAction, AlertDialogCancel } from '@radix-ui/react-alert-dialog';

export default function Results({ results, id, note }: { results: any[], id: string, note: NoteModel }) {
    const createBlobUrl = (text: string) => {
        return URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    }

    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        setBlobUrl(createBlobUrl(JSON.stringify(results)));
    }, [results]);


    const saveSpeakerLabel = (utterance: any, label: string | null) => {
        if (!label || label === '') {
            alert('Enter a valid label');
            return;
        }

        results.forEach((result, i) => {
            if (result.speaker === utterance.speaker) {
                results[i] = { ...result, speaker: label.trimStart().trimEnd() };
            }
        });

        setBlobUrl(createBlobUrl(JSON.stringify(results)));
    }

    const [showChat, setShowChat] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const ResultEntry = ({ utterance }: { utterance: any }) => {
        const labelRef = useRef<HTMLInputElement>(null);

        const defaultValue = utterance.speaker;

        const [changed, setChanged] = useState(false);

        return (<div className="flex flex-row gap-2">
            <div className="flex-1 flex gap-2 items-center bg-gray-200 dark:bg-gray-700 p-2 rounded">
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        ref={labelRef}
                        type="text"
                        defaultValue={defaultValue}
                        className="w-24 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 font-bold dark:text-gray-200"
                        onChange={(e) => {
                            setChanged(e.target.value !== defaultValue);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                saveSpeakerLabel(utterance, labelRef.current?.value || 'Unknown');
                            }
                        }}
                    />
                    <span className="dark:text-gray-200">:</span>
                    <span className="dark:text-gray-200">{utterance.text}</span>
                </div>
                {(changed && <Button
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        saveSpeakerLabel(utterance, labelRef.current?.value || null);
                    }}
                >
                    Save
                </Button>)}
            </div>
        </div>);
    }

    return (<div>
        {results && results.length > 0 && (
            <>
                <div className="flex flex-col gap-3 items-center">
                    <div className="flex flex-row gap-3 items-center">
                        <h2 className="text-xl font-semibold dark:text-gray-200">Diarization Results</h2>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">View JSON</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] max-h-[90vh] w-full overflow-x-scroll">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex flex-row gap-2 items-center overflow-hidden text-ellipsis whitespace-nowrap">
                                        Conversation JSON
                                        {blobUrl && (
                                            <a
                                                href={blobUrl}
                                                download={`note-${id.split('-')[0]}-${Date.now()}.json`}
                                                className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors overflow-hidden text-ellipsis whitespace-nowrap"
                                            >
                                                Download JSON
                                            </a>
                                        )}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="h-full">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-scroll overflow-y-auto max-h-[70vh] w-full">
                                            <pre>
                                                {JSON.stringify(results, null, 2)}
                                            </pre>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Chat noteId={id} results={results} show={showChat} />
                    </div>
                    <div className="flex flex-col bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-y-auto max-h-[70vh] w-full gap-3">
                        {results.map((utterance: any, index: number) => (
                            <ResultEntry key={index} utterance={utterance} />
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>);
} 