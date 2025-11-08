# Post-MVP Enhancement Features

## PR #1: Interactive Progress Dashboard with Hint/Frustration Visualization
**Priority:** Post-MVP (High - before #5)

**Overview:** Add a dashboard visualizing session progress, hint counts, retry attempts, and confidence metrics to provide feedback and motivation.

**Tasks:**
- [ ] Implement dashboard UI component (sidebar/modal)
- [ ] Integrate with context manager for tracking metrics
- [ ] Add charts for trends and badges for achievements
- [ ] Persist metrics in Firestore per user

**Acceptance Criteria:**
- Dashboard shows real-time hint/retry counts and confidence
- Visualizes progress across sessions
- Includes motivational elements like badges
- Integrates without disrupting main chat flow

**Files Created/Modified:**
```
frontend/src/components/ProgressDashboard.jsx
frontend/src/stores/progressStore.js  // New Zustand store
frontend/src/services/progressService.js  // Firestore integration
```

## PR #2: Customizable Dark Mode with Persistent User Settings
**Priority:** Post-MVP (High - before #5)

**Overview:** Add dark mode toggle and persistent settings (e.g., theme, notation size) stored in Firestore for a personalized experience.

**Tasks:**
- [ ] Implement dark mode using CSS variables and tokens
- [ ] Create settings UI for toggles and preferences
- [ ] Persist settings in Firestore user document
- [ ] Load settings on login and apply automatically

**Acceptance Criteria:**
- Dark mode toggles seamlessly and persists across sessions
- Supports multiple settings (theme, sizes, etc.)
- Improves accessibility and user comfort
- No performance impact on core features

**Files Created/Modified:**
```
frontend/src/components/SettingsModal.jsx
frontend/src/stores/settingsStore.js  // New Zustand store
frontend/src/services/userService.js  // Settings persistence
frontend/src/styles/tokens.js  // Add dark mode tokens
```

## PR #3: Expanded Tool Palette with AI-Suggested Tools
**Priority:** Post-MVP (High - before #5)

**Overview:** Enhance whiteboard tools with AI suggestions based on problem context, adding advanced options like ruler or auto-framing.

**Tasks:**
- [ ] Expand tool palette UI with new tools
- [ ] Parse AI responses for tool suggestions
- [ ] Implement suggestion highlights/tooltips
- [ ] Integrate with existing canvas store

**Acceptance Criteria:**
- Tools suggest based on context (e.g., geometry → shapes)
- New tools (ruler, highlighter) function smoothly
- Improves usability for math-specific tasks
- Suggestions are non-intrusive and helpful

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx  // Expand palette
frontend/src/utils/toolSuggester.js  // AI parsing logic
frontend/src/stores/canvasStore.js  // Add new tool support
```

## PR #4: Gamified Learning Streaks and Achievement System
**Priority:** Post-MVP (High - before #5)

**Overview:** Add streaks, achievements, and progress tracking to motivate users, with shareable badges and reminders.

**Tasks:**
- [ ] Implement streak tracking in Firestore
- [ ] Create achievements UI (progress bar, badges)
- [ ] Integrate with conversation completion
- [ ] Add sharing functionality for badges

**Acceptance Criteria:**
- Tracks daily streaks and achievements accurately
- Displays motivating UI elements
- Encourages regular use without overwhelming
- Persists across sessions reliably

**Files Created/Modified:**
```
frontend/src/components/Achievements.jsx
frontend/src/services/achievementService.js  // Firestore tracking
frontend/src/stores/achievementStore.js  // New Zustand store
```

## PR #5: Collaborative Mode with Real-Time Sharing
**Priority:** Post-MVP (Lowest - implement last, only after all others)

**Overview:** Enable real-time session sharing for multiple users, syncing chat and whiteboard.

**Tasks:**
- [ ] Implement shareable links via Firebase Dynamic Links
- [ ] Add real-time sync using Firestore listeners
- [ ] Create participant UI and role management
- [ ] Ensure secure access control

**Acceptance Criteria:**
- Users can join shared sessions in real-time
- Chat and whiteboard sync across participants
- Supports student/tutor roles
- Secure and stable without data loss

**Files Created/Modified:**
```
frontend/src/components/CollaborationControls.jsx
frontend/src/services/collaborationService.js  // Sync logic
frontend/src/stores/canvasStore.js  // Real-time updates
```
