/**
 * SnipFlow AI Service
 * Provides intelligent suggestions, context awareness, and predictive capabilities
 */

import { logger } from '../logger';
import { Chain, Snippet } from '../types';
import { app } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface AIContext {
  applicationName: string;
  windowTitle: string;
  recentText?: string;
  cursorPosition?: { x: number; y: number };
  timeOfDay: string;
  dayOfWeek: string;
  userActivity: UserActivity[];
}

export interface UserActivity {
  action: 'snippet' | 'chain' | 'clipboard';
  content: string;
  timestamp: number;
  application: string;
  frequency?: number;
}

export interface AISuggestion {
  type: 'snippet' | 'chain' | 'template' | 'correction';
  content: string;
  confidence: number;
  reason: string;
  metadata?: any;
}

export interface PredictiveModel {
  patterns: Pattern[];
  userPreferences: UserPreferences;
  contextRules: ContextRule[];
}

interface Pattern {
  id: string;
  trigger: string;
  response: string;
  context: string[];
  frequency: number;
  lastUsed: number;
}

interface UserPreferences {
  preferredStyle: 'formal' | 'casual' | 'technical';
  commonPhrases: string[];
  avoidPhrases: string[];
  languageSettings: {
    primary: string;
    alternatives: string[];
  };
}

interface ContextRule {
  application: string;
  timeRange?: { start: string; end: string };
  suggestedSnippets: string[];
  blockedSnippets: string[];
}

export class AIService {
  private model: PredictiveModel;
  private modelPath: string;
  private activityBuffer: UserActivity[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  
  constructor() {
    const userDataPath = app.getPath('userData');
    const aiDir = join(userDataPath, 'ai');
    
    if (!existsSync(aiDir)) {
      mkdirSync(aiDir, { recursive: true });
    }
    
    this.modelPath = join(aiDir, 'model.json');
    this.model = this.loadModel();
    
    // Start learning cycle
    this.startLearningCycle();
  }
  
  /**
   * Get AI suggestions based on current context
   */
  async getSuggestions(context: AIContext): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    
    try {
      // 1. Pattern matching suggestions
      const patternSuggestions = this.getPatternSuggestions(context);
      suggestions.push(...patternSuggestions);
      
      // 2. Time-based suggestions
      const timeSuggestions = this.getTimeSuggestions(context);
      suggestions.push(...timeSuggestions);
      
      // 3. Application-specific suggestions
      const appSuggestions = this.getApplicationSuggestions(context);
      suggestions.push(...appSuggestions);
      
      // 4. Predictive typing suggestions
      if (context.recentText) {
        const predictiveSuggestions = this.getPredictiveSuggestions(context.recentText);
        suggestions.push(...predictiveSuggestions);
      }
      
      // Sort by confidence and deduplicate
      return this.rankAndFilterSuggestions(suggestions);
      
    } catch (error) {
      logger.error('[AI Service] Error getting suggestions:', error);
      return [];
    }
  }
  
  /**
   * Learn from user activity
   */
  recordActivity(activity: UserActivity): void {
    this.activityBuffer.push(activity);
    
    if (this.activityBuffer.length > this.BUFFER_SIZE) {
      this.activityBuffer.shift();
    }
    
    // Update patterns based on activity
    this.updatePatterns(activity);
  }
  
  /**
   * Get pattern-based suggestions
   */
  private getPatternSuggestions(context: AIContext): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    for (const pattern of this.model.patterns) {
      // Check if pattern matches current context
      if (this.matchesContext(pattern, context)) {
        const confidence = this.calculatePatternConfidence(pattern, context);
        
        if (confidence >= this.CONFIDENCE_THRESHOLD) {
          suggestions.push({
            type: 'snippet',
            content: pattern.response,
            confidence,
            reason: `Frequently used in ${context.applicationName}`,
            metadata: { patternId: pattern.id }
          });
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * Get time-based suggestions
   */
  private getTimeSuggestions(context: AIContext): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const hour = new Date().getHours();
    
    // Morning greetings
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        type: 'template',
        content: 'Good morning {{name}},\\n\\nI hope this email finds you well.',
        confidence: 0.8,
        reason: 'Morning communication template'
      });
    }
    
    // End of day summaries
    if (hour >= 16 && hour < 19) {
      suggestions.push({
        type: 'template',
        content: 'End of Day Summary:\\n- {{completed_tasks}}\\n- {{pending_items}}\\n- {{tomorrow_priorities}}',
        confidence: 0.75,
        reason: 'End of day reporting template'
      });
    }
    
