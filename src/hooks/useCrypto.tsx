import { useRef } from "react";

export default function useCrypto() {
    let crypto: Crypto | null = null;    
    
    if (typeof window !== "undefined") {
        crypto = window.crypto;
    } else {
        crypto = require('crypto');
    }

    return {
        crypto
    }
}   