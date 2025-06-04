---
description: AI Agent session management protocol for daily coding workflows with goal tracking, progress analysis, and productivity metrics
globs: 
alwaysApply: false
agentProtocol: true
---

# AI Agent: Session Management Protocol

**Purpose:** Comprehensive daily development session management with goal tracking, progress analysis, mood integration, and productivity metrics for AI-assisted coding workflows.

## 🚀 **SESSION START WORKFLOW**

### **User Command Triggers**
```
START SESSION
START SESSION [goals]
BEGIN SESSION [time-constraint] [focus-area]
INIT SESSION [mood] [priorities]
```

### **Session Initialization Process**

#### **1. Session Metadata Collection**
```bash
# Auto-generate session metadata
SESSION_ID="sess-$(date '+%Y%m%d-%H%M%S')"
SESSION_DATE=$(date '+%Y-%m-%d')
SESSION_START_TIME=$(date '+%H:%M:%S')
SESSION_TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
```

#### **2. User Input Processing**
**Required Information:**
- Session goals and priorities
- Available time/constraints
- Current focus area

**Optional Context:**
- Mood/energy level (1-10 scale)
- Specific challenges expected
- Continuation from previous session
- External factors (deadlines, meetings, etc.)

#### **3. Session Context Setup**
```bash
# Create session log entry
mkdir -p logs/sessions
SESSION_LOG="logs/sessions/${SESSION_DATE}_${SESSION_ID}.md"

# Initialize session file
cat > $SESSION_LOG << EOF
# Session: $SESSION_DATE ($SESSION_ID)

## Session Metadata
- **Start Time:** $SESSION_START_TIME
- **Session ID:** $SESSION_ID
- **Estimated Duration:** [USER_INPUT]
- **Mood/Energy:** [USER_INPUT]/10
- **Focus Area:** [USER_INPUT]

## Session Goals
[USER_GOALS_LIST]

## Progress Tracking
- [ ] Goal 1: [DESCRIPTION]
- [ ] Goal 2: [DESCRIPTION]
- [ ] Goal 3: [DESCRIPTION]

## Session Notes
*Real-time notes will be added here during the session*

## Accomplishments
*Will be populated at session end*
EOF
```

#### **4. Environment Preparation**
```bash
# Initialize git session tracking
source "New Protocl Ideas/git/ai_git_workflow_daily.md"
ai_daily_git_session

# Check project status
git status --porcelain
npm test 2>/dev/null || echo "Tests not configured"

# Log session start
echo "$SESSION_TIMESTAMP - SESSION_START - ID: $SESSION_ID - Goals: [USER_GOALS]" >> logs/session_activity.log
```

### **AI Agent Response**
```
SESSION_INITIALIZED: $SESSION_ID
STATUS: Ready for development
GOALS_TRACKED: [NUMBER] goals identified
ENVIRONMENT: [REPO_STATUS]
ESTIMATED_DURATION: [USER_INPUT]
FOCUS_AREA: [USER_INPUT]
```

---

## 🎯 **ACTIVE SESSION MANAGEMENT**

### **Real-Time Progress Tracking**
```bash
# Update session progress (called automatically during development)
update_session_progress() {
    local achievement="$1"
    local timestamp=$(date '+%H:%M:%S')
    
    echo "- [$timestamp] $achievement" >> $SESSION_LOG
    echo "$SESSION_TIMESTAMP - PROGRESS - $achievement" >> logs/session_activity.log
}
```

### **Goal Status Updates**
```bash
# Mark goal as completed
complete_goal() {
    local goal_number="$1"
    local completion_note="$2"
    
    sed -i "s/- \[ \] Goal $goal_number:/- [x] Goal $goal_number:/" $SESSION_LOG
    update_session_progress "✅ Completed Goal $goal_number: $completion_note"
}
```

### **Mood/Energy Tracking**
```bash
# Update mood during session (optional)
update_mood() {
    local new_mood="$1"
    local reason="$2"
    local timestamp=$(date '+%H:%M:%S')
    
    echo "- [$timestamp] Mood Update: $new_mood/10 - $reason" >> $SESSION_LOG
}
```

