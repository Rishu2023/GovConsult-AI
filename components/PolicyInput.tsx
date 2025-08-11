import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Textarea } from './ui/Textarea';
import { Icons } from './icons/Icons';
import { SAMPLE_POLICIES } from '../constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Button } from './ui/Button';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

interface PolicyInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export const PolicyInput: React.FC<PolicyInputProps> = ({ value, onChange, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleSetSample = (policyText: string) => {
    onChange(policyText);
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Processing ${file.name}...`);
    onChange(''); // Clear existing text

    try {
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let textContent = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
          }
          onChange(textContent);
          setUploadStatus(`Successfully loaded ${file.name}`);
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          onChange(result.value);
          setUploadStatus(`Successfully loaded ${file.name}`);
        };
        reader.readAsArrayBuffer(file);
      } else { // Assume .txt
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          onChange(text);
          setUploadStatus(`Successfully loaded ${file.name}`);
        };
        reader.readAsText(file);
      }
    } catch (error) {
        console.error("Error processing file:", error);
        setUploadStatus(`Failed to load ${file.name}`);
    } finally {
        // Reset file input to allow re-uploading the same file
        if(event.target) event.target.value = '';
        setTimeout(() => setUploadStatus(''), 3000);
    }
  };
  
  return (
    <div className="relative">
       <Textarea
        placeholder="Paste your policy text here, or upload a .txt, .pdf, or .docx file..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[250px]"
        disabled={isLoading}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2 sm:gap-4">
        {uploadStatus && <p className="text-xs text-muted-foreground">{uploadStatus}</p>}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,text/plain,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={isLoading}
        />
         <Button
            variant="outline"
            size="default"
            onClick={handleFileButtonClick}
            disabled={isLoading}
            className="h-auto py-1 px-3 text-xs"
        >
            <Icons.upload className="h-3 w-3 mr-1.5" />
            Upload File
        </Button>
        
        <Select onValueChange={handleSetSample} disabled={isLoading}>
          <SelectTrigger className="text-xs h-auto py-1 px-2 w-auto bg-transparent border-none hover:underline text-primary ring-offset-0 focus:ring-0">
            <SelectValue placeholder="Use Sample Policy" />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_POLICIES.map(sample => (
              <SelectItem key={sample.name} value={sample.text}>
                {sample.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};