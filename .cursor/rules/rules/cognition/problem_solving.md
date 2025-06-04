---
description: 
globs: 
alwaysApply: false
---
---
description: This document establishes universal rules for AI-driven problem-solving, ensuring structured reasoning, verification processes, and accurate decision-making.
globs: 
alwaysApply: false
---
# Problem-Solving Rules for AI Agents

## **Purpose**
This document establishes universal rules for AI-driven problem-solving, ensuring structured reasoning, verification processes, and accurate decision-making.

---

## **1. General Problem-Solving Workflow**
1. **Confirm Understanding Before Acting**
   - Always clarify the **intent and meaning of instructions** before taking action.
   - Ask clarifying questions when faced with ambiguity.
   - Avoid making assumptions unless backed by verified data.

2. **Use Structured Reasoning Models**
   - Select an appropriate reasoning model based on the problem type.
   - Apply question-based filters to ensure completeness.

3. **Perform Root-Cause Analysis**
   - Identify the **real cause** of a problem instead of treating symptoms.
   - Trace dependencies to detect **second-order and third-order effects**.

4. **Verify Solutions Independently**
   - Always **validate results** using multiple methods (logs, outputs, screenshots, or test cases).
   - Log all actions taken for **self-audit and human review**.
   - Ensure system behavior aligns with **expected results before finalizing changes**.

---

## **2. Reasoning Models & Their Application**

### **2.1 Deductive Reasoning (Top-Down Logic)**
- **Best for:** Ensuring correctness, following structured logic, validating assumptions.
- **Process:**
  1. Identify general principles or rules.
  2. Apply those rules to the specific problem.
  3. Validate conclusions against expected outcomes.
- **Question Filter:**
  - What general rule applies here?
  - Are my premises true?
  - Does my conclusion logically follow?

### **2.2 Inductive Reasoning (Bottom-Up Logic)**
- **Best for:** Detecting patterns, predicting behaviors, handling uncertainty.
- **Process:**
  1. Gather specific observations or past data.
  2. Identify common patterns or trends.
  3. Formulate a general principle based on evidence.
- **Question Filter:**
  - What similar cases exist?
  - What patterns emerge?
  - Is my conclusion based on sufficient data?

### **2.3 Abductive Reasoning (Best Hypothesis Approach)**
- **Best for:** Diagnosing failures, troubleshooting unexpected results.
- **Process:**
  1. Observe an unexpected outcome.
  2. Generate hypotheses for possible causes.
  3. Test the most likely hypotheses first.
- **Question Filter:**
  - What’s the most likely explanation?
  - Have I considered all relevant factors?
  - Can I test this hypothesis efficiently?

### **2.4 Counterfactual Thinking (What-If Analysis)**
- **Best for:** Evaluating alternative decisions, predicting failures before they occur.
- **Process:**
  1. Consider what would happen if a specific change were made.
  2. Compare alternative actions to identify risks and benefits.
  3. Select the option with the least risk and most efficiency.
- **Question Filter:**
  - What would happen if I did X instead?
  - Could this create unintended consequences?
  - What are the second-order and third-order effects?

---

## **3. Root-Cause Analysis (RCA)**
### **3.1 Five Whys Method**
- **Process:** Ask “Why?” five times to drill down to the root cause.
- **Example:**
  1. Why did the application crash? → Memory error.
  2. Why did memory run out? → Unhandled process consuming excess resources.
  3. Why was the process unhandled? → No resource limit enforcement.
  4. Why was no limit enforced? → System monitoring didn’t flag it.
  5. Why didn’t monitoring flag it? → Missing alerts for specific resource usage thresholds.
- **Resolution:** Implement monitoring and alerting mechanisms.

### **3.2 Fishbone Diagram (Ishikawa Analysis)**
- **Best for:** Identifying multiple contributing factors to an issue.
- **Categories:**
  - **Machine (Infrastructure/Hardware):** Are system resources constrained?
  - **Method (Process/Logic):** Is there a flaw in how the process is designed?
  - **Material (Dependencies/Code):** Are external libraries or configurations causing issues?
  - **Man (Human Error/AI Error):** Was there a mistake in setup or execution?

---

## **4. Verification & Self-Validation Methods**

### **4.1 Self-Verification Before Completion**
- Never assume success without verifying **actual results**.
- Use AI-assisted monitoring tools or human-readable logs.
- Cross-check **expected vs. actual behavior**.

### **4.2 Logging for Accountability**
- Maintain **copious logs** with timestamps, actions taken, and outputs.
- Store logs in a structured format for easy review.
- Keep logs **until manual confirmation** is received.

### **4.3 Visual Verification for UI/GUI Systems**
- Take **screenshots** of user interfaces if applicable.
- Use **OCR (Optical Character Recognition) or Image Processing** to read GUI state.
- Ensure that the **visual state matches expected behavior**.

### **4.4 Automated & Manual Testing**
- Run **automated test suites** before finalizing changes.
- Perform **manual validation** for complex interactions.
- Use **AI-driven anomaly detection** to detect unintended consequences.

---

## **5. Final Problem-Solving Guidelines for AI Agents**
- **Confirm intent before proceeding**—never assume instructions are complete.
- **Choose the correct reasoning model** based on the problem type.
- **Perform root-cause analysis** instead of treating symptoms.
- **Verify correctness independently** using logs, screenshots, or test cases.
- **Keep structured records of all actions taken** to ensure transparency.

By following these universal problem-solving rules, AI agents ensure that their reasoning is structured, their solutions are accurate, and their actions remain fully verifiable.

