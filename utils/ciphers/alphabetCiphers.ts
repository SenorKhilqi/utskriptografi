import * as math from 'mathjs';

// --- UTILITIES ---
const cleanString = (str: string) => str.replace(/[^A-Za-z]/g, '').toUpperCase();

// --- 1 & 2. VIGENERE & AUTO-KEY VIGENERE ---
export const vigenereCipher = (text: string, key: string, decrypt = false, isAutoKey = false) => {
  let cleanedText = cleanString(text);
  let cleanedKey = cleanString(key);
  
  if (cleanedText.length === 0 || cleanedKey.length === 0) return '';

  let result = '';
  let currentKey = cleanedKey;

  for (let i = 0; i < cleanedText.length; i++) {
    const charCode = cleanedText.charCodeAt(i) - 65;
    const keyChar = currentKey[i % currentKey.length];
    const shift = keyChar.charCodeAt(0) - 65;
    
    let newCharCode;
    if (decrypt) {
      newCharCode = (charCode - shift + 26) % 26;
      if (isAutoKey) currentKey += String.fromCharCode(newCharCode + 65);
    } else {
      newCharCode = (charCode + shift) % 26;
      if (isAutoKey) currentKey += cleanedText[i];
    }
    
    result += String.fromCharCode(newCharCode + 65);
  }
  
  return result;
};

// --- 4. PLAYFAIR CIPHER ---
const generatePlayfairMatrix = (key: string) => {
  const cleanedKey = cleanString(key).replace(/J/g, 'I');
  const matrix: string[] = [];
  const used = new Set<string>();

  for (const char of cleanedKey) {
    if (!used.has(char)) {
      matrix.push(char);
      used.add(char);
    }
  }

  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    if (char === 'J') continue;
    if (!used.has(char)) {
      matrix.push(char);
      used.add(char);
    }
  }
  return matrix;
};

const getPosition = (matrix: string[], char: string) => {
  const index = matrix.indexOf(char);
  return { row: Math.floor(index / 5), col: index % 5 };
};

export const playfairCipher = (text: string, key: string, decrypt = false) => {
  let cleanedText = cleanString(text).replace(/J/g, 'I');
  if (cleanedText.length === 0) return '';

  if (!decrypt) {
    let paired = '';
    for (let i = 0; i < cleanedText.length; i += 2) {
      paired += cleanedText[i];
      if (i + 1 < cleanedText.length) {
        if (cleanedText[i] === cleanedText[i + 1]) {
          paired += 'X';
          i--;
        } else {
          paired += cleanedText[i + 1];
        }
      } else {
        paired += 'X';
      }
    }
    cleanedText = paired;
  }

  const matrix = generatePlayfairMatrix(key);
  let result = '';

  for (let i = 0; i < cleanedText.length; i += 2) {
    const p1 = getPosition(matrix, cleanedText[i]);
    const p2 = getPosition(matrix, cleanedText[i + 1]);

    if (p1.row === p2.row) {
      result += matrix[p1.row * 5 + (p1.col + (decrypt ? 4 : 1)) % 5];
      result += matrix[p2.row * 5 + (p2.col + (decrypt ? 4 : 1)) % 5];
    } else if (p1.col === p2.col) {
      result += matrix[((p1.row + (decrypt ? 4 : 1)) % 5) * 5 + p1.col];
      result += matrix[((p2.row + (decrypt ? 4 : 1)) % 5) * 5 + p2.col];
    } else {
      result += matrix[p1.row * 5 + p2.col];
      result += matrix[p2.row * 5 + p1.col];
    }
  }

  return result;
};

// --- 5. AFFINE CIPHER ---
const modInverse = (a: number, m: number) => {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return 1;
};

export const affineCipher = (text: string, m: number, b: number, decrypt = false) => {
  const cleanedText = cleanString(text);
  if (cleanedText.length === 0) return '';
  
  // m and 26 must be coprime
  if (math.gcd(m, 26) !== 1) throw new Error("Multiplier 'm' must be coprime with 26");

  let result = '';
  const inverseM = modInverse(m, 26);

  for (let i = 0; i < cleanedText.length; i++) {
    const x = cleanedText.charCodeAt(i) - 65;
    let newCharCode;
    if (decrypt) {
      newCharCode = (inverseM * (x - b + 26)) % 26;
      if (newCharCode < 0) newCharCode += 26;
    } else {
      newCharCode = (m * x + b) % 26;
    }
    result += String.fromCharCode(newCharCode + 65);
  }

  return result;
};

// --- 6. HILL CIPHER ---
// Key should be an array of numbers representing an NxN matrix
export const hillCipher = (text: string, keyMatrix: number[][], decrypt = false) => {
  const cleanedText = cleanString(text);
  if (cleanedText.length === 0) return '';

  const n = keyMatrix.length;
  if (n === 0 || keyMatrix[0].length !== n) throw new Error('Key must be a square matrix');

  let workingMatrix = keyMatrix;

  if (decrypt) {
    let det = Math.round(Number(math.det(keyMatrix)));
    det = ((det % 26) + 26) % 26;
    const invDet = modInverse(det, 26);
    if (invDet === 1 && det !== 1) throw new Error("Matrix is not invertible mod 26");

    const adjugate = math.multiply(math.inv(keyMatrix), Number(math.det(keyMatrix))) as number[][];
    
    workingMatrix = adjugate.map((row: number[]) => 
      row.map((val: number) => {
        let v = Math.round(val);
        v = ((v % 26) + 26) % 26;
        return (v * invDet) % 26;
      })
    );
  }

  let paddedText = cleanedText;
  while (paddedText.length % n !== 0) paddedText += 'X';

  let result = '';
  for (let i = 0; i < paddedText.length; i += n) {
    const vector = [];
    for (let j = 0; j < n; j++) vector.push([paddedText.charCodeAt(i + j) - 65]);
    
    const multiplied = math.multiply(workingMatrix, vector) as number[][];
    for (let j = 0; j < n; j++) {
      let val = Math.round(multiplied[j][0]);
      val = ((val % 26) + 26) % 26;
      result += String.fromCharCode(val + 65);
    }
  }

  return result;
};
