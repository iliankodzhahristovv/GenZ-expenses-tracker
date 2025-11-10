/**
 * Default categories that all new users start with
 * Users can customize these and changes are saved per-user in the database
 */

export const DEFAULT_CATEGORIES: Record<string, Array<{ id: string; icon: string; name: string }>> = {
  "Advertising": [
    { id: "digital-advertising", icon: "📢", name: "Digital advertising" },
    { id: "outdoor-advertising", icon: "🏟", name: "Outdoor advertising" },
  ],
  "Auto & Transport": [
    { id: "auto-maintenance", icon: "🔧", name: "Auto maintenance" },
    { id: "auto-payment", icon: "🚗", name: "Auto payment" },
    { id: "gas", icon: "⛽", name: "Gas" },
    { id: "parking-tolls", icon: "🅿️", name: "Parking & tolls" },
    { id: "public-transit", icon: "🚎", name: "Public transit" },
    { id: "taxi-ride-shares", icon: "🚕", name: "Taxi & ride shares" },
  ],
  "Bills & Utilities": [
    { id: "gas-electric", icon: "⚡", name: "Gas & electric" },
    { id: "internet-cable", icon: "🌐", name: "Internet & cable" },
    { id: "phone", icon: "📱", name: "Phone" },
    { id: "water", icon: "💧", name: "Water" },
  ],
  "Food & Dining": [
    { id: "business-travel-meals", icon: "🍽️", name: "Business travel & meals" },
    { id: "groceries", icon: "🍎", name: "Groceries" },
  ],
  "Office": [
    { id: "office-improvement", icon: "🔧", name: "Office improvement" },
    { id: "office-supplies-expenses", icon: "🖇", name: "Office supplies & expenses" },
    { id: "rent", icon: "🏢", name: "Rent" },
  ],
  "Other": [
    { id: "business-insurance", icon: "📋", name: "Business insurance" },
    { id: "postage-shipping", icon: "📦", name: "Postage and shipping" },
    { id: "uncategorized", icon: "❓", name: "Uncategorized" },
  ],
  "Wages": [
    { id: "employee-wages-contract-labor", icon: "💰", name: "Employee wages & contract labor" },
  ],
  "Income": [
    { id: "client-projects", icon: "💼", name: "Client Projects" },
    { id: "recurring-revenue", icon: "🔄", name: "Recurring Revenue" },
    { id: "consulting", icon: "🎯", name: "Consulting" },
    { id: "product-sales", icon: "🛍️", name: "Product Sales" },
    { id: "service-fees", icon: "⚙️", name: "Service Fees" },
    { id: "licensing", icon: "📜", name: "Licensing" },
    { id: "commission", icon: "💵", name: "Commission" },
    { id: "grants-funding", icon: "🏦", name: "Grants & Funding" },
    { id: "investment-income", icon: "📈", name: "Investment Income" },
    { id: "other-income", icon: "💰", name: "Other Income" },
  ],
};
