"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CatMascot from "@/components/CatMascot";
import { useSettings } from "@/hooks/useSettings";
import { getWordCountForYearGroup, getYearGroupDisplayName } from "@/lib/data/words";
import { testApiKey } from "@/lib/elevenlabs-speech";
import { encryptApiKey, validateApiKeyFormat, isEncryptionSupported } from "@/lib/encryption";
import { reinitializeWordsForYearGroup } from "@/lib/storage";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, loading, error, updateSettings } = useSettings();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // ElevenLabs API key state
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyTesting, setApiKeyTesting] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Year group state
  const [yearGroup, setYearGroup] = useState<number>(3);
  const [yearGroupChanging, setYearGroupChanging] = useState(false);

  // Load current settings when loaded
  useEffect(() => {
    if (settings?.name) {
      setName(settings.name);
    }
    
    // Load year group (default to 3 for existing users)
    if (settings?.yearGroup !== undefined) {
      setYearGroup(settings.yearGroup);
    }
    
    // Check if user has an API key configured
    setHasApiKey(!!settings?.elevenLabsApiKey);
  }, [settings]);

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateSettings({ 
        name: name.trim() || undefined,
        yearGroup: yearGroup 
      });
      setSaveSuccess(true);

      // Hide success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleYearGroupChange = async (newYearGroup: number) => {
    if (newYearGroup === yearGroup) return;

    setYearGroupChanging(true);
    setSaveError(null);

    try {
      // Update settings with new year group
      await updateSettings({ yearGroup: newYearGroup });
      
      // Reinitialize words for the new year group
      await reinitializeWordsForYearGroup(newYearGroup);
      
      setYearGroup(newYearGroup);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error changing year group:', error);
      setSaveError('Failed to change year group. Please try again.');
    } finally {
      setYearGroupChanging(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setApiKeyTesting(true);
    setApiKeyTestResult(null);
    
    try {
      const result = await testApiKey(apiKey.trim());
      console.log('API key test result:', result); // Debug log
      setApiKeyTestResult(result);
    } catch (error) {
      console.error('API key test error:', error); // Debug log
      setApiKeyTestResult({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Failed to test API key'
      });
    } finally {
      setApiKeyTesting(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setSaveError('Please enter an API key');
      return;
    }

    if (!validateApiKeyFormat(apiKey.trim())) {
      setSaveError('Invalid API key format (should start with "sk_")');
      return;
    }

    if (!isEncryptionSupported()) {
      setSaveError('Encryption not supported in this browser');
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    try {
      // Encrypt the API key
      const encryptedApiKey = await encryptApiKey(apiKey.trim());
      
      // Save to settings
      await updateSettings({ elevenLabsApiKey: encryptedApiKey });
      
      setHasApiKey(true);
      setShowApiKeyInput(false);
      setApiKey('');
      setSaveSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaveError('Failed to save API key. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setSaving(true);
    setSaveError(null);
    
    try {
      await updateSettings({ elevenLabsApiKey: undefined });
      setHasApiKey(false);
      setApiKey('');
      setApiKeyTestResult(null);
      setSaveSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error removing API key:', error);
      setSaveError('Failed to remove API key. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cat-orange border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5m0 0l7 7m-7-7l7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-kid-friendly font-bold">Back</span>
            </motion.button>
            <h1 className="text-3xl md:text-4xl font-kid-friendly font-bold text-cat-dark">
              ⚙️ Settings
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-8">
            {/* Cat Mascot */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <CatMascot mood="happy" size="large" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6"
              >
                <h3 className="text-xl font-kid-friendly font-bold text-cat-dark mb-3">
                  Let&apos;s personalize your experience!
                </h3>
                <p className="font-kid-friendly text-cat-gray">
                  Tell me your name so I can cheer you on during spelling
                  practice! You can always change it later.
                </p>
              </motion.div>
            </motion.div>

            {/* Settings Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-cat-lg p-8 shadow-cat"
            >
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-6">
                👤 Your Profile
              </h2>

              {/* Error Display */}
              {(error || saveError) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-cat-error/10 border border-cat-error/20 rounded-cat p-4 mb-6"
                >
                  <p className="font-kid-friendly text-cat-error text-sm">
                    ⚠️ {error || saveError}
                  </p>
                </motion.div>
              )}

              {/* Success Display */}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-cat-success/10 border border-cat-success/20 rounded-cat p-4 mb-6"
                >
                  <p className="font-kid-friendly text-cat-success text-sm">
                    ✅ Settings saved successfully!
                  </p>
                </motion.div>
              )}

              {/* Name Input */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block font-kid-friendly font-bold text-cat-dark mb-3"
                >
                  What&apos;s your name?
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full p-4 border-2 border-cat-light rounded-cat font-kid-friendly text-lg focus:border-cat-orange focus:outline-none transition-colors duration-200"
                  maxLength={50}
                />
                <p className="font-kid-friendly text-cat-gray text-sm mt-2">
                  This will be used to personalize your experience!
                </p>
              </div>

              {/* Year Group Selection */}
              <div className="mb-6">
                <label className="block font-kid-friendly font-bold text-cat-dark mb-3">
                  📚 Year Group
                </label>
                <select
                  value={yearGroup}
                  onChange={(e) => handleYearGroupChange(Number(e.target.value))}
                  disabled={yearGroupChanging}
                  className={`w-full p-4 border-2 border-cat-light rounded-cat font-kid-friendly text-lg focus:border-cat-orange focus:outline-none transition-colors duration-200 ${
                    yearGroupChanging ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={1}>Year 1 ({getWordCountForYearGroup(1)} words)</option>
                  <option value={2}>Year 2 ({getWordCountForYearGroup(2)} words)</option>
                  <option value={3}>Year 3 & 4 ({getWordCountForYearGroup(3)} words)</option>
                </select>
                <div className="mt-2 space-y-1">
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    Currently selected: <span className="font-bold text-cat-orange">{getYearGroupDisplayName(yearGroup)}</span>
                  </p>
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    ⚠️ Changing year group will reset your progress and reload all words for the new level.
                  </p>
                </div>
                
                {yearGroupChanging && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-cat-cream border border-cat-light rounded-cat"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-cat-orange border-t-transparent rounded-full flex-shrink-0"
                      />
                      <p className="font-kid-friendly text-cat-dark text-sm">
                        Updating year group and reloading words...
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ElevenLabs API Key Section */}
              <div className="mb-6">
                <label className="block font-kid-friendly font-bold text-cat-dark mb-3">
                  🔊 ElevenLabs API Key
                </label>
                
                {hasApiKey ? (
                  // Show when user has API key configured
                  <div className="space-y-3">
                    <div className="p-4 bg-cat-success/10 border-2 border-cat-success/30 rounded-cat">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-kid-friendly text-cat-success font-bold">
                            ✅ ElevenLabs Configured
                          </p>
                          <p className="font-kid-friendly text-cat-gray text-sm">
                            Premium voice quality is active
                          </p>
                        </div>
                        <motion.button
                          onClick={handleRemoveApiKey}
                          disabled={saving}
                          className="text-cat-error hover:text-cat-error/80 font-kid-friendly text-sm underline"
                          whileHover={{ scale: 1.05 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show when no API key configured
                  <div className="space-y-3">
                    {!showApiKeyInput ? (
                      <div className="p-4 bg-cat-cream border-2 border-cat-light rounded-cat">
                        <p className="font-kid-friendly text-cat-gray text-sm mb-3">
                          Add your ElevenLabs API key for premium voice quality. Without it, the app will use your browser&apos;s built-in voices.
                        </p>
                        <motion.button
                          onClick={() => setShowApiKeyInput(true)}
                          className="cat-button text-sm px-4 py-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Add API Key
                        </motion.button>
                      </div>
                    ) : (
                      // API key input form
                      <div className="space-y-4">
                        <div>
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                              setApiKey(e.target.value);
                              setApiKeyTestResult(null);
                            }}
                            placeholder="Enter your ElevenLabs API key..."
                            className="w-full p-4 border-2 border-cat-light rounded-cat font-kid-friendly text-lg focus:border-cat-orange focus:outline-none transition-colors duration-200"
                            maxLength={100}
                          />
                          
                          {/* Test Result Display */}
                          {apiKeyTestResult && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`mt-2 p-3 rounded-cat ${
                                apiKeyTestResult.valid
                                  ? 'bg-cat-success/10 border border-cat-success/20'
                                  : 'bg-cat-error/10 border border-cat-error/20'
                              }`}
                            >
                              <p className={`font-kid-friendly text-sm ${
                                apiKeyTestResult.valid ? 'text-cat-success' : 'text-cat-error'
                              }`}>
                                {apiKeyTestResult.valid 
                                  ? '✅ API key is valid!' 
                                  : `❌ ${apiKeyTestResult.error || 'Unknown error occurred'}`
                                }
                              </p>
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex space-x-3">
                          <motion.button
                            onClick={handleTestApiKey}
                            disabled={!apiKey.trim() || apiKeyTesting}
                            className={`flex-1 border-2 border-cat-orange text-cat-orange font-kid-friendly font-bold py-3 px-4 rounded-cat transition-colors duration-200 ${
                              !apiKey.trim() || apiKeyTesting
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-cat-orange hover:text-white'
                            }`}
                            whileHover={apiKey.trim() && !apiKeyTesting ? { scale: 1.02 } : {}}
                            whileTap={apiKey.trim() && !apiKeyTesting ? { scale: 0.98 } : {}}
                          >
                            {apiKeyTesting ? 'Testing...' : 'Test Key'}
                          </motion.button>
                          
                          <motion.button
                            onClick={handleSaveApiKey}
                            disabled={!apiKey.trim() || saving || (apiKeyTestResult ? !apiKeyTestResult.valid : false)}
                            className={`flex-1 cat-button py-3 px-4 ${
                              !apiKey.trim() || saving || (apiKeyTestResult && !apiKeyTestResult.valid)
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            whileHover={apiKey.trim() && !saving && (apiKeyTestResult ? apiKeyTestResult.valid : true) ? { scale: 1.02 } : {}}
                            whileTap={apiKey.trim() && !saving && (apiKeyTestResult ? apiKeyTestResult.valid : true) ? { scale: 0.98 } : {}}
                          >
                            {saving ? 'Saving...' : 'Save Key'}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => {
                              setShowApiKeyInput(false);
                              setApiKey('');
                              setApiKeyTestResult(null);
                            }}
                            className="text-cat-gray hover:text-cat-dark font-kid-friendly text-sm underline py-3 px-2"
                            whileHover={{ scale: 1.05 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="font-kid-friendly text-cat-gray text-sm mt-2">
                  Get your free API key at{' '}
                  <a
                    href="https://elevenlabs.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-cat-orange hover:text-cat-dark transition-colors duration-200 underline"
                  >
                    elevenlabs.io
                  </a>
                </p>
              </div>

              {/* Mastery Tutorial Section */}
              <div className="mb-6 pt-6 border-t-2 border-cat-light">
                <label className="block font-kid-friendly font-bold text-cat-dark mb-3">
                  🎯 Mastery System Tutorial
                </label>
                <div className="p-4 bg-cat-cream border-2 border-cat-light rounded-cat">
                  <p className="font-kid-friendly text-cat-gray text-sm mb-3">
                    Want to see the mastery system tutorial again? This explains how words level up as you practice!
                  </p>
                  <motion.button
                    onClick={async () => {
                      await updateSettings({ hasSeenMasteryTutorial: false });
                      router.push('/quests');
                    }}
                    className="cat-button text-sm px-4 py-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🎓 Replay Tutorial
                  </motion.button>
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className={`cat-button text-lg px-6 py-3 w-full ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                whileHover={saving ? {} : { scale: 1.02 }}
                whileTap={saving ? {} : { scale: 0.98 }}
              >
                <span className="flex items-center justify-center space-x-2">
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Settings</span>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </div>

          {/* Learning Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <div className="bg-white rounded-cat-lg p-8 shadow-cat">
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-6">
                📚 Learning Resources
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Word List Link */}
                <Link href="/word-list">
                  <motion.div
                    className="p-6 border-2 border-cat-light hover:border-cat-orange rounded-cat bg-cat-cream hover:bg-cat-light transition-all duration-200 cursor-pointer h-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <div className="text-3xl mb-3">📝</div>
                        <h3 className="font-kid-friendly font-bold text-cat-dark text-lg mb-2">
                          View All Words
                        </h3>
                        <p className="font-kid-friendly text-cat-gray text-sm">
                          Browse all {getWordCountForYearGroup(yearGroup)} {getYearGroupDisplayName(yearGroup)} spelling
                          words available for practice. Search and sort to find
                          specific words! Words sourced from{" "}
                          <span className="font-bold text-cat-orange">
                            Oxford Owl
                          </span>
                          .
                        </p>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-cat-orange ml-4 flex-shrink-0"
                      >
                        <path
                          d="M5 12h14m0 0l-7-7m7 7l-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </Link>

                {/* Future Resource - Commented for extensibility */}
                {/*
                <Link href="/progress-report">
                  <motion.div
                    className="p-6 border-2 border-cat-light hover:border-cat-orange rounded-cat bg-cat-cream hover:bg-cat-light transition-all duration-200 cursor-pointer h-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-kid-friendly font-bold text-cat-dark text-lg mb-2">
                          Progress Report
                        </h3>
                        <p className="font-kid-friendly text-cat-gray text-sm">
                          View detailed statistics about your spelling progress and achievements.
                        </p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cat-orange ml-4 flex-shrink-0">
                        <path d="M5 12h14m0 0l-7-7m7 7l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </motion.div>
                </Link>
                */}

                {/* Parents Information Link */}
                <Link href="/parents">
                  <motion.div
                    className="p-6 border-2 border-cat-light hover:border-cat-orange rounded-cat bg-cat-cream hover:bg-cat-light transition-all duration-200 cursor-pointer h-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                        <h3 className="font-kid-friendly font-bold text-cat-dark text-lg mb-2">
                          Information for Parents
                        </h3>
                        <p className="font-kid-friendly text-cat-gray text-sm">
                          Learn about privacy, security, data safety, and why this app is safe for your child. 
                          Understand ElevenLabs integration and iOS device compatibility.
                        </p>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-cat-orange ml-4 flex-shrink-0"
                      >
                        <path
                          d="M5 12h14m0 0l-7-7m7 7l-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
