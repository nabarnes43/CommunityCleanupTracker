https://leaflet-extras.github.io/leaflet-providers/preview/
# Community Cleanup Tracker

## Hosting

A web application for tracking and managing community cleanup efforts. This project allows users to mark locations on a map, report issues like illegal dumping or standing water, and coordinate cleanup activities.

### Deployment

You can manually view all your Firebase Hosting deployments in the Firebase Console under Hosting > Deployment history.

#### Local Testing

To test the build process locally before pushing:
```bash
npm run build
npx firebase serve --only hosting
```
This builds your project and serves it locally so you can verify it works before triggering the GitHub Actions.

#### Production Deployment

If you want to deploy to production:
```bash
npm run build
npx firebase deploy --only hosting
```

This workflow gives you a complete testing pipeline - you can test changes in isolation via PRs before they go live, similar to how you might test deployments with Cloud Run.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

- **Automated Testing**: All PRs are automatically tested
- **Preview Deployments**: Feature branches get preview deployments
- **Production Deployment**: Main branch changes are automatically deployed to production

### GitHub Actions Workflow

The workflow is configured in `.github/workflows/` and handles:
- Building and testing the application
- Deploying to Firebase Hosting
- Notifying team members of deployment status

## Project Structure

- **client/**: React frontend with TypeScript
- **server/**: Node.js backend with Express
- **Firebase**: Used for authentication and data storage

## Features

- Interactive map for marking problem areas
- Different pin types for various environmental issues
- Image and video upload capabilities
- User management system
- Mobile-responsive design

## Development Setup

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+) or yarn (v1.22+)
- Firebase account and Firebase CLI (v11+)
- Google Maps API key for map functionality

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/nabarnes43/CommunityCleanupTracker.git
   cd CommunityCleanupTracker
   ```

2. Install dependencies
   ```bash
   # Install dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

3. Set up environment variables
   - Create `.env` files in both root and client directories
   - Add necessary Firebase configuration

4. Start development servers
   ```bash
   # Start backend server
   cd server
   npm start
   
   # In another terminal, start frontend
   cd client
   npm start
   ```

## Git Workflow for Solo Development

### Rebase vs. Merge in Solo Projects

When working alone on a project with feature branches, both rebase and merge can be used to integrate changes. Here's the difference:

#### Merge Workflow

```bash
git checkout main
git merge feature-branch
```

- Creates a merge commit that joins the histories
- Preserves the complete history of the branch
- Easier to understand when the feature was integrated
- Results in a non-linear history with branch structures

#### Rebase Workflow

```bash
git checkout feature-branch
git rebase main
git checkout main
git merge feature-branch  # This will be a fast-forward merge
```

- Replays your feature branch commits on top of main
- Creates a linear, cleaner history
- Makes it appear as if you wrote the feature in a straight line
- Easier to follow the project history chronologically

#### When Your Branch Is "Already Up To Date"

If Git says your branch is "already up to date" when trying to rebase, it means:
- Your feature branch is already based on the latest commit of main
- No new commits have been added to main since you created your branch
- You can simply merge your feature branch into main (it will be a fast-forward merge)

#### Recommendation for Solo Projects

For solo projects where feature branches are direct continuations of main:
- Either approach works well
- Rebase provides a cleaner, more linear history
- Merge is simpler and preserves the branch structure
- Choose based on your preference for history visualization

Remember: The technical end result is the same - your code changes will be integrated into main either way.

## License

[MIT License](LICENSE)

## Contact

Nasir Barnes - [GitHub](https://github.com/nabarnes43) 