    // Friday wrap-ups
    if (context.dayOfWeek === 'Friday' && hour >= 14) {
      suggestions.push({
        type: 'template',
        content: 'Weekly Wrap-up:\\n\\n{{achievements}}\\n\\nNext Week:\\n{{plans}}\\n\\nHave a great weekend!',
        confidence: 0.85,
        reason: 'Friday wrap-up template'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get application-specific suggestions
   */
  private getApplicationSuggestions(context: AIContext): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const app = context.applicationName.toLowerCase();
    
    // Email applications
    if (app.includes('outlook') || app.includes('mail') || app.includes('gmail')) {
      suggestions.push({
        type: 'chain',
        content: 'Email Signatures',
        confidence: 0.9,
        reason: 'Email application detected'
      });
    }
    
    // Code editors
    if (app.includes('code') || app.includes('visual studio') || app.includes('intellij')) {
      suggestions.push({
        type: 'chain',
        content: 'Code Snippets',
        confidence: 0.95,
        reason: 'Development environment detected'
      });
    }
    
    // Browsers
    if (app.includes('chrome') || app.includes('firefox') || app.includes('edge')) {
      // Check window title for specific sites
      if (context.windowTitle.toLowerCase().includes('github')) {
        suggestions.push({
          type: 'template',
          content: '```{{language}}\\n{{code}}\\n```',
          confidence: 0.85,
          reason: 'GitHub markdown detected'
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Get predictive typing suggestions
   */
  private getPredictiveSuggestions(recentText: string): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const words = recentText.split(' ').filter(w => w.length > 0);
    
    if (words.length === 0) return suggestions;
    
    const lastWord = words[words.length - 1]?.toLowerCase() || '';
    const phrase = words.slice(-3).join(' ').toLowerCase();
    
    // Common phrase completions
    const commonCompletions: Record<string, string[]> = {
      'thank': ['you', 'you for your time', 'you for your consideration'],
      'please': ['let me know', 'find attached', 'feel free to'],
      'looking': ['forward to', 'forward to hearing from you', 'into this'],
      'best': ['regards', 'wishes', 'practices'],
      'kind': ['regards', 'reminder'],
      'i am': ['writing to', 'pleased to', 'happy to help'],
      'please let': ['me know', 'me know if you have any questions'],
      'feel free': ['to reach out', 'to contact me', 'to ask questions']
    };
    
    // Check for phrase completions
    for (const [trigger, completions] of Object.entries(commonCompletions)) {
      if (phrase.endsWith(trigger) || lastWord === trigger) {
        completions.forEach((completion, index) => {
          suggestions.push({
            type: 'correction',
            content: completion,
            confidence: 0.9 - (index * 0.1),
            reason: 'Common phrase completion'
          });
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Check if pattern matches context
   */
  private matchesContext(pattern: Pattern, context: AIContext): boolean {
    // Check application match
    if (pattern.context.includes('any') || 
        pattern.context.some(ctx => context.applicationName.toLowerCase().includes(ctx))) {
      
      // Check time-based relevance
      const hoursSinceUse = (Date.now() - pattern.lastUsed) / (1000 * 60 * 60);
      if (hoursSinceUse < 24) {
        return true; // Recently used patterns are more likely to be relevant
      }
      
      // Check frequency threshold
      return pattern.frequency > 5;
    }
    
    return false;
  }
  
  /**
   * Calculate pattern confidence
   */
  private calculatePatternConfidence(pattern: Pattern, context: AIContext): number {
    let confidence = 0.5; // Base confidence
    
    // Frequency boost
    confidence += Math.min(pattern.frequency / 100, 0.3);
    
    // Recency boost
    const daysSinceUse = (Date.now() - pattern.lastUsed) / (1000 * 60 * 60 * 24);
    if (daysSinceUse < 1) confidence += 0.2;
    else if (daysSinceUse < 7) confidence += 0.1;
    
    // Context match boost
    if (pattern.context.includes(context.applicationName.toLowerCase())) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Update patterns based on user activity
   */
  private updatePatterns(activity: UserActivity): void {
    // Find existing pattern or create new one
    const existingPattern = this.model.patterns.find(p => 
      p.response === activity.content && 
      p.context.includes(activity.application.toLowerCase())
    );
    
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastUsed = activity.timestamp;
    } else {
      // Create new pattern
      this.model.patterns.push({
        id: this.generatePatternId(),
        trigger: '', // Will be determined by analysis
        response: activity.content,
        context: [activity.application.toLowerCase()],
        frequency: 1,
        lastUsed: activity.timestamp
      });
    }
    
    // Limit pattern storage
    if (this.model.patterns.length > 1000) {
      // Remove least used patterns
      this.model.patterns.sort((a, b) => b.frequency - a.frequency);
      this.model.patterns = this.model.patterns.slice(0, 800);
    }
  }
  
  /**
   * Rank and filter suggestions
   */
  private rankAndFilterSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    // Remove duplicates
    const seen = new Set<string>();
    const filtered = suggestions.filter(s => {
      const key = `${s.type}:${s.content}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Return top suggestions
    return filtered.slice(0, 5);
  }
  
  /**
   * Start learning cycle
   */
  private startLearningCycle(): void {
    // Save model periodically
    setInterval(() => {
      this.saveModel();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Analyze patterns periodically
    setInterval(() => {
      this.analyzePatterns();
    }, 15 * 60 * 1000); // Every 15 minutes
  }
  
  /**
   * Analyze patterns for insights
   */
  private analyzePatterns(): void {
    // Group patterns by context
    const contextGroups = new Map<string, Pattern[]>();
    
    for (const pattern of this.model.patterns) {
      for (const context of pattern.context) {
        if (!contextGroups.has(context)) {
          contextGroups.set(context, []);
        }
        contextGroups.get(context)!.push(pattern);
      }
    }
    
    // Update context rules based on analysis
    this.model.contextRules = Array.from(contextGroups.entries()).map(([app, patterns]) => ({
      application: app,
      suggestedSnippets: patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map(p => p.response),
      blockedSnippets: [] // Could be populated based on user feedback
    }));
  }
  
  /**
   * Load model from disk
   */
  private loadModel(): PredictiveModel {
    try {
      if (existsSync(this.modelPath)) {
        const data = readFileSync(this.modelPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.error('[AI Service] Error loading model:', error);
    }
    
    // Return default model
    return {
      patterns: [],
      userPreferences: {
        preferredStyle: 'formal',
        commonPhrases: [],
        avoidPhrases: [],
        languageSettings: {
          primary: 'en',
          alternatives: []
        }
      },
      contextRules: []
    };
  }
  
  /**
   * Save model to disk
   */
  private saveModel(): void {
    try {
      writeFileSync(this.modelPath, JSON.stringify(this.model, null, 2));
      logger.info('[AI Service] Model saved successfully');
    } catch (error) {
      logger.error('[AI Service] Error saving model:', error);
    }
  }
  
  /**
   * Generate unique pattern ID
   */
  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiService = new AIService();
