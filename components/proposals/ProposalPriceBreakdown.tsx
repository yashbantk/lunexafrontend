"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard } from "lucide-react"

interface ProposalPriceBreakdownProps {
  proposal: {
    totalPriceCents: number
    landMarkup: number
    currency: {
      code: string
      name: string
    }
  }
}

export function ProposalPriceBreakdown({ proposal }: ProposalPriceBreakdownProps) {
  // Format currency
  const formatCurrency = (cents: number, currencyCode: string = 'INR') => {
    const amount = cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  }

  // Calculate price breakdown
  const subtotal = proposal.totalPriceCents
  const taxes = Math.round(subtotal * 0.1) // 10% tax
  const markup = Math.round(subtotal * (proposal.landMarkup / 100))
  const total = subtotal + taxes + markup

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal, proposal.currency.code)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Taxes (10%)</span>
          <span>{formatCurrency(taxes, proposal.currency.code)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Markup ({proposal.landMarkup}%)</span>
          <span>{formatCurrency(markup, proposal.currency.code)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(total, proposal.currency.code)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
