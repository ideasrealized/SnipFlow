import { 
  createChain, 
  updateChain, 
  getChains,
  createSnippet 
} from './db';
import { logger } from './logger';
import type { Chain, ChainOption } from './types';

export async function setupTestStarterChains(): Promise<void> {
  logger.info('[TestData] Setting up test starter chains...');

  try {
    // Test Starter Chain 1: Customer Support
    const customerSupportOptions: ChainOption[] = [
      {
        id: 'greeting',
        title: 'Greeting',
        body: 'Hello [?:Customer Name], thank you for contacting us. I understand you need help with [?:Issue Description]. Let me assist you with that.'
      },
      {
        id: 'followup',
        title: 'Follow-up',
        body: 'Hi [?:Customer Name], I wanted to follow up on your recent inquiry about [?:Previous Issue]. Has this been resolved to your satisfaction?'
      },
      {
        id: 'escalation',
        title: 'Escalation',
        body: 'I understand your concern about [?:Issue]. Let me escalate this to our [Chain:Support Level] team for immediate attention.'
      }
    ];

    const customerSupportChain = createChain({
      name: 'Customer Support Responses',
      description: 'Quick customer support response templates',
      options: customerSupportOptions,
      tags: ['support', 'customer', 'communication'],
      isStarterChain: true,
      isPinned: true
    });

    // Test Starter Chain 2: Email Templates
    const emailOptions: ChainOption[] = [
      {
        id: 'meeting',
        title: 'Meeting Request',
        body: 'Subject: Meeting Request - [?:Topic]\n\nHi [?:Recipient Name],\n\nI hope this email finds you well. I would like to schedule a meeting to discuss [?:Topic]. \n\nWould [?:Proposed Time] work for you? The meeting should take approximately [?:Duration].\n\nBest regards,\n[?:Your Name]'
      },
      {
        id: 'project-update',
        title: 'Project Update',
        body: 'Subject: [?:Project Name] - Status Update\n\nTeam,\n\nHere\'s the latest update on [?:Project Name]:\n\n✅ Completed: [?:Completed Tasks]\n🔄 In Progress: [?:Current Tasks]\n📅 Next Steps: [?:Next Steps]\n\nTimeline: [?:Timeline Update]\n\nLet me know if you have any questions.\n\nBest,\n[?:Your Name]'
      }
    ];

    const emailChain = createChain({
      name: 'Email Templates',
      description: 'Professional email templates for common scenarios',
      options: emailOptions,
      tags: ['email', 'communication', 'professional'],
      isStarterChain: true,
      isPinned: false
    });

    // Test Starter Chain 3: Code Comments
    const codeCommentOptions: ChainOption[] = [
      {
        id: 'function-doc',
        title: 'Function Documentation',
        body: '/**\n * [?:Function Description]\n * @param {[?:Param Type]} [?:Param Name] - [?:Param Description]\n * @returns {[?:Return Type]} [?:Return Description]\n * @example\n * [?:Usage Example]\n */'
      },
      {
        id: 'todo-comment',
        title: 'TODO Comment',
        body: '// TODO: [?:Task Description]\n// Priority: [?:Priority Level]\n// Assigned: [?:Developer Name]\n// Due: [?:Due Date]'
      },
      {
        id: 'bug-fix',
        title: 'Bug Fix Comment',
        body: '// BUG FIX: [?:Bug Description]\n// Issue: [?:Issue Number]\n// Root Cause: [?:Root Cause]\n// Solution: [?:Solution Description]\n// Tested: [?:Test Results]'
      }
    ];

    const codeChain = createChain({
      name: 'Code Comments',
      description: 'Standardized code comment templates',
      options: codeCommentOptions,
      tags: ['code', 'documentation', 'development'],
      isStarterChain: true,
      isPinned: true
    });

    // Support Level Chain (referenced by Customer Support)
    const supportLevelOptions: ChainOption[] = [
      {
        id: 'tier1',
        title: 'Tier 1',
        body: 'Level 1 Support'
      },
      {
        id: 'tier2',
        title: 'Tier 2',
        body: 'Level 2 Technical Support'
      },
      {
        id: 'management',
        title: 'Management',
        body: 'Management Team'
      }
    ];

    const supportLevelChain = createChain({
      name: 'Support Level',
      description: 'Support escalation levels',
      options: supportLevelOptions,
      tags: ['support', 'escalation'],
      isStarterChain: false,
      isPinned: false
    });

    // Test Starter Chain 4: Chain Reference Example
    const chainRefOptions: ChainOption[] = [
      {
        id: 'intro',
        title: 'Introduction',
        body: 'We are the masters of [Chain:Customer Support Responses]. Our expertise in [?:Domain] allows us to provide [Chain:Email Templates] that exceed expectations.'
      },
      {
        id: 'advanced',
        title: 'Advanced Usage',
        body: 'For complex scenarios, we combine [Chain:Code Comments] with [?:Custom Solution] to deliver [Chain:Email Templates] that are both professional and effective.'
      }
    ];

    const chainRefChain = createChain({
      name: 'Chain Reference Demo',
      description: 'Demonstrates chain referencing syntax',
      options: chainRefOptions,
      tags: ['demo', 'reference', 'advanced'],
      isStarterChain: true,
      isPinned: false
    });

    // Test Starter Snippets
    const snippets = [
      'Thanks for your patience while we resolve this issue.',
      'Please find the requested information attached.',
      'I\'ll get back to you within 24 hours with an update.',
      'Let me know if you need any clarification on this.',
      'Best regards,\n[Your Name]'
    ];

    for (const content of snippets) {
      createSnippet({ content, isPinned: true });
    }

    logger.info('[TestData] Test starter chains and snippets created successfully!');
    
    // Log summary
    const allChains = getChains();
    const starterChains = allChains.filter(c => c.isStarterChain);
    logger.info(`[TestData] Summary: ${starterChains.length} starter chains out of ${allChains.length} total chains`);

  } catch (error) {
    logger.error('[TestData] Error setting up test data:', error);
  }
}

export async function clearTestData(): Promise<void> {
  logger.info('[TestData] Clearing test data...');
  // Implementation for clearing test data if needed
} 