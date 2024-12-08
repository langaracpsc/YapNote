import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { NoteModel } from "./Note";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';
import { ListPlus, Pencil, X } from "lucide-react";

export default function Results({ results, id, note, onUpdate }: { results: any[], id: string, note: NoteModel, onUpdate?: (note: NoteModel) => void }) {
    const createBlobUrl = (text: string) => {
        return URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    }

    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [localResults, setLocalResults] = useState(results);

    useEffect(() => {
        setLocalResults(results);
    }, [results]);

    useEffect(() => {
        setBlobUrl(createBlobUrl(JSON.stringify(localResults)));
    }, [localResults]);

    const saveSpeakerLabel = (utterance: any, label: string | null) => {
        if (!label || label === '') {
            alert('Enter a valid label');
            return;
        }

        const updatedResults = localResults.map(result => {
            if (result.speaker === utterance.speaker) {
                return { ...result, speaker: label.trimStart().trimEnd() };
            }
            return result;
        });

        // Update local state
        setLocalResults(updatedResults);

        // Update the note's results
        note.diarizationResults = updatedResults;
        
        // Update blob URL for download
        setBlobUrl(createBlobUrl(JSON.stringify(updatedResults)));

        // Notify parent of update
        onUpdate?.(note);
    }

    const [isChatOpen, setIsChatOpen] = useState(false);

    const ResultEntry = ({ utterance }: { utterance: any }) => {
        const labelRef = useRef<HTMLInputElement>(null);
        const defaultValue = utterance.speaker;
        const [isEditing, setIsEditing] = useState(false);
        const [changed, setChanged] = useState(false);

        const handleSave = () => {
            saveSpeakerLabel(utterance, labelRef.current?.value || null);
            setIsEditing(false);
            setChanged(false);
        };

        return (
            <div className="flex flex-row gap-2 group">
                <div className="flex-1 flex gap-2 items-center bg-card p-3 rounded-lg border-2 border-border shadow-sm">
                    <div className="flex-1 flex gap-3 items-center">
                        <div 
                            className="relative flex items-center min-w-[120px] cursor-pointer group/label"
                            onClick={() => !isEditing && setIsEditing(true)}
                        >
                            {isEditing ? (
                                <input
                                    ref={labelRef}
                                    type="text"
                                    defaultValue={defaultValue}
                                    className="w-full bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded px-3 py-1.5 font-medium text-foreground border border-input"
                                    onChange={(e) => {
                                        setChanged(e.target.value !== defaultValue);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && changed) {
                                            handleSave();
                                        } else if (e.key === 'Escape') {
                                            setIsEditing(false);
                                            setChanged(false);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (!changed) {
                                            setIsEditing(false);
                                        }
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <span className="font-medium text-foreground px-3 py-1.5">{utterance.speaker}</span>
                                    <Pencil className="h-3.5 w-3.5 text-white opacity-0 group-hover/label:opacity-100 absolute right-2" />
                                </>
                            )}
                        </div>
                        <span className="text-foreground/80">:</span>
                        <span className="text-foreground flex-1">{utterance.text}</span>
                    </div>
                    {(isEditing && changed) && (
                        <Button
                            className="px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Button 
                onClick={() => setIsChatOpen(true)} 
                variant="outline"
                className="border-border hover:bg-accent flex gap-2 items-center"
            >
                <ListPlus className="h-4 w-4 text-white" />
                Show Results
            </Button>

            <AlertDialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <AlertDialogContent className="max-w-[90vw] max-h-[90vh] w-full overflow-hidden flex flex-col bg-background border-2 border-border shadow-lg">
                    <AlertDialogHeader className="border-b-2 border-border pb-4">
                        <AlertDialogTitle className="flex items-center justify-between">
                            <span className="text-lg font-semibold">Diarization Results</span>
                            <div className="flex items-center gap-2">
                                {blobUrl && (
                                    <Button 
                                        variant="secondary" 
                                        asChild
                                        className="ml-2 shadow-sm"
                                    >
                                        <a
                                            href={blobUrl}
                                            download={`note-${id.split('-')[0]}-${Date.now()}.json`}
                                        >
                                            Download JSON
                                        </a>
                                    </Button>
                                )}
                                <AlertDialogCancel className="h-8 w-8 p-0 rounded-full flex items-center justify-center hover:bg-accent">
                                    <X className="h-4 w-4 text-white" />
                                </AlertDialogCancel>
                            </div>
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="flex-1 overflow-y-auto mt-4 px-4">
                        <div className="space-y-4">
                            {localResults.map((utterance, index) => (
                                <ResultEntry key={index} utterance={utterance} />
                            ))}
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 