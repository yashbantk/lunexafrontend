export interface ProposalCoverData {
  clientName: string
  destination: string
  duration: string
  isCustomizable: boolean
  hotelName: string
  description: string
  contents: string[]
  curator: {
    name: string
    experience: string
    phone: string
    email: string
  }
  quotationDate: string
  quotationTime: string
  highlights: {
    hotels: number
    activities: number
    meals: string
  }
  totalCost: {
    amount: string
    currency: string
    forAdults: number
  }
  disclaimer: string
  footerText: string
}

export const mockProposalCoverData: ProposalCoverData = {
  clientName: "Adi Adi",
  destination: "Maldives",
  duration: "4N/5D",
  isCustomizable: true,
  hotelName: "Taj Coral Reef Resort With Water Villa Stay",
  description: "Unwind on this heavenly vacation to the Taj Coral Reef Resort in the Maldives. Enjoy your stay as you go snorkelling, windsurfing and more. Relax in the picturesque beaches and dive into the calming aqua-blue waters.",
  contents: [
    "Your Itinerary",
    "Day Wise Details", 
    "How To Book",
    "Cancellation & Date Change Policies"
  ],
  curator: {
    name: "Jaishika Manjhi",
    experience: "4+ Years Experience",
    phone: "7428090055",
    email: "jaishika.manjhi@deyor.in"
  },
  quotationDate: "23 Jul 2025",
  quotationTime: "08:15 PM",
  highlights: {
    hotels: 2,
    activities: 4,
    meals: "Selected Meals Included"
  },
  totalCost: {
    amount: "2,33,516",
    currency: "₹",
    forAdults: 2
  },
  disclaimer: "Package price, payment schedule and cancellation policy are tentative and subject to change. Package price, payment schedule and cancellation policy as shown on the Package Review Page is subject to change after applicable TCS amount in the booking.",
  footerText: "Please think twice before printing this mail. Save paper, it's good for the environment."
}





