# RRRP Business Bot

Discord bot for keeping track of RRRP businesses.

# Features

- Inactivity timer (default set to 2 weeks) checks and issues warnings and seizures every day
- Open/close commands that issue messages and update timer
- Commands have permissions!
    - Owners of a business can edit their business and add/remove images
    - Employees (and owner) can open and close a business
    - Specified roles can be given access to all commands
- Channel-specific messaging
- Logging

# Commands

- `/addbusiness [name] [type] [owner]*` - Creates a new business in the DB with given name, type,
  and optional owner (defaults to `NULL`)
- `/deletebusiness [name]` - Deletes a specific business
- `/editbusiness`
    - `/editbusiness name [name] [newname]` - Renames an existing business
    - `/editbusiness owner [name] [newowner]` - Set a new owner of the business
- `/addemployee [business] [employee]` - Adds a user as an employee of a business
- `/removeemployee [business] [employee]` - Removes a user from a business
- `/addimage`
    - `/addimage open [name] [image]` - Adds an 'open' image to a business
    - `/addimage closed [name] [image]` - Adds a 'closed' image to a business
- `/removeimage`
    - `/removeimage open [name]` - Removes a business' 'open' image
    - `/removeimage closed [name]` - Removes a business' 'closed' image
    - `/removeimage both` - Removes both images from a business
- `/open` - Displays an 'Open for Business' message
- `/closed` - Displays a 'Closed for Business' message
- `/businesses` - Displays a list of all businesses (paginated)
- `/employees [business]` - Displays a list of all employees of a business
- `/warn` - Issues an inactivity warning to a business (notifies business owner)
- `/unwarn` - Remove an inactivity warning from a business (useful if you want to give them multiple
  warning chances)
- `/seize` - Seize a business (remove owner and employees)

# Installation

1. Download (NodeJS and this code)
2. Install packages using `npm i`
3. Set up Google Cloud Storage (for image hosting) and download the key file as `.json`
4. Create a file named `.env`. Use the following, and fill in the file:

```
APP_ID=
DISCORD_TOKEN=
PUBLIC_KEY=
CLIENT_ID=
GUILD_ID=

GOOGLE_APPLICATION_CREDENTIALS=
BUCKET_NAME=
```

(`GOOGLE_APPLICATION_CREDENTIALS` is the path to your `.json` key file)

5. Fill in role and channel IDs in `config.js`. Any roles added (you can add more or fewer than those listed by default!) will have 'elevated' permissions, e.g. be able to add/remove businesses, issue warning and seizures
6. Register commands by running `node deploy-commands.js`
7. Start the bot by running `node index.js`

Note: Once the bot has run for the first time, change `CreateDB` in `config.js` to `false`. If
you don't change it to `false`, the database will be reset every time.

If you do ever need to reset the database, change `CreateDB` to `true` and restart the bot. Then,
don't forget to change it back to `false` again!

# Gallery

### Automated warnings and seizure

![image](https://github.com/user-attachments/assets/09c6d967-88cc-4e7b-b808-b8768a5eb2e8)

### Open/close functionality

![image](https://github.com/user-attachments/assets/27a8781b-bd11-4c7b-a715-4e67fa5dc5d2)
![image](https://github.com/user-attachments/assets/93dbedfb-40fe-4be4-b2ff-61471f01553b)

### Logging

![image](https://github.com/user-attachments/assets/645085e0-2fba-467f-829e-f3604d81c482)
