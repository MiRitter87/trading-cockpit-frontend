# trading-cockpit-frontend
Frontend of the Trading Cockpit application. The application provides the user interface for the [Trading Cockpit Backend](https://github.com/MiRitter87/trading-cockpit-backend).

## Features
The frontend consists of several feature packages. First, it enables a master data management of the following business objects.

- Price Alerts
- Instruments
- Lists
- Scans

Additionally, there is a view to filter instruments using a multitude of criteria. There are also nearly a dozen charts to be explored.
Statistical market information are provided via the dashboard. There is also a knowledge-based system accessible that gauges the health of instruments.
You can learn more details about the features in the following paragraphs.

### Price Alerts
A price alert notifies you if the price of a stock reaches a certain threshold. There are two types of alerts. One type informs you if a price is equal or higher than your defined price. The other type informs you if the price is equal of lower than your defined price.
An E-Mail address can be defined optionally. In case of a triggered alert, an information is send to the defined recipient.

The Feed view cyclically queries all price alerts that have been triggered but not yet confirmed. You can confirm each price alert in the feed. It vanishes from the feed after confirmation. 
A sound is played cyclically if any price alert has been triggered and not yet confirmed.

### Instruments
Here you can manage all instruments that you later want to use for the stock screener or price alert functionality.

There is an additional function called instrument health check. In this view you can choose an Instrument, a profile and a starting date for the health check. 
The application then checks the price and volume behavior of the instrument and displays a protocol allowing you to gauge the health of the instrument.
This function is only available if you have previously gathered quotation data using the scanner.

An instrument can be linked to a sector or industry group.
You can choose a list as data source for instruments of type sector, industry group or ETF. In this case, the quotations of the instrument are
calculated locally using all instruments and their quotations of the referenced list. This happens during the scan process.

The backend my be configured to use investing.com as data source for current quotations. In this case, the text input "company path investing" has to be defined. 
If you are for example configuring the instrument of Amazon, the URL of investing.com may be "https://www.investing.com/equities/amazon-com-inc".
The text input "company path investing" then has to be filled with "amazon-com-inc". 

### Lists
Lists allow you to organize sets of instruments. The list feature allows you for example to reproduce ETFs or stock indexes. Lists are used by the scan functionality to scan and screen all instruments of multiple lists.
Lists are also used for the generation of statistical charts. Those charts are generated for all instruments of a list.

The list overview provides a functionality to generate Excel files with the most recent instrument information. The file contains the following data of all instruments of the selected list:
- Symbol
- Date
- Price
- RS Number
- Average True Range Percent

### Scans
Scans consist of multiple lists that contain instruments. Scans are executed from the scan overview. The scan 'status' and 'percent completed' attributes inform you about the progress of the scan. 
The scanner detects instruments for which the data retrieval failed. The number of instruments for which the scan failed is being displayed in the overview.
You can restart a scan and only query those instruments for which the scan process failed the last time.

Once a scan has been finished you can view the results in the scan result view. The table shows instruments with their indicator values. You can sort the list by multiple indicators by clicking on the 'settings' button.
Additionally indicator columns can be set to visible or invisible according to your needs. 
Each table row provides a button that allows you to open a chart for the given instrument. You can also click on a symbol to open a short-term chart.

There is also a function to compare a list of instruments. You can choose instruments by clicking on the scale button and then selecting instruments from the list Pop-up. This helps you to directly compare only those instruments you are interested in.

The scan result view currently offers 15 templates.

- All (Default template, loads all scanned instruments)
- Buyable Base (Instruments in a short-term uptrend consolidating on low volatility and below average volume)
- Breakout Candidates (Instruments consolidating near their 52 week highs on low volatility and below average volume)
- Volatility Contraction - 10 Weeks (Instruments that show narrow price action and below average volume during the last 10 weeks)
- Volatility Contraction - 10 Days (Instruments that show narrow price action and below average volume during the last 10 trading days)
- High Tight Flag (Instruments consolidating at max 25% off it's high after a 100% gain within 8 weeks)
- Three Weeks Tight (Instruments with at least three  weekly closing prices in a +/- 1.5% range)
- Minervini Trend Template (Instruments in a Stage 2 uptrend)
- Swingtrading Environment (Instruments, which SMA(10) is above SMA(20), both rising. Additionally price is above SMA(20))
- RS-Line near 52-week High (Instruments for which the RS-Line using an instruments industry group is within 5% of its 52-week high)
- RS since Date (All scanned instruments, calculates RS number since the given date)
- Up on Volume (Instruments gaining more than 10% on at least 25% increased volume during the last 5 trading days)
- Down on Volume (Instruments losing more that 10% on at least 25% increased volume during the last 5 trading days)
- Near 52-week High (Instruments trading within 5% of their 52-week high)
- Near 52-week Low (Instruments trading within 5% of their 52-week low)

### Dashboard
The Dashboard aims to provide a meta overview of the current state of the market. Statistical values for each trading day are provided in a tabular form.
The following statistical values are provided:

- Number of instruments
- Gainers/Losers differential
- Number of advancing instruments
- Number of declining instruments
- Percentage of instruments trading above SMA(50)
- Percentage of instruments trading above SMA(200)
- Number of instruments trading up on above-average volume
- Number of instruments trading down on above-average volume
- Number of instruments showing a bullish reversal
- Number of instruments showing a bearish reversal
- Number of instruments that are churning

The dashboard also provides a view to determine the status of the current market health. In this view you can select a sector or industry group. The following metrics are calculated then:

- RS Number
- Up/Down Volume Ratio
- Number of Distribution Days
- Aggregate Indicator
- Status of the Swingtrading Environment
- Number of stocks near 52-week high and low
- Number of stocks that traded up or down on volume (5 day sum)

### Charts
The application provides a multitude of charts that are grouped in statistical, price/volume and other charts.

#### Statistical
- The cumulative advance/decline number for the overall database as well as selected lists
- The percentage of instruments trading above the SMA(50) for the overall database as well as selected lists
- The percentage of instruments trading above the SMA(200) for the overall database as well as selected lists
- The Ritter Market Trend for the overall database as well as selected lists
- The Ritter Pattern Indicator for the overall database as well as selected lists

#### Price/Volume
- A candlestick chart that can be customized with multiple moving averages, indicators as well as horizontal lines
- A candlestick chart with annotations for Distribution Days for ETFs, sectors and industry groups
- A candlestick chart with annotations for Follow-Through Days for ETFs, sectors and industry groups
- A candlestick chart with annotations for Pocket Pivots for all instruments
- A candlestick chart with annotations for events related to the health check

### Other
- A chart displaying the Aggregate Indicator of a sector or industry group

## Technology

The Trading Cockpit is based on the JavaScript Framework [OpenUI5](https://openui5.org/).

## Deployment

Create a new folder *trading-cockpit-frontend* in the *webapps* folder of your WebServer. 
Then copy all files and folders from the projects *webapp* folder into the newly created folder of the WebServer.
[Apache Tomcat](https://tomcat.apache.org/) has been used during development of the application.

The *index.html* file is set up in a way that requires a local [UI5 runtime environment](https://openui5.org/releases/) in the folder *resources* of the base directory of your WebServer.
The advantage of that configuration is that it reduces the loading time of the application because no runtime information has to be loaded from the web.
Additionally it allows you to work offline. The current version of the application uses the OpenUI5 runtime version 1.120.18.

If you instead prefer to load the runtime information directly from the web, then change the `src` Attribute of the `Script` Statement in the *index.html* file as follows:
`src="https://ui5.sap.com/resources/sap-ui-core.js"`. 
In that case you don't need to set up the *resources* folder of the WebServer with the OpenUI5 runtime environment.

## License

Copyright © 2024, [MiRitter87](https://github.com/MiRitter87). No License.