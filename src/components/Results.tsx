export default function Results({ results }: { results: any[] }) {
    return <>
        <h2 className="text-xl font-semibold mb-4">Diarization Results</h2>
    { results && results.length > 0 && (
        <div className="bg-gray-100 p-4 rounded overflow-y-auto max-h-96">
          {results.map((utterance: any, index: number) => (
            <p key={index} className="mb-2 bg-gray-200 p-2 rounded">
              <strong className="text-blue-600">Speaker {utterance.speaker}:</strong> {utterance.text}
            </p>
          ))}
        </div>
      )}
    </>;
}   