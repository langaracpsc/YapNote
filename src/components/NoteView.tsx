import {
    Card, CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Note, NoteModel } from "./Note";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import useCrypto from "@/hooks/useCrypto";


export default function NoteView() {
    const note = useRef<NoteModel>({
        id: '',
        transcript: '',
        diarizationResults: [],
        createdAt: null
    });

    const [currentNote, setCurrentNote] = useState<MutableRefObject<NoteModel>>(note);
    const [notes, setNotes] = useState<NoteModel[]>([]);
    const [, setUpdateTrigger] = useState({});

    const updateNote = () => {
        setCurrentNote(note);
        setUpdateTrigger({}); // Trigger re-render when note updates
    };

    const createNote = (): NoteModel => {
        const { crypto } = useCrypto();

        let newNote: NoteModel = {
            id: crypto.randomUUID(),
            transcript: '',
            diarizationResults: [],
            createdAt: new Date()
        };

        note.current = newNote;
        return newNote;
    }

    const NoteEntry = ({ id, onClick }: { id: string, onClick?: (note: NoteModel) => void }) => {
        return (<>
            <div className="w-full">
                <Button
                    className={`text-gray-300 bg-transparent hover:text-gray-100 hover:bg-zinc-800 transition-transform cursor-pointer w-full ${currentNote.current.id === id ? 'bg-zinc-800' : ''}`}
                    onClick={() => {
                        const foundNote = notes?.find(note => note.id == id);

                        if (foundNote) {
                            note.current = foundNote;
                            onClick?.(foundNote);
                            updateNote();
                            console.log("currentNote:", currentNote.current);
                        }
                    }}
                >
                    Note {id.split('-')[0]}
                </Button>
            </div>
        </>);
    };

    return (<>
        <Card className="flex flex-col h-[calc(100vh-20rem)] w-[calc(80vw)] bg-zinc-900 border-zinc-800">
            <CardHeader>
                <div className="grid grid-cols-2 items-center">
                    <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-200">Notes</CardTitle>

                        {notes.length >= 1 && <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => {
                                const newNote = createNote();
                                setNotes([...notes, newNote]);
                                note.current = newNote;
                            }} 
                            className="mr-5 border-zinc-700 hover:bg-zinc-800 hover:text-gray-200"
                        >
                            <PlusIcon />
                        </Button>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 overflow-y-auto">
                <div className="col-span-1 flex flex-col gap-[0.25rem] items-start border-r border-zinc-700 pr-4 overflow-y-auto">
                    {(notes.length < 1) && <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-[calc(100%-4rem)] border-zinc-700 hover:bg-zinc-800 hover:text-gray-200" 
                        onClick={() => {
                            const newNote = createNote();
                            setNotes([newNote, ...notes]);
                            note.current = newNote;
                        }}
                    >
                        <PlusIcon />New Note
                    </Button>}
                    {notes?.map((n) => <NoteEntry id={n.id}/>)}
                </div>
                {currentNote.current.id != '' && <div className="col-span-1 flex flex-col gap-4 pl-4">
                    <Note noteRef={currentNote} onResult={updateNote} />
                </div> || <div className="col-span-1 flex flex-col items-center justify-center gap-4 pl-4">
                        <h4 className="text-gray-400">No note selected</h4>
                    </div>}
            </CardContent>
        </Card>
    </>);
}
