# Flight Booker Autofill Chrome Extension

This extension adds a floating button to booking pages on **Ryanair** and **WizzAir**. Clicking the button fills passenger and contact information with test data.

## Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `autofill-extension` folder.

## Usage
Visit a booking page on `ryanair.com` or `wizzair.com`. A **Fill Passenger Info** button will appear in the bottom-right corner of the page. Clicking it fills the passenger forms with test data. On Ryanair, the script specifically targets fields with `data-ref` attributes used for passenger details and contact information. On WizzAir, it falls back to common field names.

The extension uses placeholder test data that can be modified in `content.js`.
