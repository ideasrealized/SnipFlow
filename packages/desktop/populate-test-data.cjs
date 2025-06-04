// Script to populate test starter chains data
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Database path (same as in the app)
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Electron', '.snipflow', 'snippets.db');

console.log('Populating test starter chains...');
console.log('Database path:', dbPath);

try {
  console.log('Checking if database file exists...');
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file does not exist at:', dbPath);
    return;
  }
  console.log('✅ Database file exists, opening...');
  
  const db = new Database(dbPath);
  console.log('✅ Database opened successfully');
  
  // Check if we already have starter chains
  const existingStarters = db.prepare("SELECT COUNT(*) as count FROM chains WHERE isStarterChain = 1").get();
  console.log('Existing starter chains:', existingStarters.count);
  
  if (existingStarters.count > 0) {
    console.log('✅ Starter chains already exist, skipping population');
    db.close();
    return;
  }
  
  // Create test starter chains with proper options
  const insertChain = db.prepare(`
    INSERT INTO chains (name, description, options, isStarterChain, isPinned, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const starterChains = [
    {
      name: 'Customer Support Response',
      description: 'Quick customer support templates with dynamic fields',
      options: JSON.stringify([
        {
          id: 'cs-1',
          title: 'Thank You',
          body: 'Thank you for contacting us, [?:Customer Name]. We appreciate your business and will respond within 24 hours.'
        },
        {
          id: 'cs-2',
          title: 'Issue Resolved',
          body: 'Hi [?:Customer Name], we have resolved the issue regarding [?:Issue Description]. Please let us know if you need further assistance.'
        },
        {
          id: 'cs-3',
          title: 'Follow Up',
          body: 'Following up on your request from [?:Date]. We wanted to ensure everything is working properly for you.'
        }
      ]),
      isStarterChain: 1,
      isPinned: 0
    },
    {
      name: 'Email Templates',
      description: 'Professional email templates for common scenarios',
      options: JSON.stringify([
        {
          id: 'email-1',
          title: 'Meeting Request',
          body: 'Subject: Meeting Request - [?:Topic]\n\nHi [?:Recipient],\n\nI would like to schedule a meeting to discuss [?:Topic]. Are you available [?:Proposed Time]?\n\nBest regards,\n[?:Your Name]'
        },
        {
          id: 'email-2',
          title: 'Project Update',
          body: 'Subject: Project Update - [?:Project Name]\n\nTeam,\n\nHere is the latest update on [?:Project Name]:\n\n• Progress: [?:Progress Details]\n• Next steps: [?:Next Steps]\n• Timeline: [?:Timeline]\n\nPlease let me know if you have any questions.'
        },
        {
          id: 'email-3',
          title: 'Chain Link Example',
          body: 'This email includes a signature from another chain: [Chain:Email Signature]'
        }
      ]),
      isStarterChain: 1,
      isPinned: 0
    },
    {
      name: 'Code Comments',
      description: 'Standard code documentation and comment templates',
      options: JSON.stringify([
        {
          id: 'code-1',
          title: 'Function Header',
          body: '/**\n * [?:Function Description]\n * @param {[?:Param Type]} [?:Param Name] - [?:Param Description]\n * @returns {[?:Return Type]} [?:Return Description]\n */'
        },
        {
          id: 'code-2',
          title: 'TODO Comment',
          body: '// TODO: [?:Task Description] - [?:Your Initials] ([?:Date])'
        },
        {
          id: 'code-3',
          title: 'Debug Log',
          body: 'console.log(\'[?:Component] [?:Action]:\', [?:Variable]);'
        }
      ]),
      isStarterChain: 1,
      isPinned: 0
    },
    {
      name: 'Meeting Notes',
      description: 'Structured meeting note templates',
      options: JSON.stringify([
        {
          id: 'meeting-1',
          title: 'Meeting Agenda',
          body: '# Meeting: [?:Meeting Title]\n\n**Date:** [?:Date]\n**Attendees:** [?:Attendees]\n\n## Agenda\n1. [?:Agenda Item 1]\n2. [?:Agenda Item 2]\n3. [?:Agenda Item 3]\n\n## Action Items\n- [ ] [?:Action Item 1]\n- [ ] [?:Action Item 2]'
        },
        {
          id: 'meeting-2',
          title: 'Quick Notes',
          body: '## [?:Meeting Topic] - [?:Date]\n\n**Key Points:**\n• [?:Point 1]\n• [?:Point 2]\n\n**Decisions:**\n• [?:Decision 1]\n\n**Next Steps:**\n• [?:Next Step 1] (Owner: [?:Owner])'
        }
      ]),
      isStarterChain: 1,
      isPinned: 0
    },
    {
      name: 'Email Signature',
      description: 'Reusable email signature for chain linking',
      options: JSON.stringify([
        {
          id: 'sig-1',
          title: 'Professional Signature',
          body: '\n\nBest regards,\n[?:Your Name]\n[?:Your Title]\n[?:Company Name]\n[?:Email] | [?:Phone]'
        }
      ]),
      isStarterChain: 0,  // This is a helper chain, not a starter
      isPinned: 0
    }
  ];
  
  console.log('Creating starter chains with options...');
  for (const chain of starterChains) {
    const result = insertChain.run(
      chain.name, 
      chain.description, 
      chain.options, 
      chain.isStarterChain, 
      chain.isPinned
    );
    console.log(`✅ Created chain: ${chain.name} (ID: ${result.lastInsertRowid}, Starter: ${chain.isStarterChain === 1})`);
  }
  
  // Verify the data
  const newStarters = db.prepare("SELECT * FROM chains WHERE isStarterChain = 1").all();
  console.log(`✅ Successfully created ${newStarters.length} starter chains:`);
  newStarters.forEach(chain => {
    const options = JSON.parse(chain.options || '[]');
    console.log(`  - ${chain.name} (ID: ${chain.id}, ${options.length} options)`);
  });
  
  // Also show helper chains
  const helperChains = db.prepare("SELECT * FROM chains WHERE isStarterChain = 0").all();
  console.log(`✅ Also created ${helperChains.length} helper chains for linking:`);
  helperChains.forEach(chain => {
    console.log(`  - ${chain.name} (ID: ${chain.id})`);
  });
  
  db.close();
  console.log('✅ Enhanced test data population completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Test overlay positioning in the app');
  console.log('2. Trigger overlay to see starter chains');
  console.log('3. Test chain execution with placeholders');
  
} catch (error) {
  console.error('❌ Error populating test data:', error);
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
} 