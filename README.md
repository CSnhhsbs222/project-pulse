# Project Pulse

Project Pulse is a mobile-first project management app for planning projects, assigning work, tracking deadlines, and monitoring progress.

## Current Version

**v0.1.0 — Local prototype foundation**

This version is intentionally built as a simple browser-based prototype with local storage. It proves the core app flow before adding authentication, a database, real-time shared editing, and push notifications.

## Included in v0.1.0

- Mobile-first app shell
- Home screen with project cards
- Project detail screen
- Task detail screen
- Shared workspace screen
- Activity log screen
- Add, edit, and delete projects
- Add, edit, and delete tasks
- Assign tasks to users
- Add, complete, and delete subtasks
- Countdown calculations for project and task deadlines
- Task progress calculation from subtasks
- Project progress calculation from task averages
- Automatic status updates when progress reaches 100%
- Basic role behavior for admin, editor, and viewer
- Local browser persistence using `localStorage`

## Not Yet Included

These are planned for later versions:

- Real user accounts
- Real-time shared editing
- Database storage
- Email invitations
- Push notifications
- Offline sync strategy
- Production deployment

## Roadmap

### v0.2.0 — Project Workflow Refinement

- Improve add/edit project forms
- Add better empty states
- Add project sorting and filtering
- Add confirmation and error messaging

### v0.3.0 — Task Workflow Refinement

- Improve task creation speed
- Add task filters by status and assignee
- Add clearer due-date urgency indicators

### v0.4.0 — Subtasks and Progress

- Refine progress calculations
- Add manual progress controls for tasks without subtasks
- Add completion summaries

### v0.5.0 — Team and Permissions

- Improve user management
- Clarify admin/editor/viewer behavior
- Prepare for real authentication

### v0.6.0 — Backend Planning

- Choose Supabase or Firebase
- Define database schema
- Add environment setup documentation

### v0.7.0 — Real-Time Sync

- Replace local storage with backend data
- Add shared project updates
- Add live activity log updates

### v0.8.0 — Notifications

- Add notification groundwork
- Task assigned notifications
- Due-in-24-hours reminders
- Project deadline 7-day reminders

### v1.0.0 — First Stable Release

- Production-ready app structure
- Deployment instructions
- Final mobile polish
- Testing checklist

## How to Test Locally

Open `index.html` in a browser. The app stores data in the browser using local storage, so changes will persist on the same device/browser until local storage is cleared.

## File Structure

```text
project-pulse/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Development Notes

This project is being built incrementally. Each version should keep the app functional before moving to the next planned feature.
