'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Assessment } from '@/types'

interface DynamicPricingEstimateProps {
  assessment: Assessment;
  onApprove: () => void;
  onModify: () => void;
}

export function DynamicPricingEstimate({
  assessment,
  onApprove,
  onModify,
}: DynamicPricingEstimateProps) {
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    let price = assessment.basePrice;

    // Add service costs
    selectedServices.forEach((serviceKey) => {
      const service = assessment.services[serviceKey];
      if (service?.enabled) {
        price += service.price;
      }
    });

    // Add condition factors
    const interiorFactor = 1 + (100 - assessment.interiorCondition) / 100;
    const exteriorFactor = 1 + (100 - assessment.exteriorCondition) / 100;
    price *= (interiorFactor + exteriorFactor) / 2;

    setTotalPrice(Math.round(price));
  }, [assessment, selectedServices]);

  const handleServiceToggle = (serviceKey: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceKey)
        ? prev.filter((s) => s !== serviceKey)
        : [...prev, serviceKey]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Estimate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Base Price</h3>
            <p className="text-2xl font-bold">${assessment.basePrice}</p>
          </div>

          <div>
            <h3 className="font-medium">Available Services</h3>
            {Object.entries(assessment.services).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(key)}
                    onChange={() => handleServiceToggle(key)}
                    disabled={!service.enabled}
                    className="form-checkbox"
                  />
                  <span>{service.name}</span>
                </label>
                <span>${service.price}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-xl font-semibold">Total Price</h3>
            <p className="text-3xl font-bold">${totalPrice}</p>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={onModify} variant="outline">
              Modify
            </Button>
            <Button onClick={onApprove}>
              Approve Estimate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
