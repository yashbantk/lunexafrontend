"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { convertCentsToINR } from "@/lib/utils/currencyConverter"
import { formatPrice } from "@/lib/utils/formatUtils"

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
  const [convertedSubtotal, setConvertedSubtotal] = useState<number>(proposal.totalPriceCents)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Convert to INR on mount
    const convertCurrency = async () => {
      setLoading(true)
      try {
        const inrCents = await convertCentsToINR(proposal.totalPriceCents, proposal.currency.code)
        setConvertedSubtotal(inrCents)
      } catch (error) {
        console.error('Currency conversion error:', error)
        // Fallback to original amount
        setConvertedSubtotal(proposal.totalPriceCents)
      } finally {
        setLoading(false)
      }
    }

    convertCurrency()
  }, [proposal.totalPriceCents, proposal.currency.code])

  // Calculate price breakdown (all in INR)
  const subtotal = convertedSubtotal
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
        {loading ? (
          <div className="text-center text-gray-500">Converting currency...</div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal, 'INR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes (10%)</span>
              <span>{formatPrice(taxes, 'INR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Markup ({proposal.landMarkup}%)</span>
              <span>{formatPrice(markup, 'INR')}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total, 'INR')}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