---

## 🏁 **SESSION END WORKFLOW**

### **User Command Triggers**
```
END SESSION
FINISH SESSION
COMPLETE SESSION [summary]
WRAP SESSION [notes]
```

### **Session Analysis Process**

#### **1. Automatic Progress Analysis**
```bash
# Analyze session accomplishments
analyze_session() {
    local session_duration=$(calculate_duration $SESSION_START_TIME $(date '+%H:%M:%S'))
    local goals_completed=$(grep -c "\[x\]" $SESSION_LOG)
    local total_goals=$(grep -c "\[ \]" $SESSION_LOG)
    local commits_made=$(git log --since="$SESSION_TIMESTAMP" --oneline | wc -l)
    local files_changed=$(git diff --name-only HEAD~$commits_made 2>/dev/null | wc -l)
    
    echo "## Session Analysis" >> $SESSION_LOG
    echo "- **Duration:** $session_duration" >> $SESSION_LOG
    echo "- **Goals Completed:** $goals_completed/$total_goals" >> $SESSION_LOG
    echo "- **Commits Made:** $commits_made" >> $SESSION_LOG
    echo "- **Files Modified:** $files_changed" >> $SESSION_LOG
}
```

#### **2. Accomplishment Summary Generation**
```bash
# Generate accomplishment summary
generate_accomplishments() {
    echo "## Accomplishments" >> $SESSION_LOG
    
    # Extract completed goals
    grep "\[x\]" $SESSION_LOG | sed 's/- \[x\]/- ✅/' >> $SESSION_LOG
    
    # Add git commit summary
    if [ $commits_made -gt 0 ]; then
        echo "- 📝 Made $commits_made commits with $files_changed files modified" >> $SESSION_LOG
        git log --since="$SESSION_TIMESTAMP" --oneline | sed 's/^/  - /' >> $SESSION_LOG
    fi
    
    # Add progress notes
    grep "PROGRESS" logs/session_activity.log | tail -10 | sed 's/.*PROGRESS - /- /' >> $SESSION_LOG
}
```

#### **3. Session Metrics Calculation**
```bash
# Calculate productivity metrics
calculate_metrics() {
    local productivity_score=$((($goals_completed * 100) / $total_goals))
    local commit_frequency=$(echo "scale=2; $commits_made / ($session_duration / 60)" | bc)
    
    echo "## Session Metrics" >> $SESSION_LOG
    echo "- **Productivity Score:** $productivity_score%" >> $SESSION_LOG
    echo "- **Commit Frequency:** $commit_frequency commits/hour" >> $SESSION_LOG
    echo "- **Goal Completion Rate:** $goals_completed/$total_goals" >> $SESSION_LOG
}
```

#### **4. Update Master Session Log**
```bash
# Update SESSION_LOGS.md (master log)
update_master_log() {
    if [ ! -f "SESSION_LOGS.md" ]; then
        echo "# Development Session Logs" > SESSION_LOGS.md
        echo "" >> SESSION_LOGS.md
    fi
    
    echo "## $SESSION_DATE ($SESSION_ID)" >> SESSION_LOGS.md
    echo "" >> SESSION_LOGS.md
    
    # Extract key accomplishments
    grep "✅" $SESSION_LOG | head -5 >> SESSION_LOGS.md
    echo "- 📊 Productivity: $productivity_score% | Goals: $goals_completed/$total_goals | Commits: $commits_made" >> SESSION_LOGS.md
    echo "- ⏱️ Duration: $session_duration | Focus: [FOCUS_AREA]" >> SESSION_LOGS.md
    echo "" >> SESSION_LOGS.md
}
```

#### **5. Git Session Completion**
```bash
# Complete git session
source "New Protocl Ideas/git/ai_git_workflow_daily.md"
ai_end_git_session
```

