import { Saga } from '../sagaTypes';

export const saga1: Saga = {
  id: 'saga-001',
  title: 'Deploy Your First Blog',
  description:
    'Take a simple blog app from zero to fully deployed on the cloud — database, backend, frontend, and load balancer included.',
  totalSteps: 15,
  mascotMood: 'idle',
  steps: [
    {
      id: 1,
      title: 'Create Project Environment',
      type: 'instruction',
      description:
        'Set up your cloud workspace. Create a new project, configure your CLI, and prepare your environment for deployment.',
      gcpNote: 'On GCP: gcloud projects create my-blog-app && gcloud config set project my-blog-app',
    },
    {
      id: 2,
      title: 'Provision Virtual Network',
      type: 'ui-interaction',
      description:
        'Create a virtual private cloud network and define public and private subnets for your tiers.',
      gcpNote:
        'On GCP: Create a VPC with gcloud compute networks create — add subnets per region',
    },
    {
      id: 3,
      title: 'Provision Database Instance',
      type: 'terminal',
      description:
        'Launch a managed Postgres instance in your private subnet. Configure storage, backups, and version.',
      gcpNote:
        'On GCP: Cloud SQL — gcloud sql instances create blog-db --database-version=POSTGRES_15',
      challenge: {
        id: 3.5,
        title: 'Connection String Broken',
        description:
          'The migration runner can\'t connect to the database. Something in the connection config is wrong.',
        type: 'broken-config',
        brokenCode: 'DB_PASSWORD=P@ssw0rd!',
        solutionCode: 'DB_PASSWORD="P@ssw0rd!"',
        hints: [
          'Special characters in shell variables need quoting',
          'The ! character has special meaning in bash',
          'Try wrapping the value in double quotes',
        ],
        failureMessage:
          "The database still can't connect — check how the password is being interpreted by the shell",
        successMessage: 'Nice fix! Special characters in env vars must always be quoted',
      },
    },
    {
      id: 4,
      title: 'Run Database Migrations',
      type: 'terminal',
      description:
        'Execute the schema migration scripts to create your tables, indexes, and seed data.',
      gcpNote:
        'On GCP: Configure VPC firewall rules or use Cloud SQL Auth Proxy to avoid opening ports entirely',
      challenge: {
        id: 4.5,
        title: "Migrations Can't Reach the Database",
        description: 'The migration runner times out. A firewall rule is blocking the connection.',
        type: 'network-rule',
        brokenCode:
          '# Firewall rules — port 5432 not listed\nallow ingress tcp:80\nallow ingress tcp:443',
        solutionCode:
          'allow ingress tcp:80\nallow ingress tcp:443\nallow ingress tcp:5432 --source-ranges=10.0.0.0/8',
        hints: [
          'Postgres runs on port 5432 by default',
          'Check your firewall ingress rules',
          'Restrict source range to internal network only',
        ],
        failureMessage:
          "Migration runner still can't reach the DB — is the right port open?",
        successMessage: 'Port 5432 open. Migrations ran successfully!',
      },
    },
    {
      id: 5,
      title: 'Deploy Backend API Container',
      type: 'terminal',
      description:
        'Package your API into a container image and push it to the registry. Deploy to a managed container service.',
      gcpNote:
        'On GCP: Cloud Run — gcloud run deploy blog-api --image gcr.io/my-blog-app/api --platform managed',
    },
    {
      id: 6,
      title: 'Inject Environment Variables',
      type: 'terminal',
      description:
        'Pass the database connection config to your running container via environment variables.',
      gcpNote:
        'On GCP: Set env vars on Cloud Run with --set-env-vars or reference Secret Manager',
      challenge: {
        id: 6.5,
        title: 'App Crashes at Startup',
        description:
          'The container starts but immediately crashes. The app can\'t find its database configuration.',
        type: 'broken-config',
        brokenCode:
          '# .env config\nDB_HOST=10.0.0.5\nDB_PORT=5432\nDB_NAME=blog_db',
        solutionCode:
          '# .env config\nDATABASE_HOST=10.0.0.5\nDATABASE_PORT=5432\nDATABASE_NAME=blog_db',
        hints: [
          'Read the app startup error carefully',
          'The app is looking for a specific variable name',
          'Check what variable name the application code expects',
        ],
        failureMessage:
          "Still crashing — the app can't find its database configuration",
        successMessage: 'Variable names aligned. App boots cleanly!',
      },
    },
    {
      id: 7,
      title: 'Expose Backend Health Endpoint',
      type: 'ui-interaction',
      description:
        'Configure the backend service to expose port 8080 internally and set up a /health endpoint for the load balancer.',
      gcpNote:
        'On GCP: Cloud Run automatically exposes port 8080 — health checks configured in service YAML',
    },
    {
      id: 8,
      title: 'Set Up Managed Secrets',
      type: 'instruction',
      description:
        'Move your database password out of environment variables and into a managed secret store. Update your app to read from there.',
      gcpNote:
        'On GCP: gcloud secrets create db-password --data-file=./password.txt — then reference in Cloud Run with --set-secrets',
    },
    {
      id: 9,
      title: 'Verify Backend-Database Connection',
      type: 'terminal',
      description:
        'Hit the /health endpoint and confirm it returns 200. Debug any permission issues surfaced by the health check.',
      gcpNote:
        'On GCP: Manage DB users via Cloud SQL — principle of least privilege applies',
      challenge: {
        id: 9.5,
        title: 'Health Check Returns 500',
        description:
          'The /health endpoint is throwing an error. The app user is missing a database permission.',
        type: 'missing-permission',
        brokenCode:
          '-- DB permissions\nGRANT INSERT ON ALL TABLES IN SCHEMA public TO app_user;\nGRANT UPDATE ON ALL TABLES IN SCHEMA public TO app_user;',
        solutionCode:
          '-- DB permissions\nGRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;\nGRANT USAGE ON SCHEMA public TO app_user;',
        hints: [
          'The app can write but can\'t read',
          'Check what permissions app_user has on the schema',
          'SELECT is needed to read rows back after writing',
        ],
        failureMessage:
          'Still 500 — the app user is missing a key permission',
        successMessage: 'SELECT granted. /health returns 200!',
      },
    },
    {
      id: 10,
      title: 'Deploy Frontend Container',
      type: 'terminal',
      description:
        'Build the React frontend, push to the container registry, and deploy to a static hosting service.',
      gcpNote:
        'On GCP: Serve static frontend via Firebase Hosting (free tier) or Cloud Storage bucket + Cloud CDN',
    },
    {
      id: 11,
      title: 'Connect Frontend to Backend API',
      type: 'terminal',
      description:
        'Configure the frontend to call the backend API URL. Fix the browser error that appears when you test it.',
      gcpNote:
        'On GCP: CORS also configurable at Cloud Load Balancing layer for global policies',
      challenge: {
        id: 11.5,
        title: 'API Calls Fail in Browser',
        description:
          'The frontend loads but every API call fails. The browser console shows a CORS error.',
        type: 'broken-config',
        brokenCode:
          '// Express app.ts — no CORS configuration\nconst app = express();\napp.use(express.json());\n// routes below...',
        solutionCode:
          "// Express app.ts\nimport cors from 'cors';\nconst app = express();\napp.use(cors({ origin: process.env.FRONTEND_URL }));\napp.use(express.json());",
        hints: [
          'The browser is blocking the request — check the console error type',
          'This is a browser security feature, not a server error',
          "The backend needs to explicitly allow the frontend's origin",
        ],
        failureMessage:
          "Requests still blocked — the backend isn't sending the right headers",
        successMessage: 'CORS configured. Frontend talks to backend!',
      },
    },
    {
      id: 12,
      title: 'Set Up Load Balancer',
      type: 'ui-interaction',
      description:
        'Create a load balancer to route external traffic to your frontend and backend services. Configure health check intervals.',
      gcpNote:
        'On GCP: Cloud Load Balancing — HTTP(S) load balancer with backend services pointing to Cloud Run',
    },
    {
      id: 13,
      title: 'Configure Domain Routing Rules',
      type: 'ui-interaction',
      description:
        'Set path-based routing rules so /api/* goes to the backend and everything else goes to the frontend.',
      gcpNote:
        'On GCP: URL map rules in Cloud Load Balancing — order matters exactly as shown here',
      challenge: {
        id: 13.5,
        title: 'API Routes Return 404',
        description:
          'Navigating to /api/health returns 404. The routing rules have a precedence bug.',
        type: 'broken-config',
        brokenCode:
          '# Routing rules (top to bottom)\n/api/*     → backend-service\n/api/health → backend-service\n/          → frontend-service',
        solutionCode:
          '# Routing rules (top to bottom)\n/api/health → backend-service\n/api/*      → backend-service\n/           → frontend-service',
        hints: [
          'Routing rules are evaluated top to bottom',
          'A wildcard rule can swallow more specific rules below it',
          'More specific routes must come before wildcards',
        ],
        failureMessage:
          'Routes still mismatched — think about rule evaluation order',
        successMessage: 'Route order fixed. All endpoints reachable!',
      },
    },
    {
      id: 14,
      title: 'Enable Logging and Monitoring',
      type: 'instruction',
      description:
        'Set up structured logging for your services and configure basic uptime alerts. You should know before your users do when something breaks.',
      gcpNote:
        'On GCP: Cloud Logging and Cloud Monitoring are auto-integrated with Cloud Run — set up alerting policies in Cloud Monitoring console',
    },
    {
      id: 15,
      title: 'Final Smoke Test — Go Live',
      type: 'terminal',
      description:
        'Run end-to-end tests against the live deployment. Post a comment on your blog and verify it persists. Ship it.',
      gcpNote:
        'On GCP: Cloud SQL read replicas have replication lag — use primary endpoint for user-facing reads after writes, or use optimistic UI updates',
      challenge: {
        id: 15.5,
        title: 'Comments Disappear After Posting',
        description:
          'Users post comments and they vanish immediately, then reappear on refresh. A classic read-after-write consistency bug.',
        type: 'broken-config',
        brokenCode:
          "// Post comment then immediately fetch all comments\nawait api.post('/comments', newComment);\nconst comments = await api.get('/comments'); // reads from replica\nsetComments(comments.data);",
        solutionCode:
          "// Option A: read from primary after write\nawait api.post('/comments', newComment);\nconst comments = await api.get('/comments?consistency=strong');\nsetComments(comments.data);\n\n// Option B: optimistic update — don't wait for server\nsetComments(prev => [...prev, newComment]);\nawait api.post('/comments', newComment);",
        hints: [
          'The comment saves successfully — so why doesn\'t it show?',
          'Your database might have more than one node',
          'A write to the primary doesn\'t instantly appear on read replicas',
        ],
        failureMessage:
          'Still disappearing — think about where reads and writes are going',
        successMessage: 'Consistency solved. Blog is fully live! 🎉',
      },
    },
  ],
};
