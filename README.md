# Kash - Family Banking System

A digital piggy bank system for families to manage children's allowances, track transactions, and teach financial responsibility.

## Features

### User Story 1 (MVP) - Implemented
- **Parent Account Registration**: Create family with unique family code
- **Child Account Management**: Add, edit, view, and remove child accounts
- **Transaction Management**: Deposit/deduct money with pessimistic locking for data consistency
- **Transaction History**: View recent transactions for children

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: SQLite with WAL (Write-Ahead Logging) mode
- **ORM**: SQLAlchemy 2.0+
- **Authentication**: JWT tokens with bcrypt password hashing
- **Migrations**: Alembic

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: CSS with custom properties (design system from mockups)
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Web Server**: Nginx (for frontend in production)

## Architecture Decisions

### Pessimistic Locking
The system uses `BEGIN IMMEDIATE` transactions for all balance updates to prevent race conditions and ensure data consistency. This approach was chosen over optimistic locking to:
- Serialize concurrent writes to the same child's balance
- Prevent lost updates in high-concurrency scenarios
- Simplify error handling (no retry logic needed)

### SQLite with WAL Mode
SQLite was chosen for simplicity and ease of deployment, with WAL mode enabled for:
- Concurrent reads while writes are in progress
- Better performance for read-heavy workloads
- Atomic commits

## Project Structure

```
PiggyBank/
├── backend/
│   ├── src/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── services/        # Business logic layer
│   │   ├── api/v1/          # FastAPI endpoints
│   │   ├── auth/            # Authentication providers
│   │   └── config/          # Settings and database config
│   ├── alembic/             # Database migrations
│   ├── tests/               # Backend tests
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # React hooks (auth, etc.)
│   │   ├── styles/          # CSS (design system from mockups)
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── docker/                  # Docker configuration
└── specs/                   # Feature specifications and mockups

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker (optional)

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

### Docker Setup

Build and run with Docker Compose:
```bash
docker-compose -f docker/docker-compose.yml up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new family
- `POST /api/v1/auth/login/parent` - Parent login
- `POST /api/v1/auth/login/child` - Child login

### Children Management
- `POST /api/v1/children/` - Create child account
- `GET /api/v1/children/` - List all children in family
- `GET /api/v1/children/{id}` - Get child details
- `PATCH /api/v1/children/{id}` - Update child
- `DELETE /api/v1/children/{id}` - Delete child

### Transactions
- `POST /api/v1/transactions/` - Create transaction
- `GET /api/v1/transactions/child/{id}` - Get child's transactions
- `GET /api/v1/transactions/family` - Get all family transactions
- `GET /api/v1/transactions/my-transactions` - Get authenticated child's transactions

## Design System

The frontend uses the design system from the mockups located in `specs/001-family-banking-system/mockups/`:

### Parent Theme
- Primary Color: `#2563EB` (Blue 600)
- Style: Professional, minimal, clean
- Background: White with subtle shadows

### Child Theme
- Primary Color: `#8B5CF6` (Purple 500)
- Style: Colorful, engaging, playful
- Background: Warm yellow (`#FEFCE8`)

### Components
- Spacing: 4px base unit (--space-1 through --space-20)
- Typography: System fonts + Poppins for headings
- Border Radius: --radius-sm (0.25rem) through --radius-full (9999px)
- Shadows: --shadow-sm through --shadow-xl

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Environment Variables

**Backend (.env)**:
```
DATABASE_URL=sqlite:///./database/piggybank.db
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
```

**Frontend (.env)**:
```
VITE_API_BASE_URL=https://your-api-domain.com
```

### Production Deployment

1. Build Docker images:
```bash
docker build -f docker/backend.Dockerfile -t piggybank-backend .
docker build -f docker/frontend.Dockerfile -t piggybank-frontend .
```

2. Deploy to your hosting platform (Fly.io, AWS, etc.)

## License

Copyright © 2024 PiggyBank. All rights reserved.
