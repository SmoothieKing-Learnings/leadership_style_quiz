import { describe, it, expect } from 'vitest';
import { calculateResults } from './calculateResults';
import { STYLES } from '../data/stylesData';

describe('calculateResults (Skill 2)', () => {
  it('should calculate a clear single winner correctly', () => {
    // All 7 questions answered as 'teacher' — full sweep → 100% for teacher.
    // calculateResults uses QUESTIONS.length (7) as the denominator, so the
    // test must pass the same number of answers as the production app sends.
    // Percentage lives on allScores entries (topStyles holds raw style refs,
    // which is what ResultsScreen consumes).
    const answers = Array(7).fill('teacher');
    const results = calculateResults(answers, STYLES);

    expect(results.topStyles).toHaveLength(1);
    expect(results.topStyles[0].id).toBe('teacher');
    const teacherScore = results.allScores.find(s => s.id === 'teacher');
    expect(teacherScore.percentage).toBe(100);
  });

  it('should accurately handle an exact 2-way tie', () => {
    // 2 teacher, 2 coach
    const answers = ['teacher', 'coach', 'teacher', 'coach'];
    const results = calculateResults(answers, STYLES);
    
    expect(results.topStyles).toHaveLength(2);
    const topIds = results.topStyles.map(s => s.id);
    expect(topIds).toContain('teacher');
    expect(topIds).toContain('coach');
  });

  it('should initialize all styles with 0 score with no answers provided', () => {
    const answers = [];
    const results = calculateResults(answers, STYLES);
    
    // Everyone ties at 0 when no questions answered
    expect(results.topStyles).toHaveLength(4);
    results.allScores.forEach(styleResult => {
      expect(styleResult.score).toBe(0);
      expect(styleResult.percentage).toBe(0);
    });
  });
});
