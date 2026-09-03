'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import {
  BookOpen, Users, Stethoscope, CalendarDays, CreditCard,
  Activity, FileBarChart, UserCog, CircleHelp, Mail,
  Phone, MapPin, Clock, ArrowRight, Lightbulb, Shield,
  Settings, Search, Printer, ScanBarcode,
} from 'lucide-react'

const sections = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    items: [
      { label: 'Navigate the sidebar', desc: 'Use the left sidebar to access all modules. The sidebar can be collapsed for more workspace.' },
      { label: 'Check the dashboard', desc: 'View key metrics, upcoming appointments, and quick actions from the Dashboard.' },
      { label: 'Search functionality', desc: 'Use the search bar in the topbar to quickly find patients, appointments, or records.' },
    ],
  },
  {
    title: 'Patient Management',
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    items: [
      { label: 'Register a patient', desc: 'Navigate to Patients and click "New Patient" to register with required details.' },
      { label: 'Print patient cards', desc: 'Generate printable patient ID cards with barcode for easy identification.' },
      { label: 'Scan barcodes', desc: 'Use the barcode scanner feature to quickly look up patient records.' },
    ],
  },
  {
    title: 'Appointments',
    icon: CalendarDays,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    items: [
      { label: 'Book an appointment', desc: 'Click "New Appointment" and select patient, dentist, treatment, and preferred date/time.' },
      { label: 'Manage status', desc: 'Update appointment status to Completed or Cancelled as needed.' },
      { label: 'View schedule', desc: 'Check upcoming and past appointments from the Appointments page.' },
    ],
  },
  {
    title: 'Billing & Treatments',
    icon: CreditCard,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    items: [
      { label: 'Create invoices', desc: 'Generate invoices for completed treatments with automatic calculations.' },
      { label: 'Record payments', desc: 'Track payments received and outstanding balances for each patient.' },
      { label: 'Treatment catalog', desc: 'Manage available treatments, pricing, and categories in the Treatments module.' },
    ],
  },
]

const quickLinks = [
  { label: 'Patients', href: '/patients', icon: Users, desc: 'Register and manage patient records' },
  { label: 'Appointments', href: '/appointments', icon: CalendarDays, desc: 'Schedule and track appointments' },
  { label: 'Dentists', href: '/dentists', icon: Stethoscope, desc: 'Manage dentist profiles and availability' },
  { label: 'Treatments', href: '/treatments', icon: Activity, desc: 'View treatment catalog and pricing' },
  { label: 'Billing', href: '/billing', icon: CreditCard, desc: 'Generate invoices and track payments' },
  { label: 'Reports', href: '/reports', icon: FileBarChart, desc: 'View analytics and clinic reports' },
]

const faqs = [
  {
    q: 'How do I register a new patient?',
    a: 'Go to Patients → click "New Patient" → fill in the required fields (name, contact, etc.) → click Save. You can also print a patient card with barcode after registration.',
  },
  {
    q: 'How do I book an appointment?',
    a: 'Go to Appointments → click "New Appointment" → scan patient barcode or select patient manually → choose dentist, treatment, date, and time → click Create.',
  },
  {
    q: 'Can I filter appointments by date?',
    a: 'Yes, use the date filter inputs at the top of the Appointments table to filter by start and end date range.',
  },
  {
    q: 'How do I generate an invoice?',
    a: 'Go to Billing → click "New Invoice" → select patient and treatment → the amount auto-fills based on treatment price → click Create Invoice.',
  },
  {
    q: 'What do the appointment statuses mean?',
    a: 'Scheduled = upcoming, Completed = finished, Cancelled = cancelled. Dentists can mark appointments as completed directly.',
  },
  {
    q: 'How do I view reports?',
    a: 'Admin users can access Reports from the sidebar to view appointment analytics, revenue summaries, and treatment statistics.',
  },
]

export default function HelpPage() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')

  return (
    <DashboardLayout title="Help Center">
      {/* Hero Section */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-2 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <div className="icon-box text-blue-600">
                  <CircleHelp className="size-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Help Center</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Welcome to DentaFlow</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Find answers to common questions and learn how to use the system effectively.
                Select a topic below or browse the frequently asked questions.
              </p>
              <div className="mt-2 flex gap-2">
                <a href="#faq" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  Browse FAQ
                  <ArrowRight className="size-3.5" />
                </a>
                <a href="#contact" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent">
                  Contact Support
                </a>
              </div>
            </div>
            <div className="hidden items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-8 sm:flex sm:w-72 lg:w-80">
              <Image
                src="/anyhelp.png"
                alt="Help Center"
                width={200}
                height={200}
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="icon-box">
              <link.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </a>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`icon-box ${section.bgColor}`}>
                  <section.icon className={`size-4 ${section.color}`} />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/40" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Keyboard Shortcuts & Tips */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="icon-box bg-amber-50">
                <Lightbulb className="size-4 text-amber-600" />
              </div>
              Useful Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: ScanBarcode, text: 'Use barcode scanning for quick patient lookup during appointments.' },
                { icon: Printer, text: 'Print patient cards after registration for easy identification.' },
                { icon: Search, text: 'Use the topbar search to quickly navigate between modules.' },
                { icon: Settings, text: 'Admin users can manage users and view audit logs from the sidebar.' },
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <tip.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{tip.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="icon-box bg-emerald-50">
                <Shield className="size-4 text-emerald-600" />
              </div>
              Roles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { role: 'Admin', access: 'Full access to all modules including Users, Reports, and Audit Logs.' },
                { role: 'Receptionist', access: 'Access to Appointments, Patients, Dentists, Treatments, and Billing.' },
                { role: 'Dentist', access: 'View own appointments and update appointment status.' },
              ].map((item, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium">{item.role}</p>
                  <p className="text-xs text-muted-foreground">{item.access}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card id="faq" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="icon-box bg-blue-50">
              <BookOpen className="size-4 text-blue-600" />
            </div>
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{faq.q}</p>
                <p className="mt-1 text-xs text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card id="contact">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="icon-box mb-3 bg-primary/10">
              <Mail className="size-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold">Need More Help?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact our support team for technical assistance or feature requests.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span>support@dentaflow.lk</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" />
                <span>Mon - Fri, 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
