import { Note, NoteModel } from "./Note";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { TrashIcon } from "@radix-ui/react-icons";

import useCrypto from "@/hooks/useCrypto";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface NoteViewState {
    notes: NoteModel[];
}   

export default function NoteView() {
    const { crypto } = useCrypto();
    const note = useRef<NoteModel>({
        id: '',
        transcript: '',
        diarizationResults: [],
        createdAt: null,
        audio: null,
        url: null
    });

    const [currentNote, setCurrentNote] = useState<MutableRefObject<NoteModel>>(note);
    const [notes, setNotes] = useLocalStorage<NoteModel[]>("notes", []);
    const [, setUpdateTrigger] = useState({});

    const updateNote = () => {
        setCurrentNote(note);
        setUpdateTrigger({}); // Trigger re-render when note updates
        
        // Update notes array with current note
        const noteIndex = notes.findIndex(n => n.id === note.current.id);

        if (noteIndex >= 0) {
            const updatedNotes = [...notes];

            updatedNotes[noteIndex] = note.current;

            setNotes(updatedNotes);
        }
    };

    const createNote = (): NoteModel => {
        let newNote: NoteModel = {
            id: crypto?.randomUUID() || '',
            transcript: '',
            diarizationResults: [],
            createdAt: new Date(),
            audio: null,
            url: null
        };

        note.current = newNote;
        return newNote;
    }

    const deleteNote = (id: string) => {
        const updatedNotes = notes.filter(n => n.id !== id);
        setNotes(updatedNotes);
        
        // If we're deleting the current note, or if this was the last note
        if (currentNote.current.id === id || updatedNotes.length === 0) {
            currentNote.current = {
                id: '',
                transcript: '',
                diarizationResults: [],
                createdAt: null,
                audio: null,
                url: null
            };
            updateNote();
        }
    };

    const NoteEntry = ({ id, onClick, className }: 
            { id: string, onClick?: (note: NoteModel) => void, className?: string }) => {
        return (
            <div className="w-full group flex items-center">
                <Button
                    className={`text-gray-300 bg-transparent hover:text-gray-100 hover:bg-zinc-800 transition-transform cursor-pointer flex-1 ${currentNote.current.id === id ? 'bg-zinc-800' : ''} ${className}`}
                    onClick={() => {
                        const foundNote = notes?.find(note => note.id === id);
                        if (foundNote) {
                            note.current = foundNote;
                            onClick?.(foundNote);
                            updateNote();
                        }
                    }}
                >
                    Note {id.split('-')[0]}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground invisible group-hover:visible hover:text-foreground bg-transparent hover:bg-accent/50 h-8 w-8 p-0 mr-1" 
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(id);
                    }}
                >
                    <TrashIcon className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    useEffect(() => {
        console.log(currentNote.current);
    }, [currentNote]);

    return (<>
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r border-border">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-foreground">Notes</h2>
                        {notes.length >= 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                    const newNote = createNote();
                                    setNotes([...notes, newNote]);
                                    note.current = newNote;
                                    updateNote();
                                }}
                            >
                                <Plus className="h-4 w-4 text-foreground" />
                            </Button>
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        {(notes.length < 1) && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground"
                                onClick={() => {
                                    const newNote = createNote();
                                    setNotes([newNote]);
                                    note.current = newNote;
                                    updateNote();
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Note
                            </Button>
                        )}
                        {notes?.map((n) => (
                            <NoteEntry 
                                key={n.id} 
                                id={n.id}
                                className="w-full justify-start px-2 py-1.5 text-sm text-muted-foreground"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {currentNote.current.id !== '' ? (
                    <div className="p-6">
                        <div className="mb-6">
                            <span className="text-base font-semibold text-foreground">
                                Note {currentNote.current?.id?.split('-')[0] || ''}
                            </span>
                        </div>
                        <Note 
                            noteRef={currentNote} 
                            onResult={updateNote}
                        />
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center p-20">
                        <p className="text-sm text-muted-foreground">No note selected</p>
                    </div>
                )}
            </div>
        </div>
    </>);
}