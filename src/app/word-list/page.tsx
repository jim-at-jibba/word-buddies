'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CatMascot from '@/components/CatMascot';
import { YEAR_3_WORDS } from '@/lib/data/words';

export default function WordListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'length'>('alphabetical');

  // Filter and sort words based on search term and sort preference
  const filteredAndSortedWords = useMemo(() => {
    let words = YEAR_3_WORDS.filter(word =>
      word.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'alphabetical') {
      words = words.sort((a, b) => a.localeCompare(b));
    } else if (sortBy === 'length') {
      words = words.sort((a, b) => a.length - b.length || a.localeCompare(b));
    }

    return words;
  }, [searchTerm, sortBy]);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-cat-dark hover:text-cat-orange transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-kid-friendly font-bold">Back</span>
            </motion.button>
            
            <h1 className="text-3xl md:text-4xl font-kid-friendly font-bold text-cat-dark">
              📚 Word List
            </h1>
            
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          <p className="text-lg font-kid-friendly text-cat-gray mb-2">
            All {YEAR_3_WORDS.length} Year 3 spelling words available for practice
          </p>
          <p className="text-sm font-kid-friendly text-cat-gray">
            Words sourced from{' '}
            <a 
              href="https://home.oxfordowl.co.uk/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-cat-orange hover:text-cat-dark transition-colors duration-200 underline"
            >
              Oxford Owl
            </a>{' '}
            educational resources
          </p>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Controls Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-cat-lg p-6 shadow-cat mb-6">
                <h2 className="text-xl font-kid-friendly font-bold text-cat-dark mb-4">
                  🔍 Search & Filter
                </h2>
                
                {/* Search Input */}
                <div className="mb-4">
                  <label htmlFor="search" className="block font-kid-friendly font-bold text-cat-dark mb-2">
                    Search words:
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full p-3 border-2 border-cat-light rounded-cat font-kid-friendly focus:border-cat-orange focus:outline-none transition-colors duration-200"
                  />
                </div>

                {/* Sort Options */}
                <div className="mb-4">
                  <label htmlFor="sort" className="block font-kid-friendly font-bold text-cat-dark mb-2">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'alphabetical' | 'length')}
                    className="w-full p-3 border-2 border-cat-light rounded-cat font-kid-friendly focus:border-cat-orange focus:outline-none transition-colors duration-200"
                  >
                    <option value="alphabetical">Alphabetical</option>
                    <option value="length">Word Length</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="text-center p-3 bg-cat-cream rounded-cat">
                  <p className="font-kid-friendly text-cat-dark">
                    <span className="font-bold text-cat-orange">{filteredAndSortedWords.length}</span>
                    {' '}of {YEAR_3_WORDS.length} words
                  </p>
                </div>
              </div>

              {/* Cat Mascot */}
              <div className="text-center">
                <CatMascot mood="happy" size="medium" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-4"
                >
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    These are all the words you can practice with me! 
                    Use the search to find specific words.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Words Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-cat-lg p-6 shadow-cat">
                <h2 className="text-xl font-kid-friendly font-bold text-cat-dark mb-6">
                  📝 Year 3 Spelling Words
                </h2>
                
                {filteredAndSortedWords.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredAndSortedWords.map((word, index) => (
                        <motion.div
                          key={word}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className="group"
                        >
                          <div className="p-3 bg-cat-cream hover:bg-cat-light rounded-cat border-2 border-transparent hover:border-cat-orange transition-all duration-200 cursor-default">
                            <p className="font-kid-friendly text-cat-dark text-center font-medium">
                              {word}
                            </p>
                            <p className="font-kid-friendly text-cat-gray text-xs text-center mt-1">
                              {word.length} letters
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Attribution */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 p-4 bg-cat-cream rounded-cat border border-cat-light"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cat-orange">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="font-kid-friendly text-cat-gray text-sm text-center">
                          <span className="font-bold text-cat-dark">Educational Source:</span> These spelling words are sourced from{' '}
                          <a 
                            href="https://home.oxfordowl.co.uk/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold text-cat-orange hover:text-cat-dark transition-colors duration-200 underline"
                          >
                            Oxford Owl
                          </a>{' '}
                          educational resources, ensuring high-quality, curriculum-aligned learning content.
                        </p>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-kid-friendly font-bold text-cat-dark mb-2">
                      No words found
                    </h3>
                    <p className="font-kid-friendly text-cat-gray">
                      Try a different search term or clear your search to see all words.
                    </p>
                    {searchTerm && (
                      <motion.button
                        onClick={() => setSearchTerm('')}
                        className="cat-button mt-4 px-6 py-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear Search
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}