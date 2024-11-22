import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { AlertDialogAction, AlertDialogCancel } from '@radix-ui/react-alert-dialog'

export default function Chat( { noteId, results, show }: { noteId: string, results: any[]  , show: boolean }) {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

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

        // TODO: Add API call here
        // For now just echo back
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `You said: ${input}`
            }])
        }, 100)
    }

    return (
        show &&
        <AlertDialog>
            <AlertDialogTrigger>Open Chat</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Chat {noteId}</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="flex flex-col h-[500px] w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                                                }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 p-2 rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button type="submit">Send</Button>
                                </div>
                            </form>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
