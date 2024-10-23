import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function MobileAnalytics() {
  const analytics = useQuery(api.pricing.getPricingAnalytics)

  if (!analytics) return null

  const chartData = [
    { name: 'Total Revenue', value: analytics.totalRevenue },
    { name: 'Avg Order Value', value: analytics.averageOrderValue },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analytics.popularServices.map((service, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{service}</span>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
