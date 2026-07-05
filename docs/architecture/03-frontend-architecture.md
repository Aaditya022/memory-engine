# Frontend Architecture

```mermaid
graph TB
    subgraph Pages["Pages (Next.js 16 App Router)"]
        DASH["/ (Dashboard)<br/>KPI Cards, AI Chat,<br/>Knowledge Graph, Charts"]
        WEL["/welcome<br/>Marketing Landing Page"]
        LOGIN["/login<br/>Auth Page"]
        MEET["/meetings<br/>Meeting List"]
        MEETID["/meetings/[id]<br/>Meeting Detail"]
        MEETNEW["/meetings/new<br/>Create Meeting"]
        SEARCH["/search<br/>Full Semantic Search"]
        TIME["/timeline<br/>Memory Timeline"]
        DEC["/decisions<br/>Decision Log"]
        AI["/action-items<br/>Action Item Tracker"]
        TRANS["/transcripts<br/>Transcripts"]
        GOALS["/goals<br/>Projects"]
        AUDIT["/audit<br/>Audit Logs"]
        SETT["/settings<br/>Settings"]
    end

    subgraph Layout["Layout & Providers"]
        RL["Root Layout<br/>Geist Font, Theme Init"]
        DL["Dashboard Layout<br/>Auth Guard, Sidebar, Navbar"]
        AP["AuthProvider<br/>JWT Context"]
        TP["ThemeProvider<br/>Dark/Light Mode"]
    end

    subgraph Components["Component Library"]
        SHARED["Shared Components<br/>AIChat, KnowledgeGraph,<br/>StatCard, PageHeader"]
        UI["shadcn/ui Components<br/>Button, Card, Input, Badge,<br/>Tabs, Dialog, Sidebar"]
        LAYOUT["Layout Components<br/>Sidebar, Navbar, PageShell"]
    end

    subgraph API["API Layer"]
        AC["api-client.ts<br/>Axios Instance<br/>JWT Interceptor<br/>Auto-Refresh on 401"]
        API["api.ts<br/>Typed API Functions<br/>auth / meetings / transcripts<br/>memory / search / timeline"]
    end

    subgraph Data["Data Layer"]
        DEMO["demo-data.ts<br/>Fallback Mock Data<br/>8 Meetings, 12 Timeline Events<br/>KPI Stats, Sparklines"]
        TYPES["types/api.ts<br/>TypeScript Types<br/>Request / Response DTOs"]
    end

    subgraph External["External"]
        BACKEND["Spring Boot API<br/>localhost:8080"]
    end

    Pages --> Layout
    Pages --> Components
    Pages --> API
    Pages --> Data
    API --> AC
    AC -->|"HTTP"| BACKEND
```

**Diagram 3: Frontend Architecture** — Next.js 16 application with App Router. Pages are organized under route groups, wrapped by layout providers (auth guard, theme context). The shared component library includes AI chat, knowledge graph, and standard shadcn/ui components. The API layer manages authenticated HTTP communication via Axios with automatic JWT token refresh on 401 responses. Demo data provides offline fallback for development and testing. All TypeScript DTOs mirror the backend API contracts.
