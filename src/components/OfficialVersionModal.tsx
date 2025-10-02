'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfficialVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: 'en-us' | 'zh-tw';
}

export default function OfficialVersionModal({ isOpen, onClose, currentLanguage }: OfficialVersionModalProps) {
  const t = {
    'en-us': {
      title: 'Official Version Feature',
      description: 'This feature is available in the official version of Banana Editor.',
      features: [
        'Cloud storage and project management',
        'Team collaboration features',
        'Advanced AI models and faster processing',
        'Professional templates and assets',
        'Priority customer support'
      ],
      visitOfficial: 'Visit Official Version',
      closeButton: 'Continue with Open Source',
      officialUrl: 'https://banana.thepocket.company/'
    },
    'zh-tw': {
      title: '正式版功能',
      description: '此功能在 Banana Editor 正式版中提供。',
      features: [
        '雲端儲存與專案管理',
        '團隊協作功能',
        '進階 AI 模型與更快處理速度',
        '專業範本與素材庫',
        '優先客戶支援'
      ],
      visitOfficial: '前往正式版',
      closeButton: '繼續使用開源版',
      officialUrl: 'https://banana.thepocket.company/'
    }
  };

  const handleVisitOfficial = () => {
    window.open(t[currentLanguage].officialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-banana-400 to-banana-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t[currentLanguage].title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t[currentLanguage].description}
              </p>

              {/* Features List */}
              <div className="text-left mb-8">
                <h4 className="font-semibold text-gray-800 mb-3">
                  {currentLanguage === 'zh-tw' ? '正式版功能：' : 'Official Version Features:'}
                </h4>
                <ul className="space-y-2">
                  {t[currentLanguage].features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-banana-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t[currentLanguage].closeButton}
                </button>
                <button
                  onClick={handleVisitOfficial}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-banana-500 to-banana-600 hover:from-banana-600 hover:to-banana-700 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {t[currentLanguage].visitOfficial}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
