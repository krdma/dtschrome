# Flight Booker Autofill Chrome Extension

This extension adds a floating button to booking pages on **Ryanair**, **WizzAir** and **Hotelston**. Clicking the button fills passenger data with test information. On Ryanair and WizzAir the contact fields are also completed, while on Hotelston only passenger names are filled.

## Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `autofill-extension` folder.

## Usage
Visit a booking page on `ryanair.com`, `wizzair.com` or `hotelston.com`. A small panel with an **Order ID** field and a **Fill Passenger Info** button will appear in the bottom-right corner of the page. Enter an order number if you have one and press the button. The extension will fetch booking data from `https://cp.gth.com.ua/plugin/getdata?id=<ORDER_ID>` before filling the forms. If no order ID is provided the placeholder test data is used. On Ryanair, the script selects title and gender dropdowns as if a user interacted with them. The script targets the `data-ref` fields for passenger details and contact information. On WizzAir and Hotelston it falls back to common field names. The Hotelston script intentionally leaves the contact fields blank.

The extension uses placeholder test data that can be modified in `common.js`.
Five sample passengers are defined (three adults and two children). When the
**Fill Passenger Info** button is clicked, the script fills up to five passenger
forms with these unique details. Contact information is taken from the first
adult passenger.

## Restricting the Generic Button
The file `generic.js` injects a floating button on any page that the extension
is loaded on. To limit this behaviour to specific sites, edit the
`allowedDomains` array at the top of `generic.js` and include the host names you
want to support. If the current page's hostname does not match any value in
`allowedDomains`, no button is shown.

The script also checks for fields with full name attributes like
`form.passengers.ADT-0.name` and fills them directly, dispatching a `change`
event after setting the value.

## Publishing to the Chrome Web Store

To publish the extension:

1. Ensure the `icons` folder contains 16, 32, 48 and 128 pixel PNG files.
2. Bump the `version` field in `manifest.json` as needed.
3. Create a ZIP archive of the entire `autofill-extension` directory.
4. Visit the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard). 
5. Upload the ZIP file and provide screenshots, a description and other required details.
6. Submit the extension for review.
