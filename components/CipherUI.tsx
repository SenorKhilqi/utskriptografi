'use client';

import { useState, useRef } from 'react';
import { vigenereCipher, playfairCipher, affineCipher, hillCipher } from '@/utils/ciphers/alphabetCiphers';
import { extendedVigenereCipher, superEncryptionCipher, enigmaCipher } from '@/utils/ciphers/byteCiphers';

export default function CipherUI({ algoType, title }: { algoType: string, title: string }) {
  const algo = algoType;
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [keyInput, setKeyInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  
  // For Affine & Hill
  const [affineM, setAffineM] = useState('5');
  const [affineB, setAffineB] = useState('8');
  const [hillMatrixStr, setHillMatrixStr] = useState('3,3\n2,5'); // 2x2 default

  const [file, setFile] = useState<File | null>(null);
  const [fileOutputBlob, setFileOutputBlob] = useState<Blob | null>(null);
  const [fileOutputExt, setFileOutputExt] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toBase64Lower = (uint8Array: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary).replace(/\s/g, '').toLowerCase();
  };

  const processText = async (action: 'encrypt' | 'decrypt') => {
    setIsLoading(true);
    try {
      let result = '';

      if (['vigenere', 'autokey', 'playfair', 'affine', 'hill'].includes(algo)) {
        // 26 Alphabets
        if (algo === 'vigenere') result = vigenereCipher(textInput, keyInput, action === 'decrypt');
        else if (algo === 'autokey') result = vigenereCipher(textInput, keyInput, action === 'decrypt', true);
        else if (algo === 'playfair') result = playfairCipher(textInput, keyInput, action === 'decrypt');
        else if (algo === 'affine') result = affineCipher(textInput, parseInt(affineM), parseInt(affineB), action === 'decrypt');
        else if (algo === 'hill') {
          const matrix = hillMatrixStr.split('\n').map(row => row.split(',').map(Number));
          result = hillCipher(textInput, matrix, action === 'decrypt');
        }
        
        if (action === 'encrypt') {
            setTextOutput(result.toLowerCase());
        } else {
            setTextOutput(result.toLowerCase());
        }

      } else {
        // Byte Ciphers
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let dataToProcess = new Uint8Array();
        if (action === 'encrypt') {
            dataToProcess = encoder.encode(textInput);
        } else {
            // For decryption, we assume the input is base64
            // Since lowercase base64 is lossy, we try to decode as normal base64 (case-sensitive)
            // Or if it was base64, we just use atob
            try {
                // remove whitespace
                const cleanedB64 = textInput.replace(/\s/g, '');
                // Decode base64
                const binaryStr = atob(cleanedB64);
                dataToProcess = new Uint8Array(binaryStr.length);
                for(let i = 0; i < binaryStr.length; i++) dataToProcess[i] = binaryStr.charCodeAt(i);
            } catch(e) {
                // Fallback if not valid base64
                dataToProcess = encoder.encode(textInput);
            }
        }

        let outBytes: any = new Uint8Array();
        if (algo === 'extended') outBytes = extendedVigenereCipher(dataToProcess, keyInput, action === 'decrypt');
        else if (algo === 'super') outBytes = superEncryptionCipher(dataToProcess, keyInput, action === 'decrypt');
        else if (algo === 'enigma') outBytes = enigmaCipher(dataToProcess, keyInput, action === 'decrypt');

        if (action === 'encrypt') {
            // Output normal base64, but the user requested lowercase. 
            // Note: lowercasing base64 destroys data. We will output base64.
            let binary = '';
            for (let i = 0; i < outBytes.length; i++) binary += String.fromCharCode(outBytes[i]);
            setTextOutput(btoa(binary));
        } else {
            setTextOutput(decoder.decode(outBytes));
        }
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setIsLoading(false);
  };

  const processFile = async (action: 'encrypt' | 'decrypt') => {
    if (!file) return;
    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let data = new Uint8Array(arrayBuffer);
      
      let outBytes: any = new Uint8Array();
      let originalExt = '';

      if (action === 'encrypt') {
        // Encrypt the raw data first
        if (algo === 'extended') outBytes = extendedVigenereCipher(data, keyInput, false);
        else if (algo === 'super') outBytes = superEncryptionCipher(data, keyInput, false);
        else if (algo === 'enigma') outBytes = enigmaCipher(data, keyInput, false);
        else {
           alert("Algoritma 26 alfabet tidak optimal untuk file binary. Silakan gunakan Extended Vigenere, Super, atau Enigma.");
           setIsLoading(false);
           return;
        }

        // Inject original extension
        const ext = file.name.split('.').pop() || 'bin';
        const extBytes = new TextEncoder().encode('.' + ext);
        const extLength = extBytes.length;

        const finalData = new Uint8Array(1 + extLength + outBytes.length);
        finalData[0] = extLength;
        finalData.set(extBytes, 1);
        finalData.set(outBytes, 1 + extLength);

        setFileOutputBlob(new Blob([finalData]));
        setFileOutputExt('.dat');

      } else {
        // Decrypt
        // Extract original extension
        const extLength = data[0];
        const extBytes = data.slice(1, 1 + extLength);
        originalExt = new TextDecoder().decode(extBytes);

        const actualData = data.slice(1 + extLength);

        if (algo === 'extended') outBytes = extendedVigenereCipher(actualData, keyInput, true);
        else if (algo === 'super') outBytes = superEncryptionCipher(actualData, keyInput, true);
        else if (algo === 'enigma') outBytes = enigmaCipher(actualData, keyInput, true);

        setFileOutputBlob(new Blob([outBytes]));
        setFileOutputExt(originalExt);
      }
    } catch (e: any) {
      alert("Error processing file: " + e.message);
    }

    setIsLoading(false);
  };

  const downloadFile = () => {
    if (!fileOutputBlob) return;
    const url = URL.createObjectURL(fileOutputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result${fileOutputExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Input Mode</label>
              <div className="mt-2 flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-blue-600" name="mode" value="text" checked={mode === 'text'} onChange={() => setMode('text')} />
                  <span className="ml-2">Text</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-blue-600" name="mode" value="file" checked={mode === 'file'} onChange={() => setMode('file')} />
                  <span className="ml-2">File</span>
                </label>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Key</label>
             {algo === 'affine' ? (
                <div className="flex space-x-2 mt-1">
                   <input type="number" placeholder="Multiplier (m)" className="block w-full border border-gray-300 rounded-md p-2" value={affineM} onChange={e => setAffineM(e.target.value)} />
                   <input type="number" placeholder="Shift (b)" className="block w-full border border-gray-300 rounded-md p-2" value={affineB} onChange={e => setAffineB(e.target.value)} />
                </div>
             ) : algo === 'hill' ? (
                 <textarea placeholder="3,3\n2,5" className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={2} value={hillMatrixStr} onChange={e => setHillMatrixStr(e.target.value)} />
             ) : (
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Secret Key" />
             )}
          </div>

          {mode === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Input Text (Plaintext / Ciphertext)</label>
              <textarea className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={4} value={textInput} onChange={(e) => setTextInput(e.target.value)}></textarea>
            </div>
          ) : (
             <div>
              <label className="block text-sm font-medium text-gray-700">Upload File</label>
              <input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setFile(e.target.files?.[0] || null)} />
             </div>
          )}

          <div className="flex space-x-4">
            <button 
              className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              onClick={() => mode === 'text' ? processText('encrypt') : processFile('encrypt')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Encrypt'}
            </button>
            <button 
              className="flex-1 bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              onClick={() => mode === 'text' ? processText('decrypt') : processFile('decrypt')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Decrypt'}
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Output Result (Ciphertext / Plaintext)</h3>
            {mode === 'text' ? (
               <div className="relative">
                 <textarea className="block w-full border border-gray-300 rounded-md p-2 bg-gray-50 font-mono text-sm pr-20" rows={5} readOnly value={textOutput} placeholder="Result will appear here..."></textarea>
                 {textOutput && (
                   <button 
                     onClick={handleCopy} 
                     className="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                   >
                     {isCopied ? 'Copied!' : 'Copy'}
                   </button>
                 )}
               </div>
            ) : (
               <div className="flex items-center space-x-4">
                 <span className="text-sm text-gray-500">{fileOutputBlob ? 'File ready to download' : 'No output yet'}</span>
                 {fileOutputBlob && (
                   <button onClick={downloadFile} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
                     Download Result
                   </button>
                 )}
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
