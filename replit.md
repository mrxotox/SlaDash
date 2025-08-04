# Overview

This is a full-stack ticket management dashboard application built with React, Express, and TypeScript. The system provides comprehensive analytics and visualization for IT help desk tickets, including CSV upload functionality, real-time analytics calculation, and interactive data visualization through charts and tables. The application features a modern, responsive UI built with shadcn/ui components and focuses on providing key performance indicators (KPIs) like SLA compliance, resolution times, and technician performance metrics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Visualization**: Recharts library for interactive charts and graphs
- **File Handling**: React Dropzone for CSV file uploads with drag-and-drop interface

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **File Upload**: Multer middleware for handling multipart form data
- **Data Processing**: Custom CSV parser for ticket data transformation
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations
- **Development**: Hot module replacement via Vite integration in development mode

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Definition**: Type-safe schema definitions with Zod validation
- **Tables**: 
  - `tickets`: Core ticket data with comprehensive fields (status, priority, dates, technician assignments)
  - `ticket_analytics`: Pre-calculated analytics for dashboard performance
- **Migration Strategy**: Drizzle Kit for schema migrations and database management

## Data Processing Pipeline
- **CSV Upload**: Multi-step validation (file type, size limits, structure validation)
- **Data Transformation**: Parsing CSV data into structured ticket objects with type validation
- **Analytics Engine**: Real-time calculation of KPIs including SLA compliance, resolution times, and performance metrics
- **Bulk Operations**: Efficient batch processing for large ticket datasets

## Authentication & Authorization
- **Current State**: No authentication implemented (development/demo mode)
- **Architecture Ready**: User schema defined for future authentication integration
- **Session Management**: PostgreSQL session store configured for production use

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **express**: Web application framework for Node.js
- **multer**: File upload middleware for handling CSV files

## UI and Visualization
- **@radix-ui/***: Headless UI components for accessibility
- **recharts**: React charting library for data visualization
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography
- **react-dropzone**: File upload with drag-and-drop functionality

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tsx**: TypeScript execution for Node.js

## Data Processing
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities
- **csv-parser**: (Custom implementation) CSV file parsing functionality

## Production Considerations
- **connect-pg-simple**: PostgreSQL session store for production deployment
- **esbuild**: Fast JavaScript bundler for production builds
- The application uses environment variables for database configuration and supports both development and production deployment modes