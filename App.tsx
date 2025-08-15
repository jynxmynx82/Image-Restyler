
import React, { useState, useCallback, useMemo } from 'react';
import { restyleImage } from './services/geminiService';
import { FILTERS } from './constants';
import { FilterOption } from './types';

// SVG Icons
const UploadIcon = () => (
  <svg className="w-10 h-10 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
  </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V3a1 1 0 1 0-2 0v7.086L6.707 7.793a1 1 0 1 0-1.414 1.414l3.5 3.5a1 1 0 0 0 1.414 0l3.5-3.5a1 1 0 0 0 0-1.414Z"/>
    <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z"/>
  </svg>
);


// UI Components defined outside App to prevent re-renders
const Header = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 py-2">Image Restyler AI</h1>
    <p className="mt-2 text-lg text-slate-400">Upload an image and re-imagine it with a new style. AI be so daft, y'all! Might not git a good result, try agin'</p>
  </header>
);

interface ImageUploaderProps {
    onImageUpload: (file: File, base64: string) => void;
    setIsLoading: (isLoading: boolean) => void;
}
const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, setIsLoading }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            onImageUpload(file, base64String);
            setIsLoading(false);
        };
        reader.onerror = () => {
            console.error("Error reading file");
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div> 
    );
};

interface ResultDisplayProps {
    originalImage: string;
    generatedImage: string;
    onStartOver: () => void;
    onDownload: () => void;
}
const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, generatedImage, onStartOver, onDownload }) => (
    <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8 text-center">Here's Your Restyled Image!</h2>
        <div className="flex flex-col gap-10 items-center">
            {/* Restyled Image - making it primary */}
            <div className="w-full max-w-3xl text-center">
                <h3 className="text-xl font-semibold text-slate-300 mb-3">Restyled</h3>
                <img 
                    src={generatedImage} 
                    alt="AI restyled image" 
                    className="rounded-lg shadow-xl mx-auto w-full h-auto"
                />
            </div>
            {/* Original Image - as a reference below */}
            <div className="w-full max-w-xl text-center">
                <h3 className="text-lg font-medium text-slate-400 mb-2">Original</h3>
                <img 
                    src={originalImage} 
                    alt="Original user upload" 
                    className="rounded-md shadow-md mx-auto w-full h-auto opacity-75"
                />
            </div>
        </div>
        <div className="mt-10 flex flex-col-reverse sm:flex-row justify-center items-center gap-4">
            <button onClick={onStartOver} className="w-full sm:w-auto text-center px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium">
                Start Over
            </button>
            <button onClick={onDownload} className="w-full sm:w-auto text-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center">
                <DownloadIcon />
                Download
            </button>
        </div>
    </div>
);

const STANDARD_RATIOS: { [key: string]: number } = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
};

const getClosestAspectRatio = (width: number, height: number): string => {
  const imageRatio = width / height;
  let closestRatioKey = '1:1';
  let smallestDiff = Infinity;
  
  for (const [key, value] of Object.entries(STANDARD_RATIOS)) {
      const diff = Math.abs(imageRatio - value);
      if (diff < smallestDiff) {
          smallestDiff = diff;
          closestRatioKey = key;
      }
  }
  return closestRatioKey;
};


// Main App Component
export default function App() {
  const [originalImage, setOriginalImage] = useState<{ file: File; base64: string } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTERS[0]);
  const [userTwist, setUserTwist] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleImageUpload = useCallback((file: File, base64: string) => {
    const imageUrl = `data:${file.type};base64,${base64}`;
    
    const img = new Image();
    img.onload = () => {
        const closestRatio = getClosestAspectRatio(img.naturalWidth, img.naturalHeight);
        setAspectRatio(closestRatio);
    };
    img.src = imageUrl;

    setOriginalImage({ file, base64: imageUrl });
    setError(null);
    setGeneratedImage(null);
  }, []);

  const handleRestyle = useCallback(async () => {
    if (!originalImage || !selectedFilter) return;

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Initializing...');
    
    try {
      const { file, base64 } = originalImage;
      const base64Data = base64.split(',')[1];
      const result = await restyleImage(base64Data, file.type, selectedFilter.name, selectedFilter.prompt, userTwist, aspectRatio, setLoadingMessage);
      
      setGeneratedImage(`data:image/jpeg;base64,${result.generatedImage}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [originalImage, selectedFilter, userTwist, aspectRatio]);

  const handleStartOver = useCallback(() => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
    setUserTwist('');
    setSelectedFilter(FILTERS[0]);
    setAspectRatio('1:1');
  }, []);

  const handleDownload = useCallback(() => {
      if (!generatedImage) return;
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `restyled-${Date.now()}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }, [generatedImage]);
  
  const originalImageUrl = useMemo(() => originalImage?.base64, [originalImage]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 p-6 md:p-8 bg-slate-850/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl">
          {error && (
              <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
          )}

          {generatedImage && originalImageUrl ? (
            <ResultDisplay 
              originalImage={originalImageUrl} 
              generatedImage={generatedImage} 
              onStartOver={handleStartOver}
              onDownload={handleDownload}
            />
          ) : !originalImage ? (
            <ImageUploader onImageUpload={handleImageUpload} setIsLoading={setIsLoading} />
          ) : (
            <div className="flex flex-col gap-8">
              {/* Uploaded Image Area */}
              <div className="w-full text-center">
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">Your Image</h3>
                  <div className="flex justify-center">
                      <img 
                        src={originalImageUrl} 
                        alt="Uploaded preview" 
                        className="rounded-lg shadow-xl max-h-[40vh] w-auto h-auto"
                      />
                  </div>
              </div>
              
              {/* Styling Options Area */}
              <div className="w-full flex flex-col gap-6">
                  <div>
                    <label className="block text-lg font-medium text-slate-300 mb-3">1. Choose a Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {FILTERS.map((filter) => (
                            <div key={filter.id} className="relative group">
                                <button
                                  onClick={() => setSelectedFilter(filter)}
                                  className={`w-full text-sm text-center px-3 py-2.5 rounded-lg transition-all duration-200 ${selectedFilter.id === filter.id ? 'bg-indigo-600 text-white font-semibold shadow-lg ring-2 ring-indigo-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                  aria-describedby={`tooltip-${filter.id}`}
                                >
                                    {filter.name}
                                </button>
                                <div
                                    id={`tooltip-${filter.id}`}
                                    role="tooltip"
                                    className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-2 text-xs font-normal text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 pointer-events-none"
                                >
                                    {filter.humorousDescription}
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                  <div>
                      <label htmlFor="twist" className="block text-lg font-medium text-slate-300 mb-3">2. Add a Twist (Optional)</label>
                      <textarea
                        id="twist"
                        rows={3}
                        value={userTwist}
                        onChange={(e) => setUserTwist(e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="e.g., set the background to a rainy city street, add a curious cat..."
                      />
                  </div>
              </div>

              {/* Action Buttons Area */}
              <div className="mt-2 flex flex-col-reverse sm:flex-row justify-center gap-4">
                <button onClick={handleStartOver} className="w-full sm:w-auto px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium">
                  Change Image
                </button>
                <button 
                  onClick={handleRestyle}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <><LoadingSpinner /> {loadingMessage || 'Generating...'}</> : 'Restyle Image'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
