export enum TransactionCategory {
  Streaming = "Streaming",
  Investing = "Investing",
  Food = "Food",
  NonEssentialFood = "NonEssentialFood",
  VVE = "VVE",
  Insurance = "Insurance",
  Mortgage = "Mortgage",
  Internet = "Internet",
  Shopping = "Shopping",
  Transportation = "Transportation",
  HouseItems = "HouseItems",
  Hobby = "Hobby",
  Clothing = "Clothing",
  Sport = "Sport",
  Tax = "Tax",
  Income = "Income",
  CreditCard = "CreditCard",
  InternalMoneyTransfer = "InternalMoneyTransfer",
  Health = "Health",
  Entertainment = "Entertainment",
  Gifts = "Gifts",
  Traveling = "Traveling",
  Other = "Other",
}

export const TransactionDescriptionToCategoryMap: Record<string, TransactionCategory> = {
  "WE Fashion": TransactionCategory.Shopping
};
