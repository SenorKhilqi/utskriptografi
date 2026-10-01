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
    <div className="min-h-screen py-12 px-4 sm:px-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-500 mt-1">Configure your parameters and run the encryption.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Input Mode</label>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'text' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setMode('text')}
              >
                Text
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'file' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setMode('file')}
              >
                File
              </button>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Secret Key</label>
             {algo === 'affine' ? (
                <div className="flex space-x-2">
                   <input type="number" placeholder="m" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-shadow" value={affineM} onChange={e => setAffineM(e.target.value)} />
                   <input type="number" placeholder="b" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-shadow" value={affineB} onChange={e => setAffineB(e.target.value)} />
                </div>
             ) : algo === 'hill' ? (
                 <textarea placeholder="3,3\n2,5" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-shadow resize-none" rows={2} value={hillMatrixStr} onChange={e => setHillMatrixStr(e.target.value)} />
             ) : (
                <input type="text" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-shadow" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key" />
             )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Input Data</label>
          {mode === 'text' ? (
            <textarea className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-shadow resize-none" rows={4} value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter your text here..."></textarea>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-1 text-sm text-slate-600 font-medium">Click to upload file</p>
                  <p className="text-xs text-slate-500">{file ? file.name : "or drag and drop"}</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            className="flex-1 bg-slate-900 text-white font-medium text-sm py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            onClick={() => mode === 'text' ? processText('encrypt') : processFile('encrypt')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Encrypt'}
          </button>
          <button 
            className="flex-1 bg-white border border-slate-300 text-slate-700 font-medium text-sm py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            onClick={() => mode === 'text' ? processText('decrypt') : processFile('decrypt')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Decrypt'}
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Output Result</h3>
          {mode === 'text' ? (
             <div className="relative group">
               <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 text-slate-800 font-mono text-sm pr-20 focus:outline-none resize-none" rows={5} readOnly value={textOutput} placeholder="Result..."></textarea>
               {textOutput && (
                 <button 
                   onClick={handleCopy} 
                   className="absolute top-3 right-3 px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium shadow-sm hover:bg-slate-50 transition-colors"
                 >
                   {isCopied ? 'Copied' : 'Copy'}
                 </button>
               )}
             </div>
          ) : (
             <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
               <span className={`text-sm ${fileOutputBlob ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{fileOutputBlob ? 'File ready' : 'No output yet'}</span>
               {fileOutputBlob && (
                 <button onClick={downloadFile} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                   Download
                 </button>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
