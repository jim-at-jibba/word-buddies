import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const words = sqliteTable('words', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  word: text('word').notNull().unique(),
  difficulty: integer('difficulty').notNull().default(1), // 1-5 scale
  attempts: integer('attempts').notNull().default(0),
  correctAttempts: integer('correct_attempts').notNull().default(0),
  lastAttempted: integer('last_attempted', { mode: 'timestamp' }),
  nextReview: integer('next_review', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  wordsAttempted: integer('words_attempted').notNull(),
  correctWords: integer('correct_words').notNull(),
  score: real('score').notNull(),
  duration: integer('duration').notNull(), // in seconds
});

export const wordAttempts = sqliteTable('word_attempts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').references(() => sessions.id),
  word: text('word').notNull(),
  userSpelling: text('user_spelling').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  attempts: integer('attempts').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type WordAttempt = typeof wordAttempts.$inferSelect;
export type NewWordAttempt = typeof wordAttempts.$inferInsert;