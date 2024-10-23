import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface AnalyticsSectionProps {
  analytics: PricingAccuracy | null
}

export function AnalyticsSection({ analytics }: AnalyticsSectionProps) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (analytics) {
      setChartData({
        labels: ['Total Assessments', 'Accurate Assessments'],
        datasets: [
          {
            label: 'Assessments',
            data: [analytics.totalAssessments, analytics.accurateAssessments],
            backgroundColor: ['#4ade80', '#3b82f6'],
          },
        ],
      })
    }
  }, [analytics])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pricing Accuracy</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Pricing Model Accuracy',
              },
            },
          }}
        />
      ) : (
        <p>No analytics data available.</p>
      )}
      {analytics && (
        <div>
          <p className="font-medium">Accuracy: {(analytics.accuracy * 100).toFixed(2)}%</p>
          <p>Total Assessments: {analytics.totalAssessments}</p>
        </div>
      )}
    </div>
  )
}
