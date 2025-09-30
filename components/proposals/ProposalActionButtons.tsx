"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"

interface ProposalActionButtonsProps {
  onBookNow?: () => void
  onReadyToBook?: () => void
  onAcceptProposal?: () => void
  onNeedHelp?: () => void
  onMail?: () => void
  onWhatsApp?: () => void
}

export function ProposalActionButtons({
  onBookNow,
  onReadyToBook,
  onAcceptProposal,
  onNeedHelp,
  onMail,
  onWhatsApp
}: ProposalActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="space-y-3"
    >
      <Button 
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
        onClick={onBookNow}
      >
        BOOK NOW
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="flex items-center justify-center space-x-2 py-2"
          onClick={onReadyToBook}
        >
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm">READY TO BOOK?</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center space-x-2 py-2"
          onClick={onAcceptProposal}
        >
          <CheckCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm">ACCEPT PROPOSAL</span>
        </Button>
      </div>

      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center space-x-2 py-2"
        onClick={onNeedHelp}
      >
        <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-purple-600 text-xs">?</span>
        </div>
        <span className="text-sm">NEED HELP</span>
      </Button>

      {/* Contact Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="flex items-center justify-center space-x-2 py-2"
          onClick={onMail}
        >
          <Mail className="w-4 h-4" />
          <span className="text-sm">MAIL</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center space-x-2 py-2"
          onClick={onWhatsApp}
        >
          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-xs">W</span>
          </div>
          <span className="text-sm">WHATSAPP LINK</span>
        </Button>
      </div>
    </motion.div>
  )
}
