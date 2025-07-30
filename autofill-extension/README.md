# Flight Booker Autofill Chrome Extension

This extension adds a floating button to booking pages on **Ryanair**, **WizzAir** and **Hotelston**. Clicking the button fills passenger and contact information with test data.

## Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `autofill-extension` folder.

## Usage
Visit a booking page on `ryanair.com`, `wizzair.com` or `hotelston.com`. A **Fill Passenger Info** button will appear in the bottom-right corner of the page. Clicking it fills the passenger forms with test data. On Ryanair, the script selects title and gender dropdowns as if a user interacted with them. The script targets the `data-ref` fields for passenger details and contact information. On WizzAir and Hotelston it falls back to common field names.

Each script contains placeholder test data defining five sample passengers (three
adults and two children). When the **Fill Passenger Info** button is clicked, up
to five passenger forms are filled with these unique details. Contact information
is taken from the first adult passenger.

Common helper functions are defined in `common.js` and loaded before each site
script.

The script also checks for fields with full name attributes like
`form.passengers.ADT-0.name` and fills them directly, dispatching a `change`
event after setting the value.
