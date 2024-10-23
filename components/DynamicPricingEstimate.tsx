'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { VehicleAnalysis } from '@/types'

interface DynamicPricingEstimateProps {
  /**
   * The vehicle assessment to base the price on
   */
  assessment: VehicleAnalysis
  /**
   * The function to call when the user approves the estimate
   */
  onApprove: () => void
  /**
   * The function to call when the user wants to modify the services
   */
  onModify: () => void
}

export function DynamicPricingEstimate({ assessment, onApprove, onModify }: DynamicPricingEstimateProps) {
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  useEffect(() => {
    // Calculate total price based on assessment and selected services
    let price = assessment.basePrice;
  
    if (assessment.vehicleSize) {
      price += assessment.vehicleSizeFactor;
    }
    if (assessment.filthiness) {
      price += assessment.filthinessFactor;
    }
    if (assessment.luxury) {
      price += assessment.luxurySurcharge;
    }
  
    selectedServices.forEach((service) => {
      const serviceDetail = assessment.availableServices.find(s => s.name === service);
      if (serviceDetail) {
        price += serviceDetail.price;
      }
    });
  
    price += assessment.laborCost + assessment.materialCost;
  
    setTotalPrice(price);
  }, [assessment, selectedServices]);

    selectedServices.forEach((service) => {
      const serviceDetail = assessment.availableServices.find(s => s.name === service);
      if (serviceDetail && serviceDetail.enabled) {
        price += serviceDetail.price;
      }
    });

    price += assessment.laborCost + assessment.materialCost;

    setTotalPrice(price)
  }, [assessment, selectedServices])

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic Pricing Estimate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Pricing Breakdown</h4>
            <ul className="list-disc list-inside">
              <li>Base Price: ${assessment.basePrice}</li>
              {assessment.vehicleSize && <li>Vehicle Size Factor: +${assessment.vehicleSizeFactor}</li>}
              {assessment.filthiness && <li>Filthiness Factor: +${assessment.filthinessFactor}</li>}
              {assessment.luxury && <li>Luxury Surcharge: +${assessment.luxurySurcharge}</li>}
              {selectedServices.map((service) => (
                <li key={service}>{assessment.services[service].name}: +${assessment.services[service].price}</li>
              ))}
              <li>Labor Cost: +${assessment.laborCost}</li>
              <li>Material Cost: +${assessment.materialCost}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Select Services</h4>
            <div className="space-y-2">
              {Object.keys(assessment.services).map((serviceKey) => (
                <div key={serviceKey} className="flex items-center">
                  <input
                    type="checkbox"
                    id={serviceKey}
                    checked={selectedServices.includes(serviceKey)}
                    onChange={() => handleServiceToggle(serviceKey)}
                    disabled={!assessment.services[serviceKey].enabled}
                    className="mr-2"
                  />
                  <label htmlFor={serviceKey} className="capitalize">
                    {assessment.services[serviceKey].name} (+${assessment.services[serviceKey].price})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-2xl font-bold">Total Price: ${totalPrice.toFixed(2)}</div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onModify}>
              Modify Services
            </Button>
            <Button onClick={onApprove}>Approve Estimate</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
