import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

export default function Results({ results, id }: { results: any[], id: string }) {
    const [, setUpdateTrigger] = useState({});

    const createBlobUrl = (text: string) => {
        return URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    }

    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        setBlobUrl(createBlobUrl(JSON.stringify(results)));
    }, [results]);

    const ResultEntry = ({ utterance }: { utterance: any }) => {
        const labelRef = useRef<HTMLInputElement>(null);

        const defaultValue = utterance.speaker;

        const [changed, setChanged] = useState(false);

        return (<div className="flex flex-row gap-2">
            <div className="flex-1 flex gap-2 items-center bg-gray-200 p-2 rounded">
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        ref={labelRef}
                        type="text"
                        defaultValue={defaultValue}
                        className="w-24 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 font-bold"
                        onChange={(e) => {
                            setChanged(e.target.value !== defaultValue);
                        }}
                    />
                    <span>:</span>
                    <span>{utterance.text}</span>
                </div>
                {(changed && <Button
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                        results.forEach((result, i) => {
                            if (result.speaker === utterance.speaker) {
                                results[i] = { ...result, speaker: labelRef.current?.value };
                            }
                        });

                        setBlobUrl(createBlobUrl(JSON.stringify(results)));
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
                        <h2 className="text-xl font-semibold">Diarization Results</h2>
                        {blobUrl && (
                            <a
                                href={blobUrl}
                                download={`note-${id.split('-')[0]}-${Date.now()}.json`}
                                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                            >
                                Download JSON
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col   bg-gray-100 p-4 rounded overflow-y-auto max-h-96 gap-3">
                        {results.map((utterance: any, index: number) => (
                            <ResultEntry key={index} utterance={utterance} />
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>);
} 