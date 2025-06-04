---
description: 
globs: 
alwaysApply: false
---
When this protocol is tagged, you are to:

**STEP 1** Create the following directories:*

    a) `\docs\plans\plan_name\`
    b) `\docs\plans\plan_name\research\`
    c) `\docs\plans\plan_name\backups\`

**STEP 2** Research the topic, create a plan for implementation, and develop a work breakdown structure checklist (WBS).* 

   a) you are to research both the codebase (i.e. grep, listdir), the README.md and the web through this process.
   b) you are to research the sql schema for the existing database via the dump file. Make sure it is up to date first.
   c) you document this place in `\docs\plans\plan_name\plan.md`. If the folder does not exist, create it.

**STEP 3** Then, you are to go to line by line on the WBS, research each individual task, its dependencies, associated files in the codecase, and create a mini plan for that task.*

   a) for each line, you are to refer to the README, SQL Database Dump and relevant files to ensure you are in alignment with the existing codebase and technology. You build these steps into your WBS checklist steps so you never forget.
   b) each time you return with your research, you create a reference file in the plan folder under `\docs\plans\plan_name\research\[files]` and make a reference to the file in the **wbs_checklist.md** as a subitem to the checklist item.
   c) For both research files and subitems, always include a separate sub-sub-item that includes your intent and necessary contextual information.
   d) these research documents can include the code you plan to implement as well as the contextual references like information and web links, etc.
   e) You are to assume that after you perform your research on a specific task and document it, you will forget everything you researched, so your notes should be superfluous, providing every bit of context you can give yourself or a future developer about your thoughts and reasoning for that step.

**PHASE 4** You are up to update the WBS checklist item with notes for yourself about exactly how you will implement it, including the location of the research file to reference in your WBS checklist notes.*

   a) The bullet points under each wbs checklist item should look like **research**, **findings**,**actions**
   b) You are to add instructions to each step to backup files before changing them in `\docs\plans\plan_name\backups`. Then, after completion and review of the wbs_checklist, you will delete this folder, so that should be the last item on the checklist under 'Clean up'.

**PHASE 5** You are to add everything you need to rememeber and consider for that checklist item as a subitem, before moving on to the next checklist item and then doing the same. This is a meticulous planning process to ensure the proper steps are taken by AI agents like yourself.*

   a) The last item you are to create in each checklist subitem is to update the checklist before moving to the next step. Like this, 'a. refer to this research document. b. complete the checklist item. c. update the checklist with notes before moving on.

**CONSTRAINTS:**

1) You NEVER remove/delete steps or summarize them in a WBS.
2) Leave comprehensive notes in your checklist. Assume you will forget everything and will need your wbs checklist and notes to succeed.
3) Always update your WBS along the way, ensuring you leave completion notes under the checklist item when you mark it complete. This way a developer can return back and know what happened.
4) If you update a major part of the application, append the README.md in the root directory with the new information.