# 🎨 IPR Portal — Frontend Application

This directory contains the single-page application (SPA) client for the IPR (Intellectual Property Rights) Portal.

Built with **React 19**, **Vite**, **React Router v7**, and **Vanilla CSS** with built-in Light/Dark mode theming.

For complete project documentation, system architecture, database schema, and deployment instructions, see the main [Root README](../README.md).

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in this directory:
```env
# Leave empty during local development to use Vite's automatic /api proxy to http://localhost:5000
VITE_API_URL=
```

For production deployment:
```env
VITE_API_URL=https://your-api.example.com
```

### 3. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The production bundle will be output to the `dist/` directory.

---

## 🧭 Key Features & Views

- **Dashboard (`/`)**: Comprehensive patent registry with Levenshtein-distance fuzzy search, multifaceted filtering, and one-click PDF export.
- **Analysis & Pivot Tables (`/analysis`)**: Server-side pivot tables and charts showing status breakdown by year and country, with PDF reporting.
- **Add / Edit Patent (`/add-patent`, `/edit-patent/:id`)**: Form supporting structured inventor entries with designations and department tags.
- **Patent Details (`/patent/:id`)**: Complete metadata view with inventor associations, official links, and Google Drive attachments.
- **Admin Panel (`/admin`)**: Administrative registry and management console for privileged accounts.
- **AI Database Assistant (ChatBot)**: Floating LangChain + Groq SQL agent interface to ask natural-language questions about patent data.
