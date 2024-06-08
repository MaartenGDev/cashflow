# Cashflow

Application to get insights into expenses and income based on transaction exports from banks.

It takes salary paydays into account to show a more realistic picture of the money spend.

## Setup
1. Create a json file named `mapping.json` at `src/assets/mapping.json`
2. Configure the mapping between account and category in `mapping.json`, an example:
```
{
  "$schema": "./mapping-schema.json",
  "mapping": {
    "TickingMachine AMS": "PublicTransport",
    "MyFashionStore": "Shopping",
  }
}
```
3. Run npm start
4. Import a CSV export with transactions

## Screenshots

#### Upload transactions export
![Transactions upload](./docs/import.png)

#### Expenses overview
![Expenses Overview](./docs/expenses_overview.png)

#### View transactions by month
![Category details](./docs/category_details.png)

#### View transactions without a category
![Unknown category](./docs/unknown_category.png)

#### View history per category
![Track history expenses](./docs/track_history_expenses.png)

#### Income overview
![Income overview](./docs/income.png)

#### Totals by month
![Totals](./docs/totals.png)
