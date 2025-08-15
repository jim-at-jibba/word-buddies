'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { StoredSession } from '@/lib/storage/types';
import { formatDate, formatDateTime, formatDuration } from '@/lib/session-utils';

interface SessionsTableProps {
  sessions: StoredSession[];
}

type SortField = 'date' | 'score' | 'wordsAttempted' | 'duration';
type SortDirection = 'asc' | 'desc';

export default function SessionsTable({ sessions }: SessionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState('');

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;

    // Apply filter
    if (filter) {
      const filterLower = filter.toLowerCase();
      filtered = sessions.filter(session => {
        const dateStr = formatDate(session.date).toLowerCase();
        const scoreStr = session.score.toString();
        return dateStr.includes(filterLower) || scoreStr.includes(filterLower);
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'wordsAttempted':
          aValue = a.wordsAttempted;
          bValue = b.wordsAttempted;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const result = aValue.toString().localeCompare(bValue.toString());
        return sortDirection === 'asc' ? result : -result;
      }
    });
  }, [sessions, sortField, sortDirection, filter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cat-success bg-cat-success/10';
    if (score >= 60) return 'text-cat-warning bg-cat-warning/10';
    return 'text-cat-error bg-cat-error/10';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    return '💪';
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="font-kid-friendly text-2xl font-bold text-cat-dark mb-4">
          No practice sessions yet
        </h2>
        <p className="font-kid-friendly text-cat-gray mb-6">
          Start practicing to see your session history here!
        </p>
        <Link href="/practice">
          <button className="cat-button">
            Start Practicing
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and stats */}
      <div className="bg-white rounded-cat-lg p-6 shadow-cat">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="filter" className="block text-sm font-kid-friendly font-semibold text-cat-gray mb-2">
              Search sessions:
            </label>
            <input
              type="text"
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by date or score..."
              className="w-full p-3 border-2 border-cat-gray/20 rounded-cat font-kid-friendly focus:border-cat-orange focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-end">
            <div className="text-center">
              <div className="text-2xl font-kid-friendly font-bold text-cat-dark">
                {filteredAndSortedSessions.length}
              </div>
              <div className="text-sm font-kid-friendly text-cat-gray">
                Sessions found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-cat-lg shadow-cat overflow-hidden">
        <table className="w-full">
          <thead className="bg-cat-light border-b-2 border-cat-gray/20">
            <tr>
              <th className="text-left p-4 font-kid-friendly font-bold text-cat-dark">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-2 hover:text-cat-orange transition-colors"
                >
                  <span>Date</span>
                  <span>{getSortIcon('date')}</span>
                </button>
              </th>
              <th className="text-left p-4 font-kid-friendly font-bold text-cat-dark">
                <button
                  onClick={() => handleSort('score')}
                  className="flex items-center space-x-2 hover:text-cat-orange transition-colors"
                >
                  <span>Score</span>
                  <span>{getSortIcon('score')}</span>
                </button>
              </th>
              <th className="text-left p-4 font-kid-friendly font-bold text-cat-dark">
                Game Type
              </th>
              <th className="text-left p-4 font-kid-friendly font-bold text-cat-dark">
                <button
                  onClick={() => handleSort('wordsAttempted')}
                  className="flex items-center space-x-2 hover:text-cat-orange transition-colors"
                >
                  <span>Words</span>
                  <span>{getSortIcon('wordsAttempted')}</span>
                </button>
              </th>
              <th className="text-left p-4 font-kid-friendly font-bold text-cat-dark">
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center space-x-2 hover:text-cat-orange transition-colors"
                >
                  <span>Duration</span>
                  <span>{getSortIcon('duration')}</span>
                </button>
              </th>
              <th className="text-center p-4 font-kid-friendly font-bold text-cat-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSessions.map((session, index) => (
              <motion.tr
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-cat-gray/10 hover:bg-cat-light/50 transition-colors"
              >
                <td className="p-4 font-kid-friendly text-cat-dark">
                  <div className="font-semibold">
                    {formatDate(session.date)}
                  </div>
                  <div className="text-sm text-cat-gray">
                    {formatDateTime(session.date).split(', ')[1]}
                  </div>
                </td>
                <td className="p-4">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-cat ${getScoreColor(session.score)}`}>
                    <span>{getScoreEmoji(session.score)}</span>
                    <span className="font-kid-friendly font-bold">
                      {session.score}%
                    </span>
                  </div>
                </td>
                <td className="p-4 font-kid-friendly text-cat-dark">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-cat ${
                    session.gameType === 'homophones' 
                      ? 'bg-cat-success/20 text-cat-success' 
                      : 'bg-cat-orange/20 text-cat-orange'
                  }`}>
                    <span>{session.gameType === 'homophones' ? '🔄' : '✏️'}</span>
                    <span className="font-semibold">
                      {session.gameType === 'homophones' ? 'Homophones' : 'Spelling'}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-kid-friendly text-cat-dark">
                  <span className="font-semibold">{session.correctWords}</span>
                  <span className="text-cat-gray"> / {session.wordsAttempted}</span>
                </td>
                <td className="p-4 font-kid-friendly text-cat-dark">
                  {formatDuration(session.duration)}
                </td>
                <td className="p-4 text-center">
                  <Link href={`/sessions/${session.id}`}>
                    <button className="px-4 py-2 bg-cat-orange text-white rounded-cat hover:bg-cat-orange-dark transition-colors font-kid-friendly font-semibold">
                      View Details
                    </button>
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredAndSortedSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-cat-lg p-4 shadow-cat"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-kid-friendly font-bold text-cat-dark">
                  {formatDate(session.date)}
                </div>
                <div className="text-sm font-kid-friendly text-cat-gray">
                  {formatDateTime(session.date).split(', ')[1]}
                </div>
              </div>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-cat ${getScoreColor(session.score)}`}>
                <span>{getScoreEmoji(session.score)}</span>
                <span className="font-kid-friendly font-bold">
                  {session.score}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm font-kid-friendly text-cat-gray">Game Type</div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                  session.gameType === 'homophones' 
                    ? 'bg-cat-success/20 text-cat-success' 
                    : 'bg-cat-orange/20 text-cat-orange'
                }`}>
                  <span>{session.gameType === 'homophones' ? '🔄' : '✏️'}</span>
                  <span className="font-semibold">
                    {session.gameType === 'homophones' ? 'Homophones' : 'Spelling'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm font-kid-friendly text-cat-gray">Words</div>
                <div className="font-kid-friendly font-semibold text-cat-dark">
                  {session.correctWords} / {session.wordsAttempted}
                </div>
              </div>
              <div>
                <div className="text-sm font-kid-friendly text-cat-gray">Duration</div>
                <div className="font-kid-friendly font-semibold text-cat-dark">
                  {formatDuration(session.duration)}
                </div>
              </div>
            </div>
            
            <Link href={`/sessions/${session.id}`}>
              <button className="w-full px-4 py-2 bg-cat-orange text-white rounded-cat hover:bg-cat-orange-dark transition-colors font-kid-friendly font-semibold">
                View Details
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}