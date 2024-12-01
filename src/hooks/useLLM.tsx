import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions.mjs";
import { useState } from "react";

export const useLLM = ({ model, noteResults, onMessage }: { model: string, noteResults: any[], onMessage: (message: string) => void }) => {
    const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });
    // Move messageHistory inside useState to persist between renders
    const [messageHistory, setMessageHistory] = useState<{ role: "system" | "user" | "assistant", content: string }[]>([]);

    return {
        initChat: async (noteId: string) => {
            try {
                // Reset history on init
                const initialMessages = [
                    {
                        role: "system" as const,
                        content: "You are a helpful assistant that analyzes conversation transcripts and helps users understand them better."
                    },
                    {
                        role: "user" as const,
                        content: `Here are my notes: ${JSON.stringify(noteResults, null, 2)}. Please help me analyze them. Respond with minimal text initially until asked for more.`
                    }
                ];
                
                setMessageHistory(initialMessages);

                console.log("Message history after init:", initialMessages);

                const chatCompletion = await groq.chat.completions.create({
                    messages: initialMessages,
                    model: model,
                    temperature: 0.5,
                    max_tokens: 1024,
                    top_p: 1,
                    stream: true
                });

                let assistantResponse = '';
                for await (const chunk of chatCompletion) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        assistantResponse += content;
                        onMessage(content);
                    }
                }

                setMessageHistory(prev => [...prev, {
                    role: "assistant",
                    content: assistantResponse
                }]);

                console.log("Message history after assistant response:", messageHistory);

                return "";
            } catch (error) {
                console.error("Error getting chat completion:", error);
                return "";
            }
        },

        sendMessage: async (message: string) => {
            try {
                setMessageHistory(prev => [...prev, {
                    role: "user",
                    content: message
                }]);

                const currentHistory = [...messageHistory, {
                    role: "user",
                    content: message
                }];

                console.log("Message history after user message:", currentHistory);

                const chatCompletion = await groq.chat.completions.create({
                    messages: currentHistory as ChatCompletionMessageParam[],
                    model: model,
                    temperature: 0.5,
                    max_tokens: 1024,
                    top_p: 1,
                    stream: true
                });

                let assistantResponse = '';
                for await (const chunk of chatCompletion) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        assistantResponse += content;
                        onMessage(content);
                    }
                }

                setMessageHistory((prev: any) => [...prev, {
                    role: "assistant",
                    content: assistantResponse
                }]);

                console.log("Message history after assistant response:", messageHistory);

                return "";
            } catch (error) {
                console.error("Error sending message:", error);
                return "";
            }
        }
    }
}