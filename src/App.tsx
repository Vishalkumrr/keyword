import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

interface Keyword {
  keyword: string;
  intent: string;
  volume: string;
  kd: number;
  cpc: number;
  trafficPotential: number;
  parentKeyword: string;
}

interface KeywordFilter {
  type: 'all' | 'any';
  keywords: string[];
}

type SortField = 'volume' | 'kd' | 'cpc' | 'trafficPotential';
type SortDirection = 'asc' | 'desc';

function App() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showVolumeFilter, setShowVolumeFilter] = useState(false);
  const [showKDFilter, setShowKDFilter] = useState(false);
  const [showCPCFilter, setShowCPCFilter] = useState(false);
  const [showWordCountFilter, setShowWordCountFilter] = useState(false);
  const [showIntentFilter, setShowIntentFilter] = useState(false);
  const [showIncludeFilter, setShowIncludeFilter] = useState(false);
  const [showExcludeFilter, setShowExcludeFilter] = useState(false);
  const [showTrafficPotentialFilter, setShowTrafficPotentialFilter] = useState(false);
  const [minVolume, setMinVolume] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [minKD, setMinKD] = useState('');
  const [maxKD, setMaxKD] = useState('');
  const [minCPC, setMinCPC] = useState('');
  const [maxCPC, setMaxCPC] = useState('');
  const [minWordCount, setMinWordCount] = useState('');
  const [maxWordCount, setMaxWordCount] = useState('');
  const [minTrafficPotential, setMinTrafficPotential] = useState('');
  const [maxTrafficPotential, setMaxTrafficPotential] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeFilter, setIncludeFilter] = useState<KeywordFilter>({
    type: 'all',
    keywords: []
  });
  const [excludeFilter, setExcludeFilter] = useState<KeywordFilter>({
    type: 'all',
    keywords: []
  });
  const [includeKeywordInput, setIncludeKeywordInput] = useState('');
  const [excludeKeywordInput, setExcludeKeywordInput] = useState('');
  const [selectedIntents, setSelectedIntents] = useState({
    informational: false,
    transactional: false,
    commercial: false,
    navigational: false
  });
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        complete: (results) => {
          const parsedData = results.data.slice(1).map((row: any) => ({
            keyword: row[0] || '',
            intent: row[1] || '',
            volume: row[2] || '',
            kd: parseInt(row[3]) || 0,
            cpc: parseFloat(row[4]) || 0,
            trafficPotential: parseInt(row[5]) || 0,
            parentKeyword: row[6] || ''
          }));
          setTimeout(() => {
            setKeywords(parsedData);
            setIsLoading(false);
          }, 5000);
        },
        header: false
      });
    }
  };

  const handleIntentChange = (intent: keyof typeof selectedIntents) => {
    setSelectedIntents(prev => ({
      ...prev,
      [intent]: !prev[intent]
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return '⇅';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const isVolumeFilterActive = () => minVolume !== '' || maxVolume !== '';
  const isKDFilterActive = () => minKD !== '' || maxKD !== '';
  const isCPCFilterActive = () => minCPC !== '' || maxCPC !== '';
  const isWordCountFilterActive = () => minWordCount !== '' || maxWordCount !== '';
  const isIntentFilterActive = () => Object.values(selectedIntents).some(value => value);
  const isTrafficPotentialFilterActive = () => minTrafficPotential !== '' || maxTrafficPotential !== '';

  const getVolumeFilterSummary = () => {
    if (!isVolumeFilterActive()) return null;
    return `${minVolume || '0'} - ${maxVolume || '∞'}`;
  };

  const getKDFilterSummary = () => {
    if (!isKDFilterActive()) return null;
    return `${minKD || '0'}% - ${maxKD || '100'}%`;
  };

  const getCPCFilterSummary = () => {
    if (!isCPCFilterActive()) return null;
    return `$${minCPC || '0'} - $${maxCPC || '∞'}`;
  };

  const getWordCountFilterSummary = () => {
    if (!isWordCountFilterActive()) return null;
    return `${minWordCount || '0'} - ${maxWordCount || '∞'}`;
  };

  const getTrafficPotentialFilterSummary = () => {
    if (!isTrafficPotentialFilterActive()) return null;
    return `${minTrafficPotential || '0'} - ${maxTrafficPotential || '∞'}`;
  };

  const getIntentFilterSummary = () => {
    if (!isIntentFilterActive()) return null;
    const activeIntents = Object.entries(selectedIntents)
      .filter(([_, value]) => value)
      .map(([key]) => key[0].toUpperCase())
      .join(', ');
    return activeIntents;
  };

  const handleAddIncludeKeyword = () => {
    if (includeKeywordInput.trim()) {
      setIncludeFilter(prev => ({
        ...prev,
        keywords: [...prev.keywords, includeKeywordInput.trim()]
      }));
      setIncludeKeywordInput('');
    }
  };

  const handleAddExcludeKeyword = () => {
    if (excludeKeywordInput.trim()) {
      setExcludeFilter(prev => ({
        ...prev,
        keywords: [...prev.keywords, excludeKeywordInput.trim()]
      }));
      setExcludeKeywordInput('');
    }
  };

  const handleRemoveIncludeKeyword = (index: number) => {
    setIncludeFilter(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExcludeKeyword = (index: number) => {
    setExcludeFilter(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const getWordCount = (keyword: string) => {
    return keyword.trim().split(/\s+/).length;
  };

  const filteredKeywords = keywords.filter(keyword => {
    const volume = parseInt(keyword.volume.replace(/,/g, '')) || 0;
    const minVol = minVolume ? parseInt(minVolume) : -Infinity;
    const maxVol = maxVolume ? parseInt(maxVolume) : Infinity;
    const minKDVal = minKD ? parseInt(minKD) : -Infinity;
    const maxKDVal = maxKD ? parseInt(maxKD) : Infinity;
    const minCPCVal = minCPC ? parseFloat(minCPC) : -Infinity;
    const maxCPCVal = maxCPC ? parseFloat(maxCPC) : Infinity;
    const wordCount = getWordCount(keyword.keyword);
    const minWords = minWordCount ? parseInt(minWordCount) : -Infinity;
    const maxWords = maxWordCount ? parseInt(maxWordCount) : Infinity;
    const minTraffic = minTrafficPotential ? parseInt(minTrafficPotential) : -Infinity;
    const maxTraffic = maxTrafficPotential ? parseInt(maxTrafficPotential) : Infinity;

    const anyIntentSelected = Object.values(selectedIntents).some(value => value);
    
    const intentMatch = !anyIntentSelected || (
      (selectedIntents.informational && keyword.intent.includes('I')) ||
      (selectedIntents.transactional && keyword.intent.includes('T')) ||
      (selectedIntents.commercial && keyword.intent.includes('C')) ||
      (selectedIntents.navigational && keyword.intent.includes('N'))
    );

    const includeMatch = includeFilter.keywords.length === 0 || (
      includeFilter.type === 'all'
        ? includeFilter.keywords.every(k => 
            keyword.keyword.toLowerCase().includes(k.toLowerCase())
          )
        : includeFilter.keywords.some(k => 
            keyword.keyword.toLowerCase().includes(k.toLowerCase())
          )
    );

    const excludeMatch = excludeFilter.keywords.length === 0 || (
      excludeFilter.type === 'all'
        ? !excludeFilter.keywords.every(k => 
            keyword.keyword.toLowerCase().includes(k.toLowerCase())
          )
        : !excludeFilter.keywords.some(k => 
            keyword.keyword.toLowerCase().includes(k.toLowerCase())
          )
    );

    return volume >= minVol && 
           volume <= maxVol && 
           keyword.kd >= minKDVal && 
           keyword.kd <= maxKDVal &&
           keyword.cpc >= minCPCVal && 
           keyword.cpc <= maxCPCVal &&
           wordCount >= minWords &&
           wordCount <= maxWords &&
           keyword.trafficPotential >= minTraffic &&
           keyword.trafficPotential <= maxTraffic &&
           intentMatch &&
           includeMatch &&
           excludeMatch;
  });

  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;
    if (sortField === 'volume') {
      const volumeA = parseInt(a.volume.replace(/,/g, '')) || 0;
      const volumeB = parseInt(b.volume.replace(/,/g, '')) || 0;
      comparison = volumeA - volumeB;
    } else {
      comparison = a[sortField] - b[sortField];
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalVolume = filteredKeywords.reduce((sum, item) => {
    const volume = parseInt(item.volume.replace(/,/g, '')) || 0;
    return sum + volume;
  }, 0);

  const averageKD = filteredKeywords.length > 0 
    ? Math.round(filteredKeywords.reduce((sum, item) => sum + item.kd, 0) / filteredKeywords.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 p-8">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center transform transition-all duration-500 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-6">
                <div className="absolute w-16 h-16 border-4 border-blue-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 animate-pulse">
              See Magic In a Moment
            </h2>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Stats and actions bar */}
      <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm">
        <div className="space-x-8 flex items-center">
          <div>
            <span className="text-gray-600">All keywords: </span>
            <span className="font-semibold">{filteredKeywords.length.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Volume: </span>
            <span className="font-semibold">{totalVolume.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Average KD: </span>
            <span className="font-semibold">{averageKD}%</span>
          </div>
        </div>
        <div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 relative">
        {/* Volume Filter */}
        <button 
          onClick={() => {
            setShowVolumeFilter(!showVolumeFilter);
            setShowKDFilter(false);
            setShowCPCFilter(false);
            setShowWordCountFilter(false);
            setShowIntentFilter(false);
            setShowIncludeFilter(false);
            setShowExcludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[120px] ${
            isVolumeFilterActive() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${isVolumeFilterActive() ? 'text-blue-600' : 'text-gray-700'}`}>
              Volume
            </span>
            <span className="ml-2">▼</span>
          </div>
          {getVolumeFilterSummary() && (
            <span className="text-xs text-blue-600 mt-1">{getVolumeFilterSummary()}</span>
          )}
        </button>

        {showVolumeFilter && (
          <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Volume
                </label>
                <input
                  type="number"
                  value={minVolume}
                  onChange={(e) => setMinVolume(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Volume
                </label>
                <input
                  type="number"
                  value={maxVolume}
                  onChange={(e) => setMaxVolume(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="∞"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setMinVolume('');
                    setMaxVolume('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowVolumeFilter(false)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KD Filter */}
        <button 
          onClick={() => {
            setShowKDFilter(!showKDFilter);
            setShowVolumeFilter(false);
            setShowCPCFilter(false);
            setShowWordCountFilter(false);
            setShowIntentFilter(false);
            setShowIncludeFilter(false);
            setShowExcludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[120px] ${
            isKDFilterActive() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${isKDFilterActive() ? 'text-blue-600' : 'text-gray-700'}`}>
              KD %
            </span>
            <span className="ml-2">▼</span>
          </div>
          {getKDFilterSummary() && (
            <span className="text-xs text-blue-600 mt-1">{getKDFilterSummary()}</span>
          )}
        </button>

        {showKDFilter && (
          <div className="absolute top-12 left-[140px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min KD %
                </label>
                <input
                  type="number"
                  value={minKD}
                  onChange={(e) => setMinKD(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max KD %
                </label>
                <input
                  type="number"
                  value={maxKD}
                  onChange={(e) => setMaxKD(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="100"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setMinKD('');
                    setMaxKD('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowKDFilter(false)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Word Count Filter */}
        <button 
          onClick={() => {
            setShowWordCountFilter(!showWordCountFilter);
            setShowVolumeFilter(false);
            setShowKDFilter(false);
            setShowCPCFilter(false);
            setShowIntentFilter(false);
            setShowIncludeFilter(false);
            setShowExcludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[120px] ${
            isWordCountFilterActive() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${isWordCountFilterActive() ? 'text-blue-600' : 'text-gray-700'}`}>
              Word Count
            </span>
            <span className="ml-2">▼</span>
          </div>
          {getWordCountFilterSummary() && (
            <span className="text-xs text-blue-600 mt-1">{getWordCountFilterSummary()}</span>
          )}
        </button>

        {showWordCountFilter && (
          <div className="absolute top-12 left-[280px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Words
                </label>
                <input
                  type="number"
                  value={minWordCount}
                  onChange={(e) => setMinWordCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Words
                </label>
                <input
                  type="number"
                  value={maxWordCount}
                  onChange={(e) => setMaxWordCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="∞"
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setMinWordCount('');
                    setMaxWordCount('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowWordCountFilter(false)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Intent Filter */}
        <button 
          onClick={() => {
            setShowIntentFilter(!showIntentFilter);
            setShowVolumeFilter(false);
            setShowKDFilter(false);
            setShowCPCFilter(false);
            setShowWordCountFilter(false);
            setShowIncludeFilter(false);
            setShowExcludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[120px] ${
            isIntentFilterActive() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${isIntentFilterActive() ? 'text-blue-600' : 'text-gray-700'}`}>
              Intent
            </span>
            <span className="ml-2">▼</span>
          </div>
          {getIntentFilterSummary() && (
            <span className="text-xs text-blue-600 mt-1">{getIntentFilterSummary()}</span>
          )}
        </button>

        {showIntentFilter && (
          <div className="absolute top-12 left-[420px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIntents.informational}
                  onChange={() => handleIntentChange('informational')}
                  className="rounded text-blue-500"
                />
                <span className="text-sm text-gray-700">Informational</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIntents.transactional}
                  onChange={() => handleIntentChange('transactional')}
                  className="rounded text-blue-500"
                />
                <span className="text-sm text-gray-700">Transactional</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIntents.commercial}
                  onChange={() => handleIntentChange('commercial')}
                  className="rounded text-blue-500"
                />
                <span className="text-sm text-gray-700">Commercial</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIntents.navigational}
                  onChange={() => handleIntentChange('navigational')}
                  className="rounded text-blue-500"
                />
                <span className="text-sm text-gray-700">Navigational</span>
              </label>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedIntents({
                      informational: false,
                      transactional: false,
                      commercial: false,
                      navigational: false
                    });
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowIntentFilter(false)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CPC Filter */}
        <button 
          onClick={() => {
            setShowCPCFilter(!showCPCFilter);
            setShowVolumeFilter(false);
            setShowKDFilter(false);
            setShowWordCountFilter(false);
            setShowIntentFilter(false);
            setShowIncludeFilter(false);
            setShowExcludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[120px] ${
            isCPCFilterActive() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${isCPCFilterActive() ? 'text-blue-600' : 'text-gray-700'}`}>
              CPC (USD)
            </span>
            <span className="ml-2">▼</span>
          </div>
          {getCPCFilterSummary() && (
            <span className="text-xs text-blue-600 mt-1">{getCPCFilterSummary()}</span>
          )}
        </button>

        {showCPCFilter && (
          <div className="absolute top-12 left-[540px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min CPC (USD)
                </label>
                <input
                  type="number"
                  value={minCPC}
                  onChange={(e) => setMinCPC(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max CPC (USD)
                </label>
                <input
                  type="number"
                  value={maxCPC}
                  onChange={(e) => setMaxCPC(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="∞"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setMinCPC('');
                    setMaxCPC('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowCPCFilter(false)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Potential Filter */}
        <button 
          onClick={() => {
            setShowTrafficPotentialFilter(!showTrafficPotentialFilter);
            setShowVolumeFilter(false);
            setShowKDFilter(false);
            setShowCPCFilter(false);
            setShowWordCountFilter(false);
            setShowIntentFilter(false);
            setShowIncludeFilter(false);
            setShowExcludeFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[120px] ${
            isTrafficPotentialFilterActive() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${isTrafficPotentialFilterActive() ? 'text-blue-600' : 'text-gray-700'}`}>
              Traffic Potential
            </span>
            <span className="ml-2">▼</span>
          </div>
          {getTrafficPotentialFilterSummary() && (
            <span className="text-xs text-blue-600 mt-1">{getTrafficPotentialFilterSummary()}</span>
          )}
        </button>

        {showTrafficPotentialFilter && (
          <div className="absolute top-12 left-[660px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Traffic Potential
                </label>
                <input
                  type="number"
                  value={minTrafficPotential}
                  onChange={(e) => setMinTrafficPotential(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Traffic Potential
                </label>
                <input
                  type="number"
                  value={maxTrafficPotential}
                  onChange={(e) => setMaxTrafficPotential(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="∞"
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setMinTrafficPotential('');
                    setMaxTrafficPotential('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowTrafficPotentialFilter(false)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Include Keywords Filter */}
        <button 
          onClick={() => {
            setShowIncludeFilter(!showIncludeFilter);
            setShowVolumeFilter(false);
            setShowKDFilter(false);
            setShowCPCFilter(false);
            setShowWordCountFilter(false);
            setShowIntentFilter(false);
            setShowExcludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[160px] ${
            includeFilter.keywords.length > 0 ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={includeFilter.keywords.length > 0 ? 'text-blue-600' : 'text-gray-700'}>
              Include keywords
            </span>
            <span className="ml-2">▼</span>
          </div>
          {includeFilter.keywords.length > 0 && (
            <span className="text-xs text-blue-600 mt-1">
              {includeFilter.type === 'all' ? 'All' : 'Any'} ({includeFilter.keywords.length})
            </span>
          )}
        </button>

        {showIncludeFilter && (
          <div className="absolute top-12 left-[840px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-80">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={includeFilter.type === 'all'}
                    onChange={() => setIncludeFilter(prev => ({ ...prev, type: 'all' }))}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-gray-700">All Keywords</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={includeFilter.type === 'any'}
                    onChange={() => setIncludeFilter(prev => ({ ...prev, type: 'any' }))}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-gray-700">Any Keyword</span>
                </label>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={includeKeywordInput}
                  onChange={(e) => setIncludeKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIncludeKeyword()}
                  placeholder="Enter keyword"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleAddIncludeKeyword}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {includeFilter.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{keyword}</span>
                    <button
                      onClick={() => handleRemoveIncludeKeyword(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exclude Keywords Filter */}
        <button 
          onClick={() => {
            setShowExcludeFilter(!showExcludeFilter);
            setShowVolumeFilter(false);
            setShowKDFilter(false);
            setShowCPCFilter(false);
            setShowWordCountFilter(false);
            setShowIntentFilter(false);
            setShowIncludeFilter(false);
            setShowTrafficPotentialFilter(false);
          }}
          className={`flex flex-col px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 min-w-[160px] ${
            excludeFilter.keywords.length > 0 ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={excludeFilter.keywords.length > 0 ? 'text-blue-600' : 'text-gray-700'}>
              Exclude keywords
            </span>
            <span className="ml-2">▼</span>
          </div>
          {excludeFilter.keywords.length > 0 && (
            <span className="text-xs text-blue-600 mt-1">
              {excludeFilter.type === 'all' ? 'All' : 'Any'} ({excludeFilter.keywords.length})
            </span>
          )}
        </button>

        {showExcludeFilter && (
          <div className="absolute top-12 left-[1020px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-80">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={excludeFilter.type === 'all'}
                    onChange={() => setExcludeFilter(prev => ({ ...prev, type: 'all' }))}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-gray-700">All Keywords</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={excludeFilter.type === 'any'}
                    onChange={() => setExcludeFilter(prev => ({ ...prev, type: 'any' }))}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-gray-700">Any Keyword</span>
                </label>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={excludeKeywordInput}
                  onChange={(e) => setExcludeKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddExcludeKeyword()}
                  placeholder="Enter keyword"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleAddExcludeKeyword}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {excludeFilter.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{keyword}</span>
                    <button
                      onClick={() => handleRemoveExcludeKeyword(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('volume')}
              >
                Volume {getSortIcon('volume')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('kd')}
              >
                KD% {getSortIcon('kd')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cpc')}
              >
                CPC (USD) {getSortIcon('cpc')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('trafficPotential')}
              >
                Traffic Potential {getSortIcon('trafficPotential')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Keyword
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedKeywords.map((keyword, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.intent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.volume}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.kd}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${keyword.cpc.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.trafficPotential.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {keyword.parentKeyword}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;