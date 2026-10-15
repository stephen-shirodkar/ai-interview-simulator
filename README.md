AI Interview Simulator

An AI-powered interview preparation platform designed to simulate realistic technical and recruiter interviews. Practice answering questions, solve coding problems, explore your projects in depth, and receive structured feedback to improve your interview performance.

The platform combines AI-driven interviews, voice interactions, coding challenges, and personalized reports to create an interactive interview preparation experience.

Features

🎯 AI-Powered Interviews

* Adaptive Interview Difficulty: Adjust interview difficulty based on performance.
* Project Deep-Dive Mode: Practice explaining projects, architectural decisions, technologies, and implementation details.
* Multi-Round Interviews: Simulate interviews across multiple rounds.
* Recruiter Simulation: Practice behavioral and recruiter-style interviews.
* Bluff Detection: Explore mechanisms for identifying inconsistencies between claimed skills and demonstrated knowledge.

🎙️ Voice Interview Mode

* Conduct interviews using voice interactions.
* Integrate speech recognition for processing spoken responses.
* Support realistic AI-generated interviewer voices.

💻 Coding Interviews

* Practice coding interview questions.
* Use a dedicated coding interview workspace.
* Explore competitive programming question integration.

📊 Interview Reports

* Generate structured interview performance reports.
* Review strengths and weaknesses.
* Track previous interview sessions.
* Identify areas for improvement.

🧠 Personalized Learning

* Explore skill relationships through a knowledge graph.
* Retrieve relevant information from uploaded resumes using retrieval-augmented generation (RAG).
* Support personalized interview questions based on candidate experience and skills.

👤 User Experience

* Authentication and user account management.
* Recruiter selection page.
* User profile and settings.
* Interview history and performance tracking.

Tech Stack

Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Clerk Authentication

Backend

* Node.js
* Express.js
* TypeScript
* REST APIs

Database and Retrieval

* MongoDB
* ChromaDB
* Retrieval-Augmented Generation (RAG)

AI and Voice

* Ollama
* Llama 3
* ElevenLabs
* Whisper

Development Tools

* Git
* GitHub
* npm

Some features and integrations may still be under development. The technologies listed above represent the intended or current project stack; implementation status may vary.

Architecture

The application follows a frontend-backend architecture.

AI Interview Simulator
│
├── frontend/
│   ├── Next.js application
│   ├── React components
│   ├── Authentication
│   └── User interface
│
├── backend/
│   ├── Express.js API
│   ├── Authentication middleware
│   ├── Routes and services
│   ├── MongoDB integration
│   ├── AI integrations
│   └── Vector database integration
│
└── README.md

The frontend communicates with the backend through HTTP APIs. The backend manages application logic, database operations, and integrations with AI and retrieval services.

Prerequisites

Install the following before running the application:

* Node.js and npm
* MongoDB
* Ollama
* Git

Additional services, such as ChromaDB and voice API providers, may be required depending on which features you want to run.

Getting Started

1. Clone the Repository

git clone https://github.com/stephen-shirodkar/ai-interview-simulator.git
cd ai-interview-simulator

2. Select the Development Branch

The rebuilt implementation is being developed on a separate branch.

git checkout rebuild/new-tech-stack

3. Configure the Backend

Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Create your local environment file using the example:

cp .env.example .env

Configure the required environment variables in backend/.env.

Typical settings include:

PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ai_interview_db
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=llama3
CHROMADB_HOST=http://127.0.0.1:8000

Add any other variables required by your implementation, including authentication and voice service credentials.

Do not commit your .env file or expose API keys.

4. Start the Backend

Ensure MongoDB and any required AI services are running.

From the backend/ directory, run:

npm run dev

The backend should start on port 5001, provided that the port is available and the application is configured correctly.

5. Configure the Frontend

Open a second terminal and navigate to the project root:

cd frontend

Install dependencies:

npm install

Create the local environment file:

cp .env.example .env.local

Configure your Clerk credentials and backend URL in frontend/.env.local.

For local development, the backend URL may be:

NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

Use the environment variable names expected by your actual frontend configuration.

6. Start the Frontend

From the frontend/ directory, run:

npm run dev

Open the local address displayed by Next.js in your terminal. The default development address is:

http://localhost:3000

Environment Variables

The application uses environment variables to configure local services and third-party integrations.

Variable	Purpose
PORT	Backend server port
MONGODB_URI	MongoDB connection string
OLLAMA_HOST	Ollama server address
OLLAMA_MODEL	Local language model to use
CHROMADB_HOST	ChromaDB server address
NEXT_PUBLIC_BACKEND_URL	Backend API base URL
CLERK_SECRET_KEY	Server-side Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY	Public Clerk authentication configuration
ELEVENLABS_API_KEY	Voice generation, if implemented
OPENAI_API_KEY	OpenAI integration, if implemented

Only configure variables used by your actual code. Variable names may differ depending on the integration and SDK configuration.

Never expose secret keys through frontend environment variables or commit real credentials to Git.

AI and Retrieval-Augmented Generation

The project is designed to use large language models and retrieval-augmented generation to provide context-aware interview experiences.

A typical RAG workflow is:

1. Process candidate-provided documents, such as resumes.
2. Split the content into smaller chunks.
3. Generate vector embeddings using the configured embedding model.
4. Store and retrieve relevant information from a vector database.
5. Supply relevant context to the language model.
6. Generate interview questions or responses based on the retrieved context.

This approach can help the simulator ask questions related to a candidate’s actual skills, experience, and projects.

The exact embedding model, document-processing pipeline, and retrieval strategy depend on the implementation.

Development Roadmap

Potential areas for continued development include:

* Complete authentication and user onboarding.
* Implement adaptive interview question generation.
* Integrate resume parsing and RAG.
* Complete voice-based interview interactions.
* Develop the coding interview workspace.
* Implement interview evaluation and reporting.
* Add interview history and performance analytics.
* Develop the skill knowledge graph.
* Improve error handling, testing, and API validation.

Update this checklist as features are implemented.

Project Structure

ai-interview-simulator/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── middleware.ts
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── .gitignore
├── package.json
└── README.md

The structure above provides a high-level overview. Actual folders and files may change as development progresses.

Contributing

This project is being developed iteratively. To contribute:

1. Create a feature branch.
2. Make your changes.
3. Test the affected functionality.
4. Commit your changes with a descriptive message.
5. Push your branch and open a pull request.

Example:

git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push -u origin feature/your-feature

Security

* Keep API keys and secrets in local environment files.
* Never commit .env or .env.local files.
* Use .env.example files to document required configuration without real credentials.
* Validate and sanitize incoming API requests.
* Protect authenticated endpoints with appropriate middleware.
* Avoid logging sensitive user information.

License

No license has been specified yet. Unless a license is added to the repository, the project should not be assumed to be available for unrestricted reuse or redistribution.

⸻

Built as a learning project focused on AI, full-stack development, interview preparation, and retrieval-augmented generation.
