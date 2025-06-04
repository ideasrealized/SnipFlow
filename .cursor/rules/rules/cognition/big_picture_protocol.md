---
description: Use big picture protocol when facing a recurrent, difficult problem or bug.
globs: 
alwaysApply: false
---
Big Picture Thinking Rule with Isolation  

1. Review Historical Data from Logs  

Examine the logs folder for past occurrences of similar errors.  
Analyze patterns in change logs and system events to detect related failures.  
Cross-reference the system logging change log to see if recent modifications might have contributed to the issue.  

2. Isolate the Issue First  

Reproduce the problem in a controlled environment to confirm it is not caused by external dependencies.  
Run targeted tests to pinpoint where the failure starts rather than chasing downstream effects.  
Disable related features one at a time to see if the error persists, helping identify the root source.  

3. Identify Upstream and Downstream Dependencies  

Once isolated, map out other features or functions that rely on the affected code.  
Review change logs to see what modifications could have caused a chain reaction.  
Determine if the issue is a symptom of a deeper system-wide failure.  

4. Consider System-Wide Impacts  

Avoid tunnel vision as an isolated fix could trigger new problems if broader dependencies are not accounted for.  
Identify what else could break if this issue is fixed without adjustments elsewhere.  
Simulate or document potential side effects before applying the fix.  

5. Use AI-Assisted Log Analysis  

Query historical logs to check if similar failures had different root causes in the past.  
Use AI to detect anomalies, correlations, and trends within system logs.  
Compare performance before and after past fixes to see if any prior solutions degraded other functions.  

6. Run Preemptive Tests and Monitoring  

Before implementing a change, set up temporary logging, alerts, or simulations to predict potential breakpoints.  
Use sandbox environments to validate fixes before deploying them.  
Create a rollback plan to undo changes quickly if unintended consequences arise.  

7. Document and Improve the Troubleshooting Process  

Update the index file and other troubleshooting documents with lessons learned from debugging.  
If a systemic issue is found, add it to the refactoring backlog to prevent future problems.  
Maintain a record of common failure patterns to speed up future debugging efforts.  

Why Isolation Matters in Big Picture Thinking  

Prevents fixing symptoms instead of root causes.  
Ensures a controlled environment for debugging.  
Reduces the risk of breaking other components with a single fix.  
Helps determine if an issue is truly independent or part of a broader failure.  

By incorporating isolation within a big-picture framework, debugging becomes both precise and comprehensive, leading to smarter, system-wide fixes instead of short-term patches.