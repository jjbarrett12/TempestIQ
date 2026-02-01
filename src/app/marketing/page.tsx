import Link from 'next/link'
import { HeroAlerts } from '@/components/marketing/HeroAlerts'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingHeroEffects } from '@/components/marketing/MarketingHeroEffects'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section - indigo / purple / slate */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-800 to-purple-900/90" />
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-br from-indigo-600/40 to-purple-600/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-gradient-to-tr from-violet-600/30 to-indigo-600/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <MarketingHeroEffects />
        <HeroAlerts />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-slate-200 mb-8 shadow-sm">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
              AI-Powered Weather Intelligence Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-sm">
              Turn severe weather into
              <span className="block mt-2 bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                actionable revenue intelligence.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              TempestIQ combines real-time alerts, impact scoring, and automated workflows to help teams act faster, target smarter, and win more jobs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="#pricing"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-400 hover:to-purple-400 transition-all text-base font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                href="/survey"
                className="px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-base font-semibold border-2 border-white/30 backdrop-blur-sm"
              >
                Find your plan
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for action—across industries */}
      <section id="solutions" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Built for action—<span className="text-indigo-600">across industries</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              TempestIQ is trusted by teams where timing matters.
              While contractors, insurers, and field operators see the
              fastest ROI, any business impacted by severe weather can
              use TempestIQ to prioritize response, reduce downtime,
              and capture opportunity.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              👉 Not seeing your industry? Let&apos;s talk.
            </Link>
          </div>

          {/* Safety & Compliance - Liability Shield */}
          <div id="safety" className="mt-16 p-8 rounded-2xl border-2 border-amber-200 bg-amber-50/80">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span aria-hidden>🛑</span> Safety &amp; Compliance
            </h3>
            <p className="text-gray-700 mb-4">
              Lightning proximity alerts. Wind thresholds for crane/lift shutdown. &ldquo;We halted work due to conditions&rdquo; audit trail. One injury lawsuit = $250k+. One OSHA fine = $10k+. $200/mo is laughably cheap insurance.
            </p>
            <p className="text-sm text-gray-600">
              Construction, warehouses, utilities, event organizers—protect your team and your liability.
            </p>
          </div>
        </div>
      </section>

      {/* Why AI - End-user sell with phone alert mockup (hero-style background) */}
      <section id="why-ai" className="relative py-24 px-6 overflow-hidden bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-800 to-purple-900/90" />
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-gradient-to-tr from-violet-600/20 to-indigo-600/30 rounded-full blur-3xl" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-sm">
              Why AI Is the Difference Between Alerts and Business Growth
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Anyone can send alerts. TempestIQ uses AI to turn storm intelligence into revenue—pinpointing when to act, where to deploy, and what actually drives results.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 mt-14">
            {/* Phone mockup: locked screen + incoming SMS */}
            <div className="flex-shrink-0">
              <div className="relative w-[280px] mx-auto">
                <div className="rounded-[2.5rem] border-[10px] border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/30">
                  <div className="rounded-[1.5rem] overflow-hidden aspect-[9/19] max-h-[520px] flex flex-col relative">
                    {/* Wallpaper - locked screen */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/95 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(99,102,241,0.25),transparent)]" />
                    {/* Incoming SMS notification banner - top of screen */}
                    <div className="relative z-10 mx-3 mt-3 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50 overflow-hidden">
                      <div className="p-3 flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-900 text-sm">TempestIQ</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">now</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            This wind event is 3× stronger than anything in the last 24 months. Wind gusts 55–70 mph expected 6:10–6:40 PM.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Lock screen: time + date */}
                    <div className="relative flex-1 flex flex-col items-center justify-center pt-16 pb-24 text-white">
                      <p className="text-5xl font-light tracking-tight">9:41</p>
                      <p className="text-base font-medium mt-1 opacity-90">Wednesday, Jan 28</p>
                      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy: end-user sell */}
            <div className="max-w-lg text-center lg:text-left">
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Generic weather APIs dump raw warnings on you. TempestIQ tells you <strong className="text-white">whether this one is routine or rare</strong>—and exactly what to do.
              </p>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-sky-200 flex items-center justify-center text-sm font-bold">1</span>
                  <span><strong className="text-white">Priority, not noise.</strong> AI scores severity for your context so you see &ldquo;high priority&rdquo; only when it&apos;s actually unusual.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-sky-200 flex items-center justify-center text-sm font-bold">2</span>
                  <span><strong className="text-white">Plain language.</strong> No codes or jargon—just &ldquo;55–70 mph winds, 6:10–6:40 PM. Secure loose items now.&rdquo;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-sky-200 flex items-center justify-center text-sm font-bold">3</span>
                  <span><strong className="text-white">One tap.</strong> Alerts like this on your phone, when they matter—so you can stop work at the right time and restart before your competitors.</span>
                </li>
              </ul>
              <p className="mt-8 text-indigo-300 font-medium">
                We sell clarity and action, not data feeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-indigo-50/50 via-purple-50/30 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              How It <span className="text-indigo-600">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Data in → AI interprets → you get clear, actionable guidance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/80 border border-indigo-100 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data In</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Forecasts, alerts, polygons, probabilities, and historical data from industry-leading weather sources.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/80 border border-purple-100 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-purple-500/30">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Interprets</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Severity scoring, context matching, plain-language summarization, and predictive risk—tailored to your industry and assets.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/80 border border-pink-100 shadow-lg shadow-pink-500/5 hover:shadow-xl hover:shadow-pink-500/10 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-pink-500/30">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">You Act</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get the right message, at the right time, on the right channel—so you know what matters and what to do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Enterprise <span className="text-indigo-600">Features</span>
            </h2>
            <p className="text-lg text-gray-600">
              Interpretation, prioritization, and personalization—not just raw alerts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Severity &amp; Signal</h3>
              <p className="text-sm text-gray-600 leading-relaxed">De-duplicate overlapping alerts, score severity for your context, suppress low-impact noise, escalate unusual or compounding risk.</p>
            </div>

            <div className="p-6 rounded-xl border-2 border-purple-100 bg-purple-50/30 hover:border-purple-200 hover:bg-purple-50/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Context-Aware Alerts</h3>
              <p className="text-sm text-gray-600 leading-relaxed">AI merges weather with your profile—industry, assets, hours, thresholds—so you get guidance that fits your operations, not generic bulletins.</p>
            </div>

            <div className="p-6 rounded-xl border-2 border-pink-100 bg-pink-50/30 hover:border-pink-200 hover:bg-pink-50/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-pink-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Plain-Language Summaries</h3>
              <p className="text-sm text-gray-600 leading-relaxed">No jargon. You get &ldquo;60–70 mph winds 6:10–6:40 PM. Secure loose items now&rdquo; instead of raw warning codes. Clarity, not data.</p>
            </div>

            <div className="p-6 rounded-xl border-2 border-cyan-100 bg-cyan-50/30 hover:border-cyan-200 hover:bg-cyan-50/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-cyan-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Predictive Impact</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Forecast impact, not just weather—outage likelihood, delivery delays, flooding risk by area. Proactive &gt; reactive.</p>
            </div>

            <div className="p-6 rounded-xl border-2 border-violet-100 bg-violet-50/30 hover:border-violet-200 hover:bg-violet-50/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-violet-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Smart Timing &amp; Channel</h3>
              <p className="text-sm text-gray-600 leading-relaxed">AI decides when to notify, how aggressively, and via SMS, push, or email—reducing alert fatigue and missed critical moments.</p>
            </div>

            <div className="p-6 rounded-xl border-2 border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">API &amp; Webhooks</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Connect with your CRM and tools via API and webhooks. Rules engine and customer overrides sit above the AI layer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-slate-100/80 via-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple <span className="text-indigo-600">Pricing</span>
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Choose the plan that scales with your business
            </p>
            <p className="text-sm text-gray-500 mb-4 max-w-xl mx-auto">
              One job pays for the year. We help you win more jobs, prove damage, and move faster than competitors.
            </p>
            <Link
              href="/survey"
              className="inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              Not sure which plan? Take our 1-minute survey →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Starter</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-indigo-600">$79</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">Perfect for small businesses</p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Up to 5 service areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">500 alerts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">SMS & Email alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Basic analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Email support</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=starter"
                className="block w-full text-center px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition font-medium text-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Professional - Featured */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-800 text-white border-2 border-indigo-500 rounded-xl p-6 transform scale-105 shadow-2xl shadow-indigo-500/25 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  MOST POPULAR
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 mt-2">Professional</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$199</span>
                <span className="text-indigo-200 text-sm">/month</span>
              </div>
              <p className="text-xs text-indigo-200 mb-6">Best for growing teams</p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-0.5">✓</span>
                  <span className="text-white/90">Up to 25 service areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-0.5">✓</span>
                  <span className="text-white/90">2,500 alerts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-0.5">✓</span>
                  <span className="text-white/90">All channels + API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-0.5">✓</span>
                  <span className="text-white/90">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-0.5">✓</span>
                  <span className="text-white/90">CRM integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-0.5">✓</span>
                  <span className="text-white/90">Priority support</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=professional"
                className="block w-full text-center px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-sm shadow-lg transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Business */}
            <div className="bg-white border-2 border-purple-100 rounded-xl p-6 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Business</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-indigo-700">$399</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">For established agencies</p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Up to 100 service areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">10,000 alerts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">All features + webhooks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Custom lead scoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Multi-user access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Dedicated support</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=business"
                className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-medium text-sm shadow-md shadow-purple-500/20"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-xl transition-all">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Enterprise</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-700">Custom</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Unlimited service areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Unlimited alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">SLA guarantee (99.9%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-gray-600">White-label options</span>
                </li>
              </ul>
              <Link
                href="#contact"
                className="block w-full text-center px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm shadow-md"
              >
                Contact Sales
              </Link>
            </div>
          </div>
          
          {/* Pricing Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-2">
              All plans include 14-day free trial • Cancel anytime
            </p>
            <p className="text-xs text-gray-500">
              Additional charges may apply for SMS/Email usage beyond included limits.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 shadow-2xl shadow-indigo-500/20">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-sm">
            Ready to Generate More Leads?
          </h2>
          <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies using AI-powered weather intelligence to capture more leads and close more deals.
          </p>
          <Link
            href="#pricing"
            className="inline-block px-8 py-4 bg-white text-indigo-700 rounded-xl hover:bg-slate-100 transition-all text-base font-bold shadow-xl hover:shadow-2xl"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-900 text-slate-300 py-12 px-6 border-t border-indigo-500/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/TempestIQ logo transparent.png"
                  alt="TempestIQ"
                  className="h-10 w-auto object-contain shrink-0"
                />
                <span className="text-white font-semibold text-lg shrink-0">TempestIQ</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Turn severe weather events into qualified leads for roofing companies and insurance agencies.
              </p>
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#solutions" className="hover:text-indigo-400 transition-colors">Built for Action</a></li>
                <li><a href="#why-ai" className="hover:text-indigo-400 transition-colors">Why AI</a></li>
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <a href="mailto:sales@tempestiq.com" className="hover:text-indigo-400 transition-colors break-all">
                    sales@tempestiq.com
                  </a>
                </li>
                <li>
                  <a href="tel:+15551234567" className="hover:text-indigo-400 transition-colors">
                    (555) 123-4567
                  </a>
                </li>
                <li className="text-slate-400">Support: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-6 text-center">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} TempestIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
