# Social Networking Feature - Design Document

## 1. Overview

### 1.1 Purpose
This document outlines the technical design for implementing a professional social networking system within the LemoTick trading platform. The system enables traders to connect, share insights, and build a trading community through friend requests, profile management, and social interactions.

### 1.2 Scope
The design covers:
- User profile system with trading-specific information
- Friend request and friendship management
- Privacy and security controls
- Real-time notifications and updates
- Integration with existing messenger and notification systems
- RESTful API design
- Frontend component architecture
- Database schema and data models

### 1.3 Technology Stack
- **Frontend**: React 19, TypeScript, TailwindCSS, Radix UI, Zustand
- **Backend**: .NET Core (assumed based on existing patterns)
- **Database**: SQL Server (assumed)
- **Real-time**: SignalR (WebSocket)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Radix UI, Lucide React icons

### 1.4 Design Principles
- **Privacy First**: Default to private settings, explicit user consent
- **Performance**: Efficient queries, caching, pagination
- **Scalability**: Support for millions of users and connections
- **Security**: Authentication, authorization, rate limiting
- **User Experience**: Intuitive UI, real-time updates, responsive design

## 2. Architecture

### 2.1 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[Zustand Store]
        C[API Service]
        D[SignalR Client]
    end
    
    subgraph "API Gateway"
        E[Authentication Middleware]
        F[Rate Limiting]
        G[API Controllers]
    end
    
    subgraph "Business Logic Layer"
        H[Profile Service]
        I[Friendship Service]
        J[Privacy Service]
        K[Notification Service]
        L[Suggestion Engine]
    end
    
    subgraph "Data Layer"
        M[(SQL Database)]
        N[(Redis Cache)]
        O[(Blob Storage)]
    end
    
    subgraph "External Services"
        P[SignalR Hub]
        Q[Email Service]
        R[Image Processing]
    end
    
    A --> B
    B --> C
    A --> D
    C --> E
    D --> P
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    H --> N
    I --> N
    H --> O
    K --> P
    K --> Q
    H --> R
