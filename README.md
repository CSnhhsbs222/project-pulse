# Project Pulse

Project Pulse is a mobile-first project management app prototype for planning projects, assigning tasks, tracking countdowns, and monitoring progress.

## Version

Current version: `v0.1`

This is the first functional prototype. It intentionally uses browser `localStorage` instead of a backend so the core workflow can be tested quickly before adding authentication, real-time syncing, push notifications, and production permissions.

## Included in v0.1

- Mobile-first app shell
- Project list/home screen
- Add, edit, and delete projects
- Project detail screen
- Add, edit, and delete tasks
- Task detail screen
- Assign tasks to users
- Due date and deadline countdowns
- Progress bars
- Subtask checklist
- Automatic task progress from subtasks
- Automatic completed status when progress reaches 100%
- Shared workspace prototype
- User roles: admin, editor, viewer
- Basic role-based editing behavior
- Activity log
- Local browser persistence

## Not yet included

These features are part of the MVP goal but require a backend or app platform integration:

- Real-time shared editing
- Actual user accounts/login
- True email invitations
- Server-enforced permissions
- Push notifications
- Cloud database persistence

## Suggested next step

Build `v0.2` by connecting the app to a backend service such as Supabase or Firebase. Recommended next priorities:

1. Choose backend platform.
2. Add authentication.
3. Replace localStorage with database tables for users, projects, tasks, subtasks, and activity.
4. Add real-time syncing.
5. Add notification groundwork.

## How to run

Because this version is plain HTML, CSS, and JavaScript, it can be opened directly in a browser.

Open `index.html` locally, or publish the repo with GitHub Pages for easy mobile testing.
