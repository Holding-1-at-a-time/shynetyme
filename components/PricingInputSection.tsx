import React from 'react'
import { Slider } from './ui/slider'
import { Input } from './ui/input'

interface PricingInputSectionProps {
  pricingModel: PricingModel
  onChange: (pricingModel: PricingModel) => void
}

export function PricingInputSection({ pricingModel, onChange }: PricingInputSectionProps) {
  const handleBasePriceChange = (vehicleType: keyof PricingModel['basePrice'], value: number) => {
    onChange({
      ...pricingModel,
      basePrice: {
        ...pricingModel.basePrice,
        [vehicleType]: value,
      },
    })
  }

  const handleSurchargeChange = (surchargeType: keyof PricingModel['surcharges'], value: number) => {
    onChange({
      ...pricingModel,
      surcharges: {
        ...pricingModel.surcharges,
        [surchargeType]: value,
      },
    })
  }

  const handleServiceChange = (serviceKey: string, field: keyof PricingModel['services'][string], value: any) => {
    onChange({
      ...pricingModel,
      services: {
        ...pricingModel.services,
        [serviceKey]: {
          ...pricingModel.services[serviceKey],
          [field]: value,
        },
      },
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Base Pricing</h2>
      {Object.keys(pricingModel.basePrice).map((vehicleType) => (
        <div key={vehicleType} className="flex flex-col">
          <label className="mb-1 capitalize">{vehicleType} Base Price (${pricingModel.basePrice[vehicleType as keyof PricingModel['basePrice']]})</label>
          <Slider
            min={0}
            max={500}
            step={10}
            value={pricingModel.basePrice[vehicleType as keyof PricingModel['basePrice']]}
            onValueChange={(value) => handleBasePriceChange(vehicleType as keyof PricingModel['basePrice'], value)}
          />
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6">Surcharges</h2>
      {Object.keys(pricingModel.surcharges).map((surcharge) => (
        <div key={surcharge} className="flex flex-col">
          <label className="mb-1 capitalize">{surcharge} ({pricingModel.surcharges[surcharge as keyof PricingModel['surcharges']]}%)</label>
          <Slider
            min={0}
            max={50}
            step={5}
            value={pricingModel.surcharges[surcharge as keyof PricingModel['surcharges']]}
            onValueChange={(value) => handleSurchargeChange(surcharge as keyof PricingModel['surcharges'], value)}
          />
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6">Additional Costs</h2>
      {Object.keys(pricingModel.services).map((serviceKey) => (
        <div key={serviceKey} className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="capitalize">{pricingModel.services[serviceKey].name} (${pricingModel.services[serviceKey].price})</span>
            <input
              type="checkbox"
              checked={pricingModel.services[serviceKey].enabled}
              onChange={(e) => handleServiceChange(serviceKey, 'enabled', e.target.checked)}
            />
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            disabled={!pricingModel.services[serviceKey].enabled}
            value={pricingModel.services[serviceKey].price}
            onValueChange={(value) => handleServiceChange(serviceKey, 'price', value)}
          />
        </div>
      ))}

      <div className="mt-6">
        <Input
          label="Labor Cost ($/hour)"
          type="number"
          value={pricingModel.laborCost}
          onChange={(e) => onChange({ ...pricingModel, laborCost: Number(e.target.value) })}
        />
      </div>
      <div className="mt-4">
        <Input
          label="Material Cost ($)"
          type="number"
          value={pricingModel.materialCost}
          onChange={(e) => onChange({ ...pricingModel, materialCost: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
