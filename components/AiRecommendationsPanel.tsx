import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface AiRecommendationsPanelProps {
  recommendations: string[];
  onApply: (recommendation: string) => void;
}

export function AiRecommendationsPanel({ recommendations, onApply }: AiRecommendationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{recommendation}</span>
              <Button onClick={() => onApply(recommendation)} variant="outline" size="sm">
                Apply
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
