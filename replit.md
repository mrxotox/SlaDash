# Overview

This is a full-stack ticket management dashboard application built with React, Express, and TypeScript. The system provides comprehensive analytics and visualization for IT help desk tickets, including CSV upload functionality, real-time analytics calculation, and interactive data visualization through charts and tables. The application features a modern, responsive UI built with shadcn/ui components and focuses on providing key performance indicators (KPIs) like SLA compliance, resolution times, and technician performance metrics.

## Recent Changes (Updated: August 6, 2025)
- ✅ **ADVANCED ANALYTICS IMPLEMENTED**: Temporal trends, weekly productivity charts, resolution time analysis
- ✅ **ADVANCED FILTERS WORKING**: Multi-filter support with text search across all ticket fields
- ✅ **HEAT MAP VISUALIZATIONS**: Hour/day activity patterns and ticket aging analysis  
- ✅ **DATE PARSING FIXES**: Robust error handling for invalid dates in trends and heat map components
- ✅ **FILTER BUG RESOLVED**: Advanced filters now apply immediately without clearing other selections
- ✅ **DEBOUNCE OPTIMIZATION**: Smart debouncing for search vs immediate filter application
- ✅ **SERVER FILTERING CONFIRMED**: Backend correctly processes technician filters (1397→361 tickets)
- ✅ **DYNAMIC DATE RANGE FILTER**: Added date range picker (from-to) in dashboard without changing structure
- ✅ **REAL-TIME FILTERING**: All dashboard sections update automatically when date range is applied
- ✅ **STATUS COLUMN INTEGRATION**: Estado de Tickets now uses `status` column from Excel (all statuses visible)

### Key Architectural Updates
- ✅ **SLA CALCULATION FIXED**: Now uses `isOverdue` column directly from Excel (true=non-compliance, false=compliance)
- ✅ **PRIORITY DISTRIBUTION**: Changed to use `urgency` field instead of `priority` column as requested
- ✅ **ALL TICKETS VIEW**: Replaced "Recent Tickets" section with comprehensive "All Tickets" table (1453 tickets)
- ✅ **DEPARTMENT ANALYTICS**: Top departments now use `Department` column from Excel data
- ✅ **BACKEND OPTIMIZATION**: Updated analytics calculations to process real Excel fields accurately
- ✅ **UI IMPROVEMENTS**: New AllTickets component with search, pagination, and detailed ticket information
- ✅ **DATA INTEGRITY**: All metrics now use authentic data directly from ServiceDesk Excel exports
- ✅ **TECHNICIAN METRICS**: Updated to show on-time vs overdue tickets based on `isOverdue` column

### Previous Major Achievements
- ✅ Successfully implemented complete CSV upload with drag & drop interface
- ✅ Fixed file upload validation to accept CSV files properly
- ✅ Resolved runtime errors with null safety checks in analytics calculations
- ✅ Dashboard now processes 1453 clean tickets from real Excel data after HTML sanitization
- ✅ All KPI cards, charts, and tables displaying live data correctly
- ✅ Export functionality working for SLA reports
- ✅ Search and pagination working in recent tickets table
- ✅ Filter controls operational for date range, category, technician, and priority
- ✅ **MAJOR FIX**: Implemented comprehensive HTML content cleaning for contaminated CSV data
- ✅ **DATA QUALITY**: Added technician name normalization to prevent duplicates (e.g., "Gelson Munoz" variations)
- ✅ **UX IMPROVEMENT**: Reorganized dashboard layout with better grid distribution (xl:col-span-2/3)
- ✅ **CHARTS REDESIGN**: Replaced unprofessional pie charts with modern card-based visualizations
- ✅ **PROFESSIONAL ANALYTICS**: Created card-based status, category, and priority charts with proper color coding
- ✅ **TECHNICIAN METRICS**: Redesigned technician performance with detailed SLA compliance and workload metrics
- ✅ **SLA DASHBOARD**: Added professional circular gauge for SLA compliance with priority-level breakdown
- ✅ **KPI ENHANCEMENT**: Added progress bars, better color coding, and gradient backgrounds to KPI cards
- ✅ **EXCEL SUPPORT**: Switched from CSV to Excel (.xlsx/.xls) as primary data source
- ✅ **SMART PARSING**: Intelligent column mapping with auto-detection of headers in multiple languages
- ✅ **DATA CLEANING**: Advanced Excel data sanitization including HTML removal and date parsing
- ✅ **BACKWARD COMPATIBILITY**: Still supports CSV uploads for legacy data
- ✅ **REAL DATA PROCESSING**: Successfully processing 1453 real tickets from user's Excel file
- ✅ **ROBUST PARSING**: Handles complex Excel structures with 73 columns and various data types
- ✅ **MIGRATION TO REPLIT**: Successfully migrated from Replit Agent to standard Replit environment
- ✅ **SECURITY FIXES**: Added comprehensive null safety checks to prevent undefined property access errors
- ✅ **ERROR HANDLING**: Fixed TechnicianChart and SLATable components with proper data validation
- ✅ **RUNTIME STABILITY**: Eliminated `.toFixed()` errors on undefined values with defensive programming

# User Preferences

Preferred communication style: Simple, everyday language.

# Project Context

## Business Problem
This dashboard eliminates the dependency on Excel files for IT help desk analytics. Previously, IT leaders had to:
- Manually export data from ServiceDesk to Excel files
- Use complex Excel formulas for SLA calculations and KPI metrics
- Create manual reports for technician performance analysis

## Solution
A web-based dashboard that:
- Automatically processes ServiceDesk exports (Excel/CSV files)
- Calculates real-time SLA compliance metrics
- Provides interactive visualizations for ticket categories, priorities, and technician performance
- Enables data-driven decision making for IT leadership

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