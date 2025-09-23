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

## Technology

The Trading Cockpit is based on the JavaScript Framework [OpenUI5](https://openui5.org/).

## Deployment

Create a new folder *trading-cockpit-frontend* in the *webapps* folder of your WebServer. 
Then copy all files and folders from the projects *webapp* folder into the newly created folder of the WebServer.
[Apache Tomcat](https://tomcat.apache.org/) has been used during development of the application.

The *index.html* file is set up in a way that requires a local [UI5 runtime environment](https://openui5.org/releases/) in the folder *resources* of the base directory of your *trading-cockpit-frontend*.
The advantage of that configuration is that it reduces the loading time of the application because no runtime information has to be loaded from the web.
Additionally it allows you to work offline. The current version of the application uses the OpenUI5 runtime version 1.120.18.

If you instead prefer to load the runtime information directly from the web, then change the `src` Attribute of the `Script` Statement in the *index.html* file as follows:
`src="https://ui5.sap.com/resources/sap-ui-core.js"`. 
In that case you don't need to set up the *resources* folder of the WebServer with the OpenUI5 runtime environment.
An active internet connection is required then.

## License

Copyright © 2022-2025, [MiRitter87](https://github.com/MiRitter87). No License.