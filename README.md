# DentaFlow - Dental Clinic Management System

A comprehensive, full-stack dental clinic management system built for **Sunrise Dental** clinic. Streamlines patient management, appointment scheduling, billing, and reporting with role-based access control for Administrators, Receptionists, and Dentists.

---

## 📽️ Video Demonstration & Walkthrough

Watch the complete system walkthrough and core workflow demonstrations in action:

[![Watch DentaFlow System Demo](https://img.youtube.com/vi/-vDXzBuTnQg/maxresdefault.jpg)](https://youtu.be/-vDXzBuTnQg)

> 🔗 **Watch on YouTube:** [DentaFlow - Full System Walkthrough & Feature Demo](https://youtu.be/-vDXzBuTnQg)

---

## Features

- **Patient Management** - Full patient profiles with medical history, insurance details, emergency contacts, barcode generation, and printable patient cards
- **Appointment Scheduling** - Schedule, reschedule, and track appointments with status management (Scheduled, Completed, Cancelled, No-Show)
- **Dentist Management** - Track SLMC registration, qualifications, specializations, fees, availability, and attendance
- **Billing & Payments** - Generate bills, process partial/full payments, track balances, and export PDF invoices via JasperReports
- **Treatment Catalog** - Manage treatments with codes, categories, fees, and estimated durations
- **Reports & Analytics** - Daily reports, revenue reports, dentist performance metrics, and interactive charts
- **Role-Based Access Control** - Three roles (Admin, Receptionist, Dentist) with granular permission management
- **Audit Logging** - Track all user actions with IP addresses and timestamps
- **Email Notifications** - Automated email alerts and notifications
- **PDF Generation** - Professional bill reports using JasperReports and iText

---

## Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 3.2.5 |
| Spring Security + JWT | - |
| PostgreSQL | 16 |
| Flyway (Migrations) | - |
| JasperReports / iText | 6.21.2 / 8.0.3 |
| Docker | Multi-stage build |

### Frontend
| Technology | Version |
|---|---|
| Next.js | 16.3 (App Router) |
| React | 19 |
| TypeScript | 5.7.3 |
| Tailwind CSS | 4.3.3 |
| Recharts | 3.8.0 |
| shadcn/ui | - |
| Axios | 1.19.0 |

---

## Role-Based Access

| Role | Access |
|---|---|
| **Admin** | Full access to all modules |
| **Receptionist** | Appointments, Patients, Dentists, Treatments, Billing |
| **Dentist** | Appointments, Help |

---

## Project Structure

```
-dental-management-system/
├── backend/                          # Spring Boot API
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── src/main/java/com/dentaflow/
│       ├── auth/                     # Authentication & JWT
│       ├── patient/                  # Patient CRUD
│       ├── dentist/                  # Dentist management
│       ├── appointment/              # Appointment scheduling
│       ├── treatment/                # Treatment catalog
│       ├── billing/                  # Billing & payments
│       ├── attendance/               # Dentist attendance
│       ├── audit/                    # Audit logging
│       ├── report/                   # Reports & PDF generation
│       └── notification/             # Email notifications
│
├── frontend/                         # Next.js App
│   ├── components/                   # Reusable UI components
│   ├── services/                     # API service layer
│   ├── types/                        # TypeScript definitions
│   ├── contexts/                     # Auth context
│   ├── middleware.ts                 # JWT auth & RBAC
│   └── app/                          # Pages (App Router)
│       ├── page.tsx                  # Dashboard
│       ├── appointments/
│       ├── patients/
│       ├── dentists/
│       ├── treatments/
│       ├── billing/
│       ├── reports/
│       ├── users/
│       └── audit/
```

---

## Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL 16
- Docker & Docker Compose (optional)

### Backend Setup

```bash
cd backend

# Using Docker Compose (recommended)
docker-compose up -d

# Or run locally
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend runs on `http://localhost:3000` and connects to the backend API at `http://localhost:8080`.

### Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Receptionist | receptionist | receptionist123 |
| Dentist | dentist | dentist123 |

---

## API Documentation

Swagger UI available at: `http://localhost:8080/swagger-ui.html`

---

## Screenshots

### Admin Section

#### Dashboard Overview

![Admin Dashboard 1](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-48.png?updatedAt=1788438666667)

![Admin Dashboard 2](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-30.png?updatedAt=1788438666661)

![Admin Dashboard 3](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-16.png?updatedAt=1788438666619)

![Admin Dashboard 4](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-27.png?updatedAt=1788438666607)

![Admin Dashboard 5](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-12.png?updatedAt=1788438666474)

![Admin Dashboard 6](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-25.png?updatedAt=1788438666463)

![Admin Dashboard 7](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-54-04.png?updatedAt=1788438666497)

#### Patient & Appointment Management

![Admin Patient Management 1](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-53-06.png?updatedAt=1788438666225)

![Admin Patient Management 2](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-53-50.png?updatedAt=1788438666133)

![Admin Patient Management 3](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-53-43.png?updatedAt=1788438666118)

![Admin Appointment Scheduling](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-35-41.png?updatedAt=1788438666065)

![Admin Appointments View](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-53-25.png?updatedAt=1788438666113)

![Admin Appointment Detail](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-53-11.png?updatedAt=1788438666027)

![Admin Appointment Management](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2017-53-32.png?updatedAt=1788438666038)

#### Dentist & Treatment Management

![Admin Dentist Management](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-36-51.png?updatedAt=1788438666025)

![Admin Dentist Profile](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-34-32.png?updatedAt=1788438665980)

![Admin Treatment Management](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-36-16.png?updatedAt=1788438665999)

![Admin Treatment View](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-36-13.png?updatedAt=1788438665986)

#### Billing & Reports

![Admin Billing 1](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-35-57.png?updatedAt=1788438665897)

![Admin Billing 2](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-23-18.png?updatedAt=1788438665864)

![Admin Reports](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-34-49.png?updatedAt=1788438665849)

![Admin Analytics](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-34-15.png?updatedAt=1788438665783)

![Admin Audit Log](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Admin-%20Section%20Images/Screenshot%20from%202026-09-03%2013-35-16.png?updatedAt=1788438665822)

### Dentist Section

![Dentist Dashboard 1](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Dentist%20Section%20Images/Screenshot%20from%202026-09-03%2018-42-12.png)

![Dentist Dashboard 2](https://ik.imagekit.io/cwchgveae/ICBT-ADVANCE-%20PROGARMMING%20/Dentist%20Section%20Images/Screenshot%20from%202026-09-03%2018-43-00.png)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed by Sanuth Newmin Rathnayaka - final year undergradguate student** | **ICBT Advance Programming Project**
 please edit this with adding with this https://youtu.be/-vDXzBuTnQg video as well  need to be show it top and professional looking  as well please need to be wisible all  of this content 
