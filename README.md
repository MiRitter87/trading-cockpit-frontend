# trading-cockpit-frontend
Frontend of the Trading Cockpit application.

## Features
The frontend provides you with views for creation, editing, display and overview of the following business objects.

- Price Alerts
- Instruments
- Lists
- Scans

Some business objects have additional views like Price Alert (Feed) and Scans (Results). Additionally there is a Dashboard which provides access to statistical data and charts.

### Price Alerts
A price alert notifies you if the price of a stock reaches a certain threshold. There are two types of alerts. One type informs you if a price is equal or higher than your defined price. The other type informs you if the price is equal of lower than your defined price.

### Instruments
Here you can manage all instruments that you later want to use for the stock screener or price alert functionality.

### Lists
Lists allow you to organize sets of instruments. The list feature allows you for example to reproduce ETFs or stock indexes. Lists are used by the Scan functionality to scan and screen all instruments of multiple lists.

### Scans
Scans consist of multiple lists that contain instruments. Scans are executed from the Scan Overview. The scan 'status' and 'percent completed' attributes inform you about the progress of the scan. 
Once a scan has been finished you can view the results in the Scan result view. The table shows instruments with their indicator values. You can sort the list by multiple indicators by clicking on the 'sort' button.
Each table row provides a button that allows you to open a chart for the given instrument. Indicator columns can be set to visible or invisible according to your needs.

The scan result view offers six templates.

- All (Default template, loads all scanned instruments)
- Minervini Trend Template (Instruments in a Stage 2 uptrend)
- Volatility Contraction - 10 Days (Instruments that show narrow price action and below average volume during the last 10 trading days)
- Breakout Candidates (Instruments consolidating near their 52 week highs on low volume and below average volume)
- Up on Volume (Instruments gaining more than 10% on at least 25% increased volume during the last 5 trading days)
- Down on Volume (Instruments losing more that 10% on at least 25% increased volume during the last 5 trading days)

### Dashboard
The Dashboard aims to provide a meta overview of the current state of the market. Currently there are two views: Statistics and Charts.

The statistics view provides the number of advancing and decline stocks for each trading day as well as the advance / decline differential.

The charts view displays a chart of the cumulative advance/decline number.

## Technology

The Trading Cockpit is based on the JavaScript Framework [OpenUI5](https://openui5.org/).

## Installation

Just put the files of the projects 'webapp'-folder into the 'webapps'-folder of your WebServer. [Apache Tomcat](https://tomcat.apache.org/) has been used during development of the application.

## License

Copyright © 2022, [MiRitter87](https://github.com/MiRitter87). No License.