# IPR Portal API

Base URL: `http://localhost:5000`

Protected patent APIs accept either the login cookie or this header:

```http
Authorization: Bearer <jwt_token>
```

## Data Scheme

The Excel data maps to the `Patent` model like this:

| Excel column | Prisma field | Notes |
| --- | --- | --- |
| Application No. | `applicationNo` | Unique patent application number |
| Published / Granted | `status` | `PUBLISHED` or `GRANTED` |
| Inventor/s Name | `inventorName` + `inventors[]` | Legacy text plus structured inventor records |
| Title of the Patent | `patentTitle` | Text |
| Applicant/s Name | `applicantName` | Text |
| Filed Date (DD/MM/YYYY) | `filedDate` | Date |
| Published/ Grant Date (DD/MM/YYYY) | `publicationDate` | Date |
| Publication/Grant Number | `publicationNo` | Unique publication or grant number |
| Institute Affiliation | `institueAffiliation` | Existing field name kept for compatibility |
| Drive Link | `driveLink` | Text URL |
| Year | `year` | Used for year-wise analysis |
| Utility/Design | `patentType` | `UTILITY` or `DESIGN` |
| Session | `patentSession` | Example: `2025-26` |
| Web link | `weblink` | Text URL |
| Country | `country` | Used for country-wise analysis |

Structured inventor records are stored separately:

| Field | Meaning |
| --- | --- |
| `inventors[].name` | Individual inventor name |
| `inventors[].designation` | `STUDENT`, `ASSISTANT_PROFESSOR`, `ASSOCIATE_PROFESSOR`, or `PROFESSOR` |
| `inventors[].departments` | One or more departments for that inventor |

## Auth

### Register

`POST /auth/register`

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## Patent CRUD

### Get All Patents

`GET /api/patents`

### Get Patent By ID

`GET /api/patents/:id`

### Add Patent

`POST /api/patents`

```json
{
  "applicationNo": "202641000001",
  "status": "PUBLISHED",
  "inventors": [
    {
      "name": "Inventor One",
      "designation": "ASSISTANT_PROFESSOR",
      "departments": ["CSE", "IT"]
    },
    {
      "name": "Inventor Two",
      "designation": "STUDENT",
      "departments": ["CSE"]
    }
  ],
  "patentTitle": "Patent Title",
  "applicantName": "Applicant Name",
  "filedDate": "2026-01-10",
  "publicationDate": "2026-03-15",
  "publicationNo": "PUB202600001",
  "institueAffiliation": "MAIT",
  "driveLink": "https://drive.google.com/example",
  "year": 2026,
  "patentType": "UTILITY",
  "patentSession": "2025-26",
  "weblink": "https://example.com/patent",
  "country": "IN"
}
```

### Update Patent

`PUT /api/patents/:id`

Send only the fields that changed.

### Delete Patent

`DELETE /api/patents/:id`

## Analysis API

### Pivot Summary

`GET /api/patents/analysis/summary`

Optional query filters:

```http
?applicantName=MAIT&year=2026&status=GRANTED&patentType=UTILITY&country=IN
```

The endpoint returns four pivot-style tables matching the spreadsheet screenshot:

```json
{
  "success": true,
  "data": {
    "totalPatents": 106,
    "tables": {
      "publishedGrantedByYear": {
        "title": "Published Granted Details",
        "columns": ["granted", "published", "grandTotal"],
        "rows": [
          { "year": 2022, "granted": 3, "published": 11, "grandTotal": 14 }
        ],
        "grandTotal": { "year": "Grand Total", "granted": 73, "published": 33, "grandTotal": 106 }
      },
      "utilityDesignByYear": {
        "title": "Utility / Design Details",
        "columns": ["design", "utility", "grandTotal"],
        "rows": [
          { "year": 2022, "design": 0, "utility": 14, "grandTotal": 14 }
        ]
      },
      "utilityStatusByYear": {
        "title": "Year Wise Utility Patent Details",
        "columns": ["granted", "published", "grandTotal"],
        "rows": [
          { "year": 2022, "granted": 3, "published": 11, "grandTotal": 14 }
        ]
      },
      "utilityStatusByCountry": {
        "title": "Country Wise Utility Patent Details",
        "columns": ["granted", "published", "grandTotal"],
        "rows": [
          { "country": "IN", "granted": 3, "published": 32, "grandTotal": 35 }
        ]
      }
    }
  }
}
```

## Setup Steps

1. Install backend packages from `Backend`: `npm install`.
2. Set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL` in `Backend/.env`.
3. Run database migration from `Backend`: `npx prisma migrate dev`.
4. Seed the Excel data if needed: `node seed.js`.
5. Start backend: `npm run dev`.
6. Login or register, then call `GET /api/patents/analysis/summary`.
