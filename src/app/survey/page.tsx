'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLANS, PLAN_IDS, type PlanId } from '@/lib/plans'

type SurveyAnswers = {
  businessType: 'roofing' | 'insurance' | 'restoration' | 'other'
  serviceAreas: '1-5' | '6-25' | '26-100' | '100+'
  monthlyAlerts: 'under-500' | '500-2500' | '2500-10000' | '10000+'
  needApi: boolean
  needPrioritySupport: boolean
  teamSize: 'solo' | 'small' | 'medium' | 'large'
  priority: 'cost' | 'features' | 'support' | 'scale'
}

const INITIAL_ANSWERS: SurveyAnswers = {
  businessType: 'roofing',
  serviceAreas: '1-5',
  monthlyAlerts: 'under-500',
  needApi: false,
  needPrioritySupport: false,
  teamSize: 'solo',
  priority: 'features',
}

function recommendPlan(answers: SurveyAnswers): PlanId {
  const { serviceAreas, monthlyAlerts, needApi, needPrioritySupport, teamSize, priority } = answers

  // Hard requirements → Enterprise
  if (serviceAreas === '100+' || monthlyAlerts === '10000+' || teamSize === 'large') return PLAN_IDS.ENTERPRISE

  // High scale or must-haves → Business
  if (
    serviceAreas === '26-100' ||
    monthlyAlerts === '2500-10000' ||
    needPrioritySupport ||
    teamSize === 'medium'
  )
    return PLAN_IDS.BUSINESS

  // API need pushes to at least Professional (Starter has no API)
  if (needApi) return PLAN_IDS.PROFESSIONAL

  // Mid scale → Professional
  if (serviceAreas === '6-25' || monthlyAlerts === '500-2500' || teamSize === 'small')
    return PLAN_IDS.PROFESSIONAL

  // Prefer Starter when cost is top priority and scale is low
  if (priority === 'cost' && serviceAreas === '1-5' && monthlyAlerts === 'under-500' && teamSize === 'solo')
    return PLAN_IDS.STARTER

  // Prefer Professional when features or scale matter
  if (priority === 'features' || priority === 'scale') return PLAN_IDS.PROFESSIONAL

  return PLAN_IDS.STARTER
}

function getRecommendationReason(answers: SurveyAnswers, planId: PlanId): string {
  const { serviceAreas, monthlyAlerts, needApi, needPrioritySupport, teamSize } = answers
  switch (planId) {
    case PLAN_IDS.ENTERPRISE:
      if (serviceAreas === '100+') return 'You need 100+ service areas—Enterprise gives you unlimited coverage.'
      if (monthlyAlerts === '10000+') return 'Your expected alert volume needs unlimited alerts and custom setup.'
      if (teamSize === 'large') return 'Your team size and needs fit our Enterprise offering with dedicated support.'
      return 'Your scale and requirements fit our Enterprise plan with custom pricing and SLA.'
    case PLAN_IDS.BUSINESS:
      if (needPrioritySupport) return 'You asked for priority support—Business includes dedicated support.'
      if (serviceAreas === '26-100' || monthlyAlerts === '2500-10000')
        return 'Your service areas and alert volume fit Business limits (100 areas, 10K alerts/mo).'
      if (teamSize === 'medium') return 'Your team size (6–20) is a great fit for Business multi-user and analytics.'
      return 'Business gives you the coverage and features you need as you grow.'
    case PLAN_IDS.PROFESSIONAL:
      if (needApi) return 'You need API & CRM integrations—Professional includes API and priority support.'
      if (serviceAreas === '6-25' || monthlyAlerts === '500-2500')
        return 'Your coverage (up to 25 areas, 2.5K alerts) matches Professional.'
      if (teamSize === 'small') return 'Perfect for small teams with advanced analytics and integrations.'
      return 'Professional balances features and value for growing teams.'
    case PLAN_IDS.STARTER:
    default:
      return 'Starter covers your current scale (5 areas, 500 alerts) at the lowest cost.'
  }
}

