"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CatMascot from "@/components/CatMascot";

export default function ParentsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleBackClick = () => {
    router.back();
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
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
              👨‍👩‍👧‍👦 For Parents
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center">
              <CatMascot mood="happy" size="large" />
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
                Welcome to Word Buddies!
              </h2>
              <p className="font-kid-friendly text-cat-gray text-lg max-w-2xl mx-auto">
                A safe, secure spelling practice app designed for Year 3 and 4 students. 
                Everything runs locally in your browser - no data ever leaves your device.
              </p>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-cat-lg p-8 shadow-cat mb-8"
          >
            <h3 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-6 text-center">
              🛡️ Privacy & Security First
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cat-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-kid-friendly font-bold text-cat-dark">100% Local Storage</h4>
                    <p className="font-kid-friendly text-cat-gray text-sm">
                      All progress, settings, and personal information stays on your device only
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cat-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-kid-friendly font-bold text-cat-dark">No Account Required</h4>
                    <p className="font-kid-friendly text-cat-gray text-sm">
                      No sign-ups, passwords, or personal information needed to use the app
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cat-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-kid-friendly font-bold text-cat-dark">No Internet Required</h4>
                    <p className="font-kid-friendly text-cat-gray text-sm">
                      Works offline once loaded - perfect for travel or limited connectivity
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cat-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-kid-friendly font-bold text-cat-dark">Encrypted Storage</h4>
                    <p className="font-kid-friendly text-cat-gray text-sm">
                      Any optional settings (like API keys) are encrypted in browser storage
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cat-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-kid-friendly font-bold text-cat-dark">UK GDPR Compliant</h4>
                    <p className="font-kid-friendly text-cat-gray text-sm">
                      Follows UK data protection laws with no personal data collection
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cat-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-kid-friendly font-bold text-cat-dark">Open Source</h4>
                    <p className="font-kid-friendly text-cat-gray text-sm">
                      Code is publicly available for transparency and security review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Spaced Repetition Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-cat-lg p-8 shadow-cat mb-8"
          >
            <h3 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-6 text-center">
              🧠 How the Learning System Works
            </h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-cat border-2 border-blue-200">
                <h4 className="font-kid-friendly font-bold text-cat-dark mb-3">
                  📚 Spaced Repetition Learning
                </h4>
                <p className="font-kid-friendly text-cat-gray mb-4">
                  Word Buddies uses a scientifically-proven learning technique called <strong>spaced repetition</strong>. 
                  This method helps move words from short-term to long-term memory by reviewing them at optimal intervals.
                </p>
                
                <div className="bg-white p-4 rounded-cat mb-4">
                  <h5 className="font-kid-friendly font-bold text-cat-dark mb-2">How It Works:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">Day 0</div>
                      <p className="font-kid-friendly text-cat-gray text-sm">Your child learns a new word</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">Day 1</div>
                      <p className="font-kid-friendly text-cat-gray text-sm">First review - reinforces initial learning</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">Day 3</div>
                      <p className="font-kid-friendly text-cat-gray text-sm">Second review - strengthens memory</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">Day 7</div>
                      <p className="font-kid-friendly text-cat-gray text-sm">Third review - builds long-term retention</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">Day 14</div>
                      <p className="font-kid-friendly text-cat-gray text-sm">Fourth review - confirms mastery</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">Day 30</div>
                      <p className="font-kid-friendly text-cat-gray text-sm">Final review - word is mastered!</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-cat">
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    <strong>Important:</strong> If your child spells a word incorrectly, it will appear again in 2 hours for extra practice. 
                    This ensures struggling words get more attention.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-cat-light p-6 rounded-cat">
                  <h5 className="font-kid-friendly font-bold text-cat-dark mb-3">
                    ✅ Why Review Words Show 100% Success
                  </h5>
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    You might notice words with 100% success rate still appear for review. This is intentional! 
                    Just because your child spelled &quot;thought&quot; correctly once doesn&apos;t mean they&apos;ll remember it next week. 
                    The system ensures long-term retention through multiple successful reviews over time.
                  </p>
                </div>
                
                <div className="bg-cat-light p-6 rounded-cat">
                  <h5 className="font-kid-friendly font-bold text-cat-dark mb-3">
                    🎯 Automatic Priority System
                  </h5>
                  <p className="font-kid-friendly text-cat-gray text-sm">
                    During regular practice sessions, words due for review are automatically prioritized. 
                    Your child doesn&apos;t need to use the special &quot;Review&quot; page - the app intelligently mixes 
                    review words with new words to maintain the optimal learning schedule.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-cat">
                <p className="font-kid-friendly text-cat-gray text-sm text-center">
                  <strong>Research shows:</strong> Spaced repetition can improve retention by up to 200% compared to 
                  traditional study methods. By spacing out reviews, your child&apos;s brain has time to consolidate 
                  memories, making spelling skills stick for the long term.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ElevenLabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-cat-lg p-8 shadow-cat mb-8"
          >
            <h3 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-6 text-center">
              🔊 About ElevenLabs Voice Quality (Optional)
            </h3>
            
            <div className="space-y-6">
              <div className="bg-cat-cream p-6 rounded-cat border-2 border-cat-orange/30">
                <h4 className="font-kid-friendly font-bold text-cat-dark mb-3">
                  📱 Why ElevenLabs for iOS Devices?
                </h4>
                <p className="font-kid-friendly text-cat-gray mb-3">
                  iOS devices (iPhone, iPad) have limitations with built-in text-to-speech that can cause:
                </p>
                <ul className="font-kid-friendly text-cat-gray text-sm space-y-1 ml-4">
                  <li>• Audio cutting out or not playing at all</li>
                  <li>• Inconsistent voice quality between sessions</li>
                  <li>• Technical issues in Safari and Chrome browsers</li>
                  <li>• Unreliable performance during spelling practice</li>
                </ul>
                <p className="font-kid-friendly text-cat-gray mt-3">
                  ElevenLabs provides reliable, high-quality voice synthesis that works consistently across all devices.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark mb-3">
                    🔒 Security of API Keys
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-kid-friendly text-cat-gray">
                      <strong>Your API key never leaves your device:</strong>
                    </p>
                    <ul className="font-kid-friendly text-cat-gray ml-4 space-y-1">
                      <li>• Encrypted using military-grade AES-256 encryption</li>
                      <li>• Stored only in your browser&apos;s local storage</li>
                      <li>• Never transmitted to our servers</li>
                      <li>• Automatically cleared from memory after use</li>
                      <li>• Only accessible on your specific device/browser</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-kid-friendly font-bold text-cat-dark mb-3">
                    💡 How It Works
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-kid-friendly text-cat-gray">
                      <strong>Simple and secure process:</strong>
                    </p>
                    <ul className="font-kid-friendly text-cat-gray ml-4 space-y-1">
                      <li>• You create a free ElevenLabs account</li>
                      <li>• Add your API key in app settings (optional)</li>
                      <li>• App encrypts and stores it locally only</li>
                      <li>• Enjoy premium voice quality on all devices</li>
                      <li>• You control your own usage and costs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-cat mb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 text-xl">⚠️</div>
                  <div>
                    <h5 className="font-kid-friendly font-bold text-yellow-800 mb-2">
                      Security Disclaimer
                    </h5>
                    <p className="font-kid-friendly text-yellow-700 text-sm">
                      <strong>Use at your own risk:</strong> While we have implemented strong encryption and security measures, 
                      you are using your ElevenLabs API key at your own risk. We are not liable if your API key gets 
                      compromised through browser vulnerabilities, malicious extensions, or other security issues beyond our control. 
                      Monitor your ElevenLabs usage regularly and revoke/regenerate your API key if you suspect any unauthorized access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cat-light p-4 rounded-cat">
                <p className="font-kid-friendly text-cat-gray text-sm text-center">
                  <strong>Important:</strong> ElevenLabs integration is completely optional. 
                  The app works perfectly fine using your device&apos;s built-in voices on most computers and Android devices.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white rounded-cat-lg p-8 shadow-cat mb-8"
          >
            <h3 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-6 text-center">
              ❓ Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  id: 'data-safety',
                  question: 'Is my child\'s data safe?',
                  answer: 'Absolutely! Everything stays on your device. Names, progress, spelling attempts - nothing is ever sent to external servers. When your child closes the browser, their data remains safely stored locally.'
                },
                {
                  id: 'offline-use',
                  question: 'Can my child use this without internet?',
                  answer: 'Yes! Once the app loads initially, it works completely offline. This makes it perfect for travel, areas with poor connectivity, or when you want to limit internet access.'
                },
                {
                  id: 'multiple-children',
                  question: 'Can multiple children use the same device?',
                  answer: 'Each browser profile maintains separate data. You can create different browser profiles for each child, or they can use different browsers (Chrome, Safari, Firefox) to keep their progress separate.'
                },
                {
                  id: 'curriculum-alignment',
                  question: 'Does this align with school curriculum?',
                  answer: 'Yes! Word Buddies uses Year 3 and 4 spelling words from Oxford Owl, which aligns with UK National Curriculum requirements. The spaced repetition learning method is based on educational research.'
                },
                {
                  id: 'costs',
                  question: 'Are there any hidden costs?',
                  answer: 'Word Buddies is completely free to use. ElevenLabs API usage (optional) costs about £1-2 per month for typical usage, and you control this directly through your own account.'
                },
                {
                  id: 'technical-requirements',
                  question: 'What devices does this work on?',
                  answer: 'Any modern device with a web browser: iPhone, iPad, Android tablets, Windows PCs, Macs, Chromebooks. No app store downloads or installations required.'
                }
              ].map((faq) => (
                <div key={faq.id} className="border border-cat-light rounded-cat">
                  <button
                    onClick={() => toggleSection(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-cat-cream transition-colors duration-200"
                  >
                    <span className="font-kid-friendly font-bold text-cat-dark">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: activeSection === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-cat-orange"
                    >
                      ▼
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: activeSection === faq.id ? "auto" : 0,
                      opacity: activeSection === faq.id ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0">
                      <p className="font-kid-friendly text-cat-gray">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="bg-white rounded-cat-lg p-8 shadow-cat text-center"
          >
            <h3 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
              📧 Questions or Concerns?
            </h3>
            <p className="font-kid-friendly text-cat-gray mb-6">
              We&apos;re committed to providing a safe, educational experience for your child. 
              If you have any questions about privacy, security, or how the app works, we&apos;re here to help.
            </p>
            <div className="bg-cat-cream p-4 rounded-cat">
              <p className="font-kid-friendly text-cat-gray text-sm">
                <strong>Open Source:</strong> This app&apos;s code is publicly available for review at{' '}
                <a 
                  href="https://github.com/jim-at-jibba/word-buddies" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cat-orange hover:text-cat-dark underline"
                >
                  GitHub
                </a>
                {' '}for complete transparency about how your data is handled.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}