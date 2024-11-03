export default function useCrypto() {
    let crypto;

    if (typeof window !== "undefined") {
        crypto = window.crypto;
    } else {
        crypto = require('crypto');
    }

    return {
        crypto
    }
}   