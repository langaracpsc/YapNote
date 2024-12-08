import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { useLLM } from '@/hooks/useLLM'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

export default function Chat({ noteId, results, show }: { noteId: string, results: any[], show: boolean }) {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
   
    const { initChat, sendMessage } = useLLM({
        model: "llama-3.1-8b-instant",
        noteResults: results,
        onMessage: (content: string) => {
            setMessages(prev => {
                // If this is a new message, add it as a new message
                if (prev.length === 0 || prev[prev.length - 1].role !== 'assistant') {
                    return [...prev, {
                        role: 'assistant',
                        content
                    }]
                }
                // Otherwise update the last message
                return prev.map((msg, i) => {
                    if (i === prev.length - 1) {
                        return {
                            ...msg,
                            content: msg.content + content
                        }
                    }
                    return msg
                })
            })
        }
    })

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        // Add user message
        setMessages(prev => [...prev, {
            role: 'user',
            content: input
        }])
        setInput('')

        await sendMessage(input);
    }

    useEffect(() => {
        initChat();
    }, [noteId])

    return (
        show && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">Open Chat</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] max-h-[90vh]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Chat</AlertDialogTitle>
                        <div className="mt-4 h-[500px] flex flex-col rounded-lg border border-border">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-lg px-4 py-2",
                                                message.role === 'user'
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-foreground"
                                            )}
                                        >
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSubmit} className="border-t border-border p-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                    />
                                    <Button type="submit">Send</Button>
                                </div>
                            </form>
                        </div>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        )
    )
}
