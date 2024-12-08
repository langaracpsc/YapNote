export default function useCrypto() {
    const crypto = typeof window !== "undefined" ? window.crypto : null;
    
    return {
        crypto
    }
}   