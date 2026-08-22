import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Hash, Link as LinkIcon, FileJson, Copy, Check, Braces, KeyRound, Dna, Clock, Palette, Regex } from 'lucide-react';

type ToolType = 'json' | 'base64' | 'jwt' | 'url' | 'uuid' | 'hash' | 'unix' | 'color' | 'regex';

export const DevToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('json');
  const [input, setInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processJson = (action: 'format' | 'minify') => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      if (action === 'format') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON');
      setOutput('');
    }
  };

  const processBase64 = (action: 'encode' | 'decode') => {
    setError(null);
    try {
      if (action === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (err: any) {
      setError('Invalid Base64 string');
      setOutput('');
    }
  };

  const processUrl = (action: 'encode' | 'decode') => {
    setError(null);
    try {
      if (action === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (err: any) {
      setError('Invalid URL string');
      setOutput('');
    }
  };

  const decodeJwt = () => {
    setError(null);
    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format (must have 3 parts)');
      
      const header = JSON.parse(decodeURIComponent(escape(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))));
      const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))));
      
      setOutput(JSON.stringify({ header, payload }, null, 2));
    } catch (err: any) {
      setError(err.message || 'Invalid JWT token');
      setOutput('');
    }
  };

  const generateUuid = () => {
    setError(null);
    const count = parseInt(input) || 1;
    if (count > 100) {
      setError('Maximum 100 UUIDs at a time');
      return;
    }
    const uuids = Array.from({ length: count }, () => crypto.randomUUID());
    setOutput(uuids.join('\n'));
  };

  const generateHash = async () => {
    setError(null);
    if (!input) return;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
    } catch (err: any) {
      setError('Failed to generate hash');
    }
  };

  const processUnix = (action: 'toHuman' | 'toUnix') => {
    setError(null);
    try {
      if (action === 'toHuman') {
        const ts = parseInt(input);
        if (isNaN(ts)) throw new Error('Invalid timestamp');
        // Handle both seconds and milliseconds
        const date = new Date(ts > 9999999999 ? ts : ts * 1000);
        setOutput(date.toISOString() + '\n' + date.toUTCString() + '\n' + date.toString());
      } else {
        const date = new Date(input);
        if (isNaN(date.getTime())) throw new Error('Invalid date string');
        setOutput(Math.floor(date.getTime() / 1000).toString() + ' (seconds)\n' + date.getTime().toString() + ' (milliseconds)');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid input');
      setOutput('');
    }
  };

  const processColor = () => {
    setError(null);
    try {
      let color = input.trim().toLowerCase();
      // Simple HEX to RGB and vice-versa
      if (color.startsWith('#')) {
        let hex = color.substring(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) throw new Error('Invalid HEX');
        setOutput(`rgb(${r}, ${g}, ${b})\nrgba(${r}, ${g}, ${b}, 1)`);
      } else if (color.startsWith('rgb')) {
        const rgbMatch = color.match(/\d+/g);
        if (!rgbMatch || rgbMatch.length < 3) throw new Error('Invalid RGB');
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        setOutput(hex.toUpperCase());
      } else {
        throw new Error('Enter HEX (e.g., #FF0000) or RGB (e.g., rgb(255, 0, 0))');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid color format');
      setOutput('');
    }
  };

  const testRegex = () => {
    setError(null);
    try {
      if (!secondaryInput) throw new Error('Enter a regex pattern');
      const flagsMatch = secondaryInput.match(/\/([gimyuvsd]*)$/);
      const flags = flagsMatch ? flagsMatch[1] : '';
      let pattern = secondaryInput;
      if (pattern.startsWith('/')) {
        pattern = pattern.substring(1, pattern.lastIndexOf('/'));
      }
      
      const regex = new RegExp(pattern, flags);
      const matches = [...input.matchAll(regex)];
      if (matches.length === 0) {
        setOutput('No matches found.');
      } else {
        const results = matches.map((m, i) => `Match ${i + 1}:\n${m[0]}\n(Groups: ${m.slice(1).join(', ')})`).join('\n\n');
        setOutput(`Found ${matches.length} matches:\n\n${results}`);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Regular Expression');
      setOutput('');
    }
  };

  const renderToolControls = () => {
    switch (activeTool) {
      case 'json':
        return (
          <div className="flex space-x-2">
            <button onClick={() => processJson('format')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
              Format
            </button>
            <button onClick={() => processJson('minify')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors border border-slate-600">
              Minify
            </button>
          </div>
        );
      case 'base64':
        return (
          <div className="flex space-x-2">
            <button onClick={() => processBase64('encode')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
              Encode
            </button>
            <button onClick={() => processBase64('decode')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors border border-slate-600">
              Decode
            </button>
          </div>
        );
      case 'url':
        return (
          <div className="flex space-x-2">
            <button onClick={() => processUrl('encode')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
              Encode URL
            </button>
            <button onClick={() => processUrl('decode')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors border border-slate-600">
              Decode URL
            </button>
          </div>
        );
      case 'jwt':
        return (
          <div className="flex space-x-2">
            <button onClick={decodeJwt} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors">
              Decode JWT
            </button>
          </div>
        );
      case 'uuid':
        return (
          <div className="flex space-x-2">
            <button onClick={generateUuid} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors">
              Generate UUID(s)
            </button>
          </div>
        );
      case 'hash':
        return (
          <div className="flex space-x-2">
            <button onClick={generateHash} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors">
              Generate Hash
            </button>
          </div>
        );
      case 'unix':
        return (
          <div className="flex space-x-2">
            <button onClick={() => processUnix('toHuman')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors">
              Timestamp to Date
            </button>
            <button onClick={() => processUnix('toUnix')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors border border-slate-600">
              Date to Timestamp
            </button>
          </div>
        );
      case 'color':
        return (
          <div className="flex space-x-2">
            <button onClick={processColor} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-colors">
              Convert HEX ⇄ RGB
            </button>
          </div>
        );
      case 'regex':
        return (
          <div className="flex space-x-2">
            <button onClick={testRegex} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors">
              Test Regex against Input
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center">
            <Terminal className="w-6 h-6 mr-3 text-blue-500" />
            Инструменты Разработчика
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            Набор утилит для быстрой работы с кодом и данными (JSON, Base64, JWT).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm flex flex-col gap-1">
            <button
              onClick={() => { setActiveTool('json'); setInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'json' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <FileJson className="w-5 h-5" />
              <span>JSON Formatter</span>
            </button>
            <button
              onClick={() => { setActiveTool('base64'); setInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'base64' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <Hash className="w-5 h-5" />
              <span>Base64</span>
            </button>
            <button
              onClick={() => { setActiveTool('jwt'); setInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'jwt' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <Braces className="w-5 h-5" />
              <span>JWT Decoder</span>
            </button>
            <button
              onClick={() => { setActiveTool('url'); setInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'url' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <LinkIcon className="w-5 h-5" />
              <span>URL Encode/Decode</span>
            </button>
            <button
              onClick={() => { setActiveTool('uuid'); setInput('1'); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'uuid' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <KeyRound className="w-5 h-5" />
              <span>UUID Generator</span>
            </button>
            <button
              onClick={() => { setActiveTool('hash'); setInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'hash' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <Dna className="w-5 h-5" />
              <span>SHA-256 Hash</span>
            </button>
            <button
              onClick={() => { setActiveTool('unix'); setInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'unix' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <Clock className="w-5 h-5" />
              <span>Unix Timestamp</span>
            </button>
            <button
              onClick={() => { setActiveTool('color'); setInput(''); setSecondaryInput(''); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'color' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <Palette className="w-5 h-5" />
              <span>Color Converter</span>
            </button>
            <button
              onClick={() => { setActiveTool('regex'); setInput(''); setSecondaryInput('/[A-Z]\\w+/g'); setOutput(''); setError(null); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTool === 'regex' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}
            >
              <Regex className="w-5 h-5" />
              <span>Regex Tester</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Input {activeTool === 'uuid' && '(Number of UUIDs)'} {activeTool === 'regex' && '(Target Text)'}</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTool === 'uuid' ? "Enter number of UUIDs to generate (e.g., 5)" : "Paste your content here..."}
                className="w-full h-40 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-shadow"
                spellCheck={false}
              />
            </div>

            {activeTool === 'regex' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Regular Expression (Pattern)</label>
                <input
                  type="text"
                  value={secondaryInput}
                  onChange={(e) => setSecondaryInput(e.target.value)}
                  placeholder="/pattern/gi"
                  className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-mono text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                  spellCheck={false}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              {renderToolControls()}
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Output</label>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-64 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-800 dark:text-slate-300 focus:outline-none resize-none"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
