# Overview

This is a full-stack ticket management dashboard application built with React, Express, and TypeScript. The system provides comprehensive analytics and visualization for IT help desk tickets, including CSV upload functionality, real-time analytics calculation, and interactive data visualization through charts and tables. The application features a modern, responsive UI built with shadcn/ui components and focuses on providing key performance indicators (KPIs) like SLA compliance, resolution times, and technician performance metrics.

## Recent Changes (Updated: August 4, 2025)
- ✅ Successfully implemented complete CSV upload with drag & drop interface
- ✅ Fixed file upload validation to accept CSV files properly
- ✅ Resolved runtime errors with null safety checks in analytics calculations
- ✅ Dashboard now processes 355 clean tickets from real CSV data after HTML sanitization
- ✅ All KPI cards, charts, and tables displaying live data correctly
- ✅ Export functionality working for SLA reports
- ✅ Search and pagination working in recent tickets table
- ✅ Filter controls operational for date range, category, technician, and priority
- ✅ **MAJOR FIX**: Implemented comprehensive HTML content cleaning for contaminated CSV data
- ✅ **DATA QUALITY**: Added technician name normalization to prevent duplicates (e.g., "Gelson Munoz" variations)
- ✅ **UX IMPROVEMENT**: Reorganized dashboard layout with better grid distribution (xl:col-span-2/3)
- ✅ **ACCURACY**: Fixed SLA calculation based on EXACT Excel parameters from user's document:
  - Crítica/Urgente (P1): 4-8 horas with 30min response time
  - Alta (P2): 8-12 horas with 30min response time
  - Media (P3): 1-3 días hábiles (72h) with 30min response time  
  - Baja (P4): 3-5 días hábiles (120h) with 30min response time
  - Different SLA for Incidents vs Services vs Requirements as per Excel matrix
- ✅ **UI POLISH**: Changed misleading "from last month" text to "trending" in KPI cards
- ✅ **CHARTS REDESIGN**: Replaced unprofessional pie charts with modern card-based visualizations
- ✅ **PROFESSIONAL ANALYTICS**: Created card-based status, category, and priority charts with proper color coding
- ✅ **TECHNICIAN METRICS**: Redesigned technician performance with detailed SLA compliance and workload metrics
- ✅ **SLA DASHBOARD**: Added professional circular gauge for SLA compliance with priority-level breakdown
- ✅ **KPI ENHANCEMENT**: Added progress bars, better color coding, and gradient backgrounds to KPI cards

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