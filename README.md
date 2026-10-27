SARRTHI

A Proactive Compliance and Payment-Monitoring Platform for MSME Suppliers to Government Transport Bodies

SARRTHI is an academic web application designed to help Micro, Small and Medium Enterprises (MSMEs) supplying goods to Indian Railways and other government transport bodies monitor invoice payments, estimate delayed-payment interest, assess buyer payment behaviour, and organise compliance evidence.

The platform helps vendors identify potential payment delays before they affect working capital and prepare documentation for possible dispute escalation.

«Disclaimer: Academic Project — Not an Official Government Portal. SARRTHI does not provide legal advice or replace the official MSME Online Dispute Resolution (ODR) Portal.»

📌 Problem Statement

MSME suppliers often face delayed payments from government buyers. These delays can create working-capital shortages, affect business operations, and make it difficult for vendors to manage financial obligations.

Existing dispute-resolution mechanisms primarily help after a payment default has occurred. Vendors also need a way to monitor payment deadlines, understand buyer payment behaviour, and organise supporting documents in advance.

SARRTHI aims to address these challenges through proactive invoice monitoring and compliance management.

🎯 Project Objectives

- Track invoices against a configurable payment-monitoring window, set to 45 days by default.
- Estimate interest on delayed payments and display the assumptions used.
- Record partial and full payments and track outstanding balances.
- Manage tenders, purchase orders, deliveries, and acceptance dates.
- Assess buyer payment delays and generate rule-based pre-bid risk scores.
- Maintain compliance checklists and document records.
- Estimate working-capital gaps caused by delayed payments.
- Generate reports and export invoice and payment information to CSV.
- Provide a responsive dashboard with alerts and financial summaries.

✨ Key Features

1. Invoice and Payment Monitoring

- Monitor upcoming and overdue invoices.
- Track days remaining in the payment window.
- Record partial and full payments.
- View outstanding balances and payment statuses.
- Estimate delayed-payment interest.

2. Tender and Purchase Order Management

- Track tenders and saved opportunities.
- Manage purchase orders and related delivery information.
- Record delivery and acceptance dates.
- Keep procurement information organised in one workspace.

3. Compliance Intelligence

- Maintain compliance checklists.
- View buyer overdue invoices and average payment delays.
- Calculate a rule-based pre-bid risk score.
- Display an MSME procurement quota indicator.

4. Dashboard and Reports

- View key financial indicators and invoice statuses.
- Monitor upcoming deadlines and overdue payments.
- Review buyer payment behaviour.
- Estimate working-capital requirements.
- Export supported reports to CSV and use print-friendly reporting.

5. Document and Evidence Management

- Maintain document metadata and categories.
- Organise compliance-related records.
- Support evidence preparation for potential dispute escalation.

Note: Full document-file storage and some evidence-management workflows are not yet implemented.

6. Demo Mode

- Run the application using sample data.
- Demonstrate core workflows without requiring a separate backend server.
- Explore the interface using a browser-based data store.

🛠️ Technology Stack

Component| Technologies
Frontend| React 19, TypeScript
Build Tool| Vite
Styling| Tailwind CSS
UI Components| Radix UI, shadcn/ui
Routing| TanStack Router
Data Fetching| TanStack Query
Charts| Recharts
Backend| Motoko
Platform| Internet Computer
Authentication| Internet Identity
Package Manager| pnpm
Testing| Vitest, Testing Library, PocketIC
Code Quality| Biome

Backend implementation note: The delivered application uses Motoko on the Internet Computer. Java 17 and Spring Boot were specified as the intended backend architecture, but the Java service is not yet implemented in the delivered repository.

🏗️ System Architecture

SARRTHI uses a modular frontend and backend architecture.

- Frontend: Provides the dashboard, invoice management, tenders, compliance tools, and reports.
- Data-source layer: Supports browser-based demo data and a REST client prepared for future backend integration.
- Backend: Provides domain logic and endpoints for business profiles, tenders, purchase orders, invoices, payments, compliance, documents, and reports.
- Data isolation: Backend queries are scoped to the signed-in user's identity.

🚀 Getting Started

Prerequisites

- Git
- Node.js
- pnpm
- A compatible Motoko/Internet Computer development environment if you intend to run the backend

Installation

1. Clone the repository:
   
   git clone <YOUR_REPOSITORY_URL>

2. Navigate to the project directory:
   
   cd <YOUR_PROJECT_DIRECTORY>

3. Install the project dependencies using pnpm, following the repository's workspace configuration.

4. Start the frontend using the development script defined in the project's "package.json".

Important: Confirm the actual repository structure and available scripts before running the application. The exact development-start command and backend setup are not specified in this report.

🧪 Testing and Build

The project report documents the following commands:

Check TypeScript types:

pnpm --dir app typecheck

Build the frontend:

pnpm --dir app build

Run linting and formatting:

pnpm --dir app fix

Run the test suite:

pnpm test

The project includes automated frontend tests and a backend testing workflow using PocketIC.

⚠️ Current Limitations

The following limitations are documented in the project report:

- The implemented interest calculator uses simple interest; statutory compound-interest calculation remains incomplete.
- Some backend date calculations require correction.
- The Java and Spring Boot backend is planned but not yet implemented.
- Email and WhatsApp reminders are not fully implemented.
- OCR-based invoice capture and direct integrations with IREPS and GeM are outside the current implementation.
- Some compliance, evidence-management, and escalation workflows are only partially implemented.
- PDF and Excel report generation is not fully implemented.

🔮 Future Scope

- Implement the Java 17 and Spring Boot backend.
- Complete statutory compound-interest calculations and validate date-handling logic.
- Add automated email and WhatsApp payment reminders.
- Implement secure document uploads and evidence downloads.
- Integrate with procurement and accounting systems where supported APIs are available.
- Add OCR-based invoice data extraction.
- Improve ODR evidence preparation and escalation workflows.
- Introduce additional analytics and reporting capabilities.

👥 Project Team

Developed by students of the Department of Artificial Intelligence & Data Science, Arya College of Engineering & IT, Jaipur.

- Kanishka Tanwar — 24EARCS069
- Om Prakash Sharma — 24EARCS106
- Megha Jangir — 24EARCS094
- Karan Sahu — 24EARCS070

Project Mentor: Er. Ram Babu Buri, Assistant Professor

Institution: Arya College of Engineering & IT, Jaipur

University: Rajasthan Technical University, Kota

Academic Session: 2026–27

📄 Legal and Usage Notice

SARRTHI is an academic project developed for educational and demonstration purposes. It is not affiliated with or endorsed by any government department. Interest figures are estimates based on implemented assumptions and should not be treated as guaranteed recoveries or legal advice.

⭐ Conclusion

SARRTHI aims to empower MSME suppliers with better visibility into invoice deadlines, payment delays, buyer risk, and compliance documentation. By focusing on early monitoring and preparation, the platform seeks to help businesses manage cash flow more effectively and become better prepared for potential payment disputes.
