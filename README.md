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

```text
dental-management-system/
├── backend/                          # Spring Boot API
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── src/main/java/com/dentaflow/
│       ├── auth/                     # Authentication & JWT
│       ├── patient/                  # Patient CRUD
│       ├── dentist/                  # Dentist management
│       ├── appointment/              # Appointment scheduling
│       ├── treatment/                # Treatment catalog
│       ├── billing/                  # Billing & payments
│       ├── attendance/               # Dentist attendance
│       ├── audit/                    # Audit logging
│       ├── report/                   # Reports & PDF generation
│       └── notification/             # Email notifications
│
├── frontend/                         # Next.js App
│   ├── components/                   # Reusable UI components
│   ├── services/                     # API service layer
│   ├── types/                        # TypeScript definitions
│   ├── contexts/                     # Auth context
│   ├── middleware.ts                 # JWT auth & RBAC
│   └── app/                          # Pages (App Router)
│       ├── page.tsx                  # Dashboard
│       ├── appointments/
│       ├── patients/
│       ├── dentists/
│       ├── treatments/
│       ├── billing/
│       ├── reports/
│       ├── users/
│       └── audit/
