# trading-cockpit-frontend
Frontend of the Trading Cockpit application.

## Features
The frontend provides you with views for creation, editing, display and overview of the following business objects.

- Price Alerts
- Instruments
- Lists
- Scans

Some business objects have additional views like Price Alert (Feed) and Scans (Results).

### Price Alerts
A price alert notifies you if the price of a stock reaches a certain threshold. There are two types of alerts. One type informs you if a price is equal or higher than your defined price. The other type informs you if the price is equal of lower than your defined price.

### Instruments
Here you can manage all instruments that you later want to use for the stock screener functionality.

### Lists
Lists allow you to organize sets of instruments. The list feature allows you for example to reproduce ETFs or stock indexes. Lists are used by the Scan functionality to scan and screen all instruments of multiple lists.

### Scans
Scans consist of multiple lists that contain instruments. Scans are executed from the Scan Overview. The scan 'status' and 'percent completed' attributes inform you about the progress of the scan. 
Once a scan has been finished you can view the results in the Scan result view. The table shows instruments with their indicator values. You can sort the list by RS number and distance to 52 week high by clicking on the 'sort' button.
Each table row provides a button that allows you to open a chart for the given instrument.

The scan result view offers two templates. The default template 'all' loads all scanned instruments. The 'Minervini Trend Template' only loads the instruments that are in a stage 2 uptrend.

## Technology

The Trading Cockpit is based on the JavaScript Framework [OpenUI5](https://openui5.org/).

## Installation

Just put the files of the projects 'webapp'-folder into the 'webapps'-folder of your WebServer. [Apache Tomcat](https://tomcat.apache.org/) has been used during development of the application.
