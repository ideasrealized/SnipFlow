---
description: 
globs: 
alwaysApply: false
---
New Chat Protocol  

**IMPORTANT: USE CORRECT DATE AND TIME STAMP. GET DATE FROM COMPUTER SYSTEM VIA THE COMMAND SHELL USING echo %DATE% %TIME%** *for AI Agents, it is cmd /c echo %DATE% %TIME%*

### **Phase One - Context Protocol Setup**  

1. Create a folder and checklist in `\docs\context\checklists[checklist][date].` It should look like this:
**Checklist: New Chat Protocol - 05/20/2025 19:47:47.65**

**Phase 1: Context Protocol Setup**

* [ ] 1.1. Locate and read the checklist template
* [ ] 1.2. Create a new checklist with current date
* [ ] 1.3. Read the most recent context document
* [ ] 1.4. Update checklist as priorities are identified

**Phase 2: Detailed System Analysis**

* [ ] 2.1. Read README.md for high-level understanding
* [ ] 2.2. Review docs/plans/ to understand current work
* [ ] 2.3. Identify and analyze core files
* [ ] 2.4. Examine database schema and data relationships
* [ ] 2.5. Check for API endpoints and entry points

**Phase 3: Problem Identification and Next Steps**

* [ ] 3.1. Review logs for errors and warnings
* [ ] 3.2. Check docs/bugs/ for reported issues
* [ ] 3.3. Summarize findings in structured overview
* [ ] 3.4. Develop context document with findings
* [ ] 3.5. Ensure old context documents are in .gitignore
* [ ] 3.6. Delete checklist when complete
* [ ] 3.7. Update README.md with new information
* [ ] 3.8. Provide summary of system understanding 
2. Locate and read the most recent context document in `\docs\context\[most_recent_context_doc]` to understand prior investigations, decisions, and discussions.  
3. Update your checklist as you move through your priorities.

### **Phase Two - Detailed System Analysis**  

1. Read the `README.md` file to gain a high-level understanding of the project’s purpose, architecture, and key components.  Check for **API endpoints**, and **Entry Points** if applicable, to determine how the system communicates with external services or clients.  
2. Read `\docs\plans\[plan_name]\wbs_checklist.md` to understand what we have been working on and where we are at in our plan.
3. Identify and analyze **core files** that define the system’s key operations, dependencies, and interactions with external systems.  
4. Using the Supabase CLI and command line/powershell, create a database schema dump docs\database\schema_dump.sql. Use the following command:

    `supabase db dump --linked -f docs/database/schema_dump.sql`

    a) If the folder does not exist, create it. The project is not linked, instruct the user to link it in powershell.

5. Examine the **database schema** and **data relationships** to understand how data is stored, retrieved, and manipulated. This includes reviewing database models, migration files, and any SQL queries used within the project.

### **Phase Three - Problem Identification and Next Steps**  

**IMPORTANT: USE CORRECT DATE AND TIME STAMP. GET DATE FROM COMPUTER SYSTEM VIA THE COMMAND SHELL USING `echo %DATE% %TIME%*`**

1. Review `\docs\console\logs\` for system errors, warnings, and anomalies that might indicate operational issues. 
   a) If the directory does not exist, create it.
   b) After the new chat protocol is finished, recommend to the user to implement logging.
2. Check `\docs\bugs\` to identify **reported bugs, unresolved issues, and past debugging efforts**.  
3. Summarize findings in a **structured overview** that includes:  
   - The **project’s structure and key components**  
   - Any **discrepancies or inconsistencies** found  
   - **Potential problem areas** and **known issues**  
   - Recommendations for **next steps**  
4. Develop a **context document** summarizing all findings. The document should be created in `\docs\context\[ai_context][date][hh:mm:ss]` **use system time via cmd echo %DATE% %TIME%** and must include:  
   - The date and time of the investigation  
   - A summary of key observations  
   - Any inconsistencies or issues detected  
   - Areas requiring further investigation
   - Entry points for the application
5. Ensure all old context documents are in .gitignore except the most recent five.
6. Add your entire, comprehensive summary to /.chats/ folder with a timestamp. Create the folder if not there.
7. Delete the new_chat_protol_checklist once complete.
8. Update the README.md if you have found anything new.
9. Provide a summary of your understanding of the software and entry points, and request the plan moving forward.
`
`
`
`
`
`
`
`
`
`