### **AI Agent Response**
```
SESSION_COMPLETE: $SESSION_ID
DURATION: $session_duration
PRODUCTIVITY_SCORE: $productivity_score%
GOALS_COMPLETED: $goals_completed/$total_goals
COMMITS_MADE: $commits_made
FILES_MODIFIED: $files_changed
NEXT_SESSION_RECOMMENDATIONS: [BASED_ON_INCOMPLETE_GOALS]
```

---

## 📊 **ADVANCED FEATURES**

### **Session Analytics Dashboard**
```bash
# Generate session analytics
generate_session_analytics() {
    echo "# Session Analytics Dashboard" > logs/session_analytics.md
    echo "Generated: $(date)" >> logs/session_analytics.md
    echo "" >> logs/session_analytics.md
    
    # Weekly productivity trends
    echo "## Weekly Productivity" >> logs/session_analytics.md
    grep "PRODUCTIVITY_SCORE" logs/session_activity.log | tail -7 >> logs/session_analytics.md
    
    # Goal completion patterns
    echo "## Goal Completion Patterns" >> logs/session_analytics.md
    grep "GOALS_COMPLETED" logs/session_activity.log | tail -10 >> logs/session_analytics.md
    
    # Most productive times
    echo "## Most Productive Times" >> logs/session_analytics.md
    grep "SESSION_START" logs/session_activity.log | cut -d' ' -f2 | sort | uniq -c | sort -nr >> logs/session_analytics.md
}
```

### **Smart Goal Recommendations**
```bash
# Suggest goals based on previous sessions
suggest_goals() {
    local incomplete_goals=$(grep "\[ \]" logs/sessions/*.md | tail -5)
    local recent_focus=$(grep "Focus:" logs/sessions/*.md | tail -3)
    
    echo "## Suggested Goals for Next Session" > logs/suggested_goals.md
    echo "$incomplete_goals" | sed 's/.*\[ \]/- [ ]/' >> logs/suggested_goals.md
    echo "" >> logs/suggested_goals.md
    echo "## Recent Focus Areas" >> logs/suggested_goals.md
    echo "$recent_focus" >> logs/suggested_goals.md
}
```

### **Mood & Productivity Correlation**
```bash
# Analyze mood vs productivity correlation
analyze_mood_productivity() {
    echo "## Mood vs Productivity Analysis" > logs/mood_analysis.md
    
    # Extract mood and productivity data
    for session in logs/sessions/*.md; do
        local mood=$(grep "Mood/Energy:" "$session" | grep -o "[0-9]/10")
        local productivity=$(grep "Productivity Score:" "$session" | grep -o "[0-9]*%")
        echo "$mood,$productivity" >> logs/mood_data.csv
    done
    
    # Generate insights
    echo "High productivity sessions (>80%) mood average:" >> logs/mood_analysis.md
    grep "8[0-9]%\|9[0-9]%\|100%" logs/mood_data.csv | cut -d',' -f1 | awk '{sum+=$1; count++} END {print sum/count "/10"}' >> logs/mood_analysis.md
}
```

---

## 🔄 **INTEGRATION COMMANDS**

### **Session Management Functions**
```bash
# Complete session management workflow
ai_start_session() {
    local goals="$1"
    local duration="$2"
    local mood="$3"
    local focus="$4"
    
    echo "Starting AI Development Session..."
    
    # Initialize session
    SESSION_ID="sess-$(date '+%Y%m%d-%H%M%S')"
    SESSION_DATE=$(date '+%Y-%m-%d')
    SESSION_START_TIME=$(date '+%H:%M:%S')
    
    # Create session log
    create_session_log "$goals" "$duration" "$mood" "$focus"
    
    # Initialize git session
    ai_daily_git_session
    
    echo "SESSION_INITIALIZED: $SESSION_ID"
}

ai_end_session() {
    local user_summary="$1"
    
    echo "Ending AI Development Session..."
    
    # Analyze session
    analyze_session
    generate_accomplishments
    calculate_metrics
    update_master_log
    
    # Complete git session
    ai_end_git_session
    
    # Generate recommendations
    suggest_goals
    
    echo "SESSION_COMPLETE: $SESSION_ID"
}
```

