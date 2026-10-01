// --- 3. EXTENDED VIGENERE CIPHER (256 ASCII/BYTES) ---
export const extendedVigenereCipher = (data: Uint8Array, key: string, decrypt = false): Uint8Array => {
  if (data.length === 0 || key.length === 0) return data;

  const result = new Uint8Array(data.length);
  const keyBytes = new TextEncoder().encode(key);

  for (let i = 0; i < data.length; i++) {
    const shift = keyBytes[i % keyBytes.length];
    if (decrypt) {
      result[i] = (data[i] - shift + 256) % 256;
    } else {
      result[i] = (data[i] + shift) % 256;
    }
  }

  return result;
};

// --- COLUMNAR TRANSPOSITION (for Super Encryption) ---
const columnarTransposition = (data: Uint8Array, key: string, decrypt = false): Uint8Array => {
  if (data.length === 0 || key.length === 0) return data;
  
  const keyLength = key.length;
  // Create an order array based on key characters
  const keyIndices = key.split('').map((char, index) => ({ char, index }));
  keyIndices.sort((a, b) => a.char.localeCompare(b.char));
  
  const columns = keyLength;
  const rows = Math.ceil(data.length / columns);
  const result = new Uint8Array(data.length);
  
  if (!decrypt) {
    let resultIdx = 0;
    for (let i = 0; i < columns; i++) {
      const originalCol = keyIndices[i].index;
      for (let r = 0; r < rows; r++) {
        const dataIdx = r * columns + originalCol;
        if (dataIdx < data.length) {
          result[resultIdx++] = data[dataIdx];
        }
      }
    }
  } else {
    // Decrypt Transposition
    // First, determine lengths of each column
    const colLengths = new Array(columns).fill(Math.floor(data.length / columns));
    const remainder = data.length % columns;
    for (let i = 0; i < remainder; i++) {
      colLengths[i]++;
    }
    
    // Fill columns according to the sorted key order
    const orderedColLengths = keyIndices.map(k => colLengths[k.index]);
    const grid: number[][] = Array.from({ length: columns }, () => []);
    
    let dataIdx = 0;
    for (let i = 0; i < columns; i++) {
      const len = orderedColLengths[i];
      for (let j = 0; j < len; j++) {
        grid[i].push(data[dataIdx++]);
      }
    }
    
    // Read row by row using original column order
    let resultIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const sortedColIdx = keyIndices.findIndex(k => k.index === c);
        if (r < grid[sortedColIdx].length) {
          result[resultIdx++] = grid[sortedColIdx][r];
        }
      }
    }
  }
  
  return result;
};

// --- 7. SUPER ENCRYPTION ---
export const superEncryptionCipher = (data: Uint8Array, key: string, decrypt = false): Uint8Array => {
  if (decrypt) {
    const transposed = columnarTransposition(data, key, true);
    return extendedVigenereCipher(transposed, key, true);
  } else {
    const vigenere = extendedVigenereCipher(data, key, false);
    return columnarTransposition(vigenere, key, false);
  }
};

// --- 8. ENIGMA CIPHER (Simplified 256-Byte Version) ---
export const enigmaCipher = (data: Uint8Array, key: string, decrypt = false): Uint8Array => {
  // Simplified Enigma with 256 possible byte values instead of 26 alphabet
  if (data.length === 0 || key.length === 0) return data;
  
  const result = new Uint8Array(data.length);
  
  // Use key to derive initial rotor states (0-255)
  const keyBytes = new TextEncoder().encode(key);
  let r1 = keyBytes.length > 0 ? keyBytes[0] : 0;
  let r2 = keyBytes.length > 1 ? keyBytes[1] : 0;
  let r3 = keyBytes.length > 2 ? keyBytes[2] : 0;

  // Simplified rotors (fixed arbitrary permutations based on standard math to avoid massive arrays)
  const forwardRotor = (byte: number, rotation: number, step: number) => (byte + rotation * step) % 256;
  const backwardRotor = (byte: number, rotation: number, step: number) => (byte - rotation * step + 256 * 10) % 256;
  
  const reflector = (byte: number) => (255 - byte); // Simple reflection

  for (let i = 0; i < data.length; i++) {
    // Step rotors
    r1 = (r1 + 1) % 256;
    if (r1 === 0) {
      r2 = (r2 + 1) % 256;
      if (r2 === 0) {
        r3 = (r3 + 1) % 256;
      }
    }

    let byte = data[i];

    if (!decrypt) {
      // Forward pass
      byte = forwardRotor(byte, r1, 3);
      byte = forwardRotor(byte, r2, 5);
      byte = forwardRotor(byte, r3, 7);
      
      byte = reflector(byte);
      
      // Backward pass
      byte = backwardRotor(byte, r3, 7);
      byte = backwardRotor(byte, r2, 5);
      byte = backwardRotor(byte, r1, 3);
    } else {
      // For this simplified Enigma, because the reflector is its own inverse
      // and we just need the same rotor state to decrypt (Enigma is reciprocal)
      // Actually, true reciprocal enigma: encrypting = decrypting.
      // So the logic is exactly the same!
      byte = forwardRotor(byte, r1, 3);
      byte = forwardRotor(byte, r2, 5);
      byte = forwardRotor(byte, r3, 7);
      
      byte = reflector(byte);
      
      byte = backwardRotor(byte, r3, 7);
      byte = backwardRotor(byte, r2, 5);
      byte = backwardRotor(byte, r1, 3);
    }

    result[i] = byte;
  }

  return result;
};