const STEPS = [
  {
    id: 'businessType',
    title: 'What best describes your business?',
    options: [
      { value: 'roofing', label: 'Roofing company' },
      { value: 'insurance', label: 'Insurance agency' },
      { value: 'restoration', label: 'Restoration / property services' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'serviceAreas',
    title: 'How many service areas do you need to monitor?',
    options: [
      { value: '1-5', label: '1–5 areas' },
      { value: '6-25', label: '6–25 areas' },
      { value: '26-100', label: '26–100 areas' },
      { value: '100+', label: '100+ areas' },
    ],
  },
  {
    id: 'monthlyAlerts',
    title: 'Roughly how many weather alerts per month do you expect?',
    options: [
      { value: 'under-500', label: 'Under 500' },
      { value: '500-2500', label: '500–2,500' },
      { value: '2500-10000', label: '2,500–10,000' },
      { value: '10000+', label: '10,000+' },
    ],
  },
  {
    id: 'teamSize',
    title: 'How many people will use the platform?',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'small', label: '2–5 people' },
      { value: 'medium', label: '6–20 people' },
      { value: 'large', label: '20+ people' },
    ],
  },
  {
    id: 'priority',
    title: "What matters most to you right now?",
    options: [
      { value: 'cost', label: 'Keeping cost low' },
      { value: 'features', label: 'Getting the right features (API, analytics)' },
      { value: 'support', label: 'Support and reliability' },
      { value: 'scale', label: 'Room to scale' },
    ],
  },
  {
    id: 'extras',
    title: 'Do you need any of these?',
    options: [
      { value: 'needApi', label: 'API & CRM integrations', type: 'checkbox' },
      { value: 'needPrioritySupport', label: 'Priority or dedicated support', type: 'checkbox' },
    ],
  },
]

export default function SurveyPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<SurveyAnswers>(INITIAL_ANSWERS)
  const [done, setDone] = useState(false)

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const isExtras = currentStep?.id === 'extras'

  const updateAnswer = (key: keyof SurveyAnswers, value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (isLastStep) {
      setDone(true)
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const recommendedPlan = recommendPlan(answers)
  const planInfo = PLANS[recommendedPlan]
  const recommendationReason = getRecommendationReason(answers, recommendedPlan)

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              <span className="text-2xl font-bold text-white">✓</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              We recommend: <span className="text-indigo-600">{planInfo.name}</span>
            </h1>
            <p className="text-gray-600 mb-3">{planInfo.description}</p>
            <p className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2 inline-block">
              {recommendationReason}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <p className="text-lg font-semibold text-gray-900 mb-3">{planInfo.priceLabel}</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {planInfo.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <Link
              href={`/signup?plan=${recommendedPlan}`}
              className="block w-full text-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30"
            >
              Continue to sign up & subscribe
            </Link>
            <Link
              href="/marketing#pricing"
              className="block w-full text-center px-6 py-3 text-gray-600 hover:text-indigo-600 font-medium"
            >
              View all plans
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 md:p-10">
        <div className="mb-8">
          <Link href="/marketing" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            <Image
              src="/TempestIQ logo transparent.png"
              alt="TempestIQ"
              width={100}
              height={26}
              className="h-6 w-auto object-contain"
            />
            <span>← Back to TempestIQ</span>
          </Link>
          <p className="text-gray-600 mt-3 text-sm">
            Answer a few questions and we&apos;ll recommend the right plan for your needs.
          </p>
          <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">{currentStep.title}</h2>

        {isExtras ? (
          <div className="space-y-4">
            {(currentStep.options as { value: string; label: string; type: string }[]).map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-200 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={answers[opt.value as keyof SurveyAnswers] as boolean}
                  onChange={(e) => updateAnswer(opt.value as keyof SurveyAnswers, e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-900">{opt.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {currentStep.options.map((opt: { value: string; label: string }) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateAnswer(currentStep.id as keyof SurveyAnswers, opt.value)
                  if (!isLastStep) handleNext()
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition ${
                  answers[currentStep.id as keyof SurveyAnswers] === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-200 text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-40"
          >
            Back
          </button>
          {isExtras ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700"
            >
              See my plan
            </button>
          ) : (
            step > 0 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Next
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