### **Quick Session Commands**
```bash
# Quick session status
ai_session_status() {
    if [ -n "$SESSION_ID" ]; then
        local current_duration=$(calculate_duration $SESSION_START_TIME $(date '+%H:%M:%S'))
        local goals_completed=$(grep -c "\[x\]" $SESSION_LOG)
        local total_goals=$(grep -c "\[ \]" $SESSION_LOG)
        
        echo "ACTIVE_SESSION: $SESSION_ID"
        echo "DURATION: $current_duration"
        echo "PROGRESS: $goals_completed/$total_goals goals completed"
    else
        echo "NO_ACTIVE_SESSION"
    fi
}

# Quick goal completion
ai_complete_goal() {
    local goal_number="$1"
    local note="$2"
    
    complete_goal "$goal_number" "$note"
    echo "GOAL_COMPLETED: Goal $goal_number - $note"
}
```

---

## 📝 **FILE STRUCTURE**

### **Session Files Organization**
```
logs/
├── sessions/                    # Individual session logs
│   ├── 2024-01-26_sess-20240126-143022.md
│   ├── 2024-01-26_sess-20240126-200015.md
│   └── ...
├── session_activity.log         # All session activity
├── session_analytics.md         # Analytics dashboard
├── mood_analysis.md            # Mood vs productivity analysis
├── suggested_goals.md          # AI-generated goal suggestions
└── mood_data.csv              # Raw mood/productivity data

SESSION_LOGS.md                 # Master session summary log
```

### **Session Log Template**
```markdown
# Session: 2024-01-26 (sess-20240126-143022)

## Session Metadata
- **Start Time:** 14:30:22
- **Session ID:** sess-20240126-143022
- **Estimated Duration:** 3 hours
- **Mood/Energy:** 8/10
- **Focus Area:** User authentication system

## Session Goals
- [ ] Goal 1: Implement OAuth2 integration
- [ ] Goal 2: Add user session management
- [ ] Goal 3: Write comprehensive tests

## Progress Tracking
- [14:35] Started OAuth2 research
- [14:45] ✅ Completed Goal 1: OAuth2 integration implemented
- [15:20] Added session middleware
- [15:45] Mood Update: 9/10 - Making great progress!

## Session Analysis
- **Duration:** 2h 15m
- **Goals Completed:** 2/3
- **Commits Made:** 5
- **Files Modified:** 8

## Accomplishments
- ✅ Goal 1: Implement OAuth2 integration
- ✅ Goal 2: Add user session management
- 📝 Made 5 commits with 8 files modified
  - feat: add OAuth2 Google integration
  - feat: implement session middleware
  - test: add OAuth2 test suite
  - docs: update authentication documentation
  - fix: resolve session timeout issue

## Session Metrics
- **Productivity Score:** 67%
- **Commit Frequency:** 2.22 commits/hour
- **Goal Completion Rate:** 2/3
```

---

## 🎯 **AGENT RESPONSES**

### **Session States**
- `SESSION_INITIALIZED`: New session started successfully
- `SESSION_ACTIVE`: Session currently in progress
- `SESSION_PAUSED`: Session temporarily paused
- `SESSION_COMPLETE`: Session ended with summary generated
- `NO_ACTIVE_SESSION`: No session currently running

### **Progress Indicators**
- `GOAL_COMPLETED`: Specific goal marked as complete
- `PROGRESS_UPDATE`: Real-time progress logged
- `MOOD_UPDATED`: Mood/energy level changed
- `MILESTONE_REACHED`: Significant progress milestone

### **Analytics Responses**
- `PRODUCTIVITY_HIGH`: >80% goal completion rate
- `PRODUCTIVITY_MEDIUM`: 50-80% goal completion rate
- `PRODUCTIVITY_LOW`: <50% goal completion rate
- `ANALYTICS_GENERATED`: Session analytics updated

---

**Remember:** This protocol integrates seamlessly with the AI Git protocols and Restriction Protocol, providing comprehensive session management for AI-assisted development workflows. 