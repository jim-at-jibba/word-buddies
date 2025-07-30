'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CatMascot from '@/components/CatMascot';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, loading, error, updateSettings } = useSettings();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load current name when settings are loaded
  useEffect(() => {
    if (settings?.name) {
      setName(settings.name);
    }
  }, [settings]);

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateSettings({ name: name.trim() || undefined });
      setSaveSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    router.back();
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Settings Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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

              {/* Future Settings Sections - Commented for extensibility */}
              {/*
              <div className="mb-6">
                <label className="block font-kid-friendly font-bold text-cat-dark mb-3">
                  📚 Year Group
                </label>
                <select className="w-full p-4 border-2 border-cat-light rounded-cat font-kid-friendly text-lg focus:border-cat-orange focus:outline-none transition-colors duration-200">
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-kid-friendly font-bold text-cat-dark mb-3">
                  🔊 ElevenLabs API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your API key..."
                  className="w-full p-4 border-2 border-cat-light rounded-cat font-kid-friendly text-lg focus:border-cat-orange focus:outline-none transition-colors duration-200"
                />
                <p className="font-kid-friendly text-cat-gray text-sm mt-2">
                  Optional: For better text-to-speech quality
                </p>
              </div>
              */}

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className={`cat-button text-lg px-6 py-3 w-full ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={saving ? {} : { scale: 1.02 }}
                whileTap={saving ? {} : { scale: 0.98 }}
              >
                <span className="flex items-center justify-center space-x-2">
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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

            {/* Cat Mascot */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <CatMascot mood="happy" size="large" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-6"
              >
                <h3 className="text-xl font-kid-friendly font-bold text-cat-dark mb-3">
                  Let&apos;s personalize your experience!
                </h3>
                <p className="font-kid-friendly text-cat-gray">
                  Tell me your name so I can cheer you on during spelling practice! 
                  You can always change it later.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}