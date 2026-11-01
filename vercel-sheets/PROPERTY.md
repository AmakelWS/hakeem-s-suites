# Hakeem’s Suites property configuration

Location: Buea, Cameroon. Currency: Central African CFA franc (XAF / FCFA). Property time zone: `Africa/Douala`.

Inventory and rates were supplied by the owner in this chat on October 31, 2026. Only explicitly listed units are configured. Each reservation covers one whole apartment or studio.

| Type | Units | Nightly rate |
| --- | --- | --- |
| Studio | 2C, 3C, 4C | 50,000 FCFA |
| Apartment | 1A, 2A, 2B, 2D, 3A, 3B, 3D, 4A, 4B, 4D, 5A, 5D | 80,000 FCFA |

Each apartment has two bedrooms, two bathrooms, an open kitchen, dining space and living room. Bedrooms are not independently bookable. The system contains 15 units in total: 12 apartments and 3 studios. It does not invent additional units from the general floor-layout description.

The total is the unit’s nightly rate multiplied by calendar nights, excluding the checkout date. New bookings take their rate from the workbook. Each booking stores its agreed nightly rate so later inventory-price changes do not alter existing stays. Date changes retain that rate; moving to a different unit uses the destination unit’s current rate. The backend rejects a submitted total inconsistent with the applicable rate. Tax, extra-person charges, discounts and other fees have not been specified and are not added.

Guest capacities have not been confirmed. Existing source code contained only sample capacities, so actual inventory leaves `capacity` blank rather than treating those defaults as business rules. The system prevents overlapping whole-unit stays; it does not yet enforce a guest-count limit.

The supplied Google Sheet is the intended source for live inventory. `public/property.js` supplies local demo inventory, and `initializeBookings` in `google/BookingGateway.gs` supplies the matching initial setup. That initializer creates Rooms and Bookings without replacing original sheets and refuses to overwrite existing integration tabs. Actual Google Sheet initialization and readback remain pending account access.

Currency reference: [BEAC exchange rates use XAF](https://beac.int/). This is the standard code used in software for the user’s stated CFA-franc currency.
