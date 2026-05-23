import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen bg-mist text-ink">
    <div className="relative overflow-hidden">
      <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />

      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-xl text-ink">
            Student Academic Reminder
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-primary transition">Features</a>
            <a href="#workflow" className="hover:text-primary transition">Workflow</a>
            <a href="#docs" className="hover:text-primary transition">Docs</a>
            <a href="#community" className="hover:text-primary transition">Community</a>
          </div>
          <Link
            to="/login"
            className="micro-btn bg-primary text-white px-4 py-2 rounded-full shadow-lg"
          >
            Get started
          </Link>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="uppercase tracking-[0.2em] text-xs text-slate-500">Academic OS for teams</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Build clearer semesters with <span className="gradient-text">calm planning</span> and
            crisp reminders.
          </h1>
          <p className="text-slate-600 text-lg">
            Schedule components, attach learning materials, and keep every cohort aligned in one
            beautiful dashboard. Designed for CRs, admins, and students to stay on track together.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="micro-btn bg-primary text-white px-5 py-3 rounded-full shadow-lg"
            >
              Create an account
            </Link>
            <Link
              to="/login"
              className="micro-btn border border-primary/30 text-primary px-5 py-3 rounded-full bg-white/70"
            >
              Sign in
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div>
              <p className="font-semibold text-ink">24/7</p>
              <p>Realtime updates</p>
            </div>
            <div>
              <p className="font-semibold text-ink">6+</p>
              <p>Core workflows</p>
            </div>
            <div>
              <p className="font-semibold text-ink">100%</p>
              <p>Cloud-ready</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="liquid-card p-6 space-y-4">
            <p className="text-sm text-slate-500">Today</p>
            <div className="neo-card p-4">
              <p className="text-lg font-semibold">Research Review</p>
              <p className="text-sm text-slate-500">Due Friday, 6 PM</p>
            </div>
            <div className="neo-card p-4">
              <p className="text-lg font-semibold">Class Test 2</p>
              <p className="text-sm text-slate-500">Monday, 10 AM</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl">
              <p className="text-sm text-slate-500">Latest uploads</p>
              <p className="font-semibold">Digital Systems Notes.pdf</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl">
            <p className="text-sm text-slate-500">Keep everyone aligned</p>
            <p className="text-lg font-semibold">Automated reminders + calendar drops</p>
          </div>
        </div>
      </header>
    </div>

    <section id="features" className="max-w-6xl mx-auto px-6 pb-16">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Smart subject components",
            text: "Assignments, tests, presentations, and research tracked in one place.",
          },
          {
            title: "Attachment intelligence",
            text: "Upload PDFs, decks, docs, and media with previews and progress.",
          },
          {
            title: "Reminders that feel human",
            text: "Schedule alerts and send updates without leaving the dashboard.",
          },
        ].map((item) => (
          <div key={item.title} className="neo-card p-6 hover-lift">
            <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
            <p className="text-slate-600 mt-2">{item.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section id="workflow" className="max-w-6xl mx-auto px-6 pb-16">
      <div className="glass-panel p-8 rounded-3xl">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Create subjects",
              text: "CRs build subject shells and assign components.",
            },
            {
              step: "02",
              title: "Upload assets",
              text: "Attach learning materials with rich previews.",
            },
            {
              step: "03",
              title: "Track progress",
              text: "Students see deadlines and updates instantly.",
            },
          ].map((item) => (
            <div key={item.step} className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">{item.step}</p>
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="docs" className="max-w-6xl mx-auto px-6 pb-16">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="liquid-card p-8">
          <h2 className="text-2xl font-semibold">How to use it</h2>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li>• CRs create subjects and add internal components.</li>
            <li>• Attachments upload with progress and instant previews.</li>
            <li>• Students see deadlines and receive reminders.</li>
            <li>• Events and chat keep communication flowing.</li>
          </ul>
        </div>
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-semibold">Quick links</h3>
          <Link to="/login" className="block text-primary">Login</Link>
          <Link to="/register" className="block text-primary">Create account</Link>
          <Link to="/dashboard" className="block text-primary">Go to dashboard</Link>
        </div>
      </div>
    </section>

    <section id="community" className="max-w-6xl mx-auto px-6 pb-20">
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Ready to simplify the semester?</h2>
          <p className="text-slate-600 mt-2">Jump in and start building calmer workflows.</p>
        </div>
        <Link to="/register" className="micro-btn bg-primary text-white px-6 py-3 rounded-full shadow-lg">
          Get started now
        </Link>
      </div>
    </section>
  </div>
);

export default LandingPage;
