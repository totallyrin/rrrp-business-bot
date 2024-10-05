# RRRP Business Bot

Discord bot for keeping track of RRRP businesses.

# Features

- Inactivity timer (default set to 2 weeks) checks and issues warnings and seizures every day
- Open/close commands that issue messages and update timer
- Commands have permissions!
  - Owners of a business can edit their business and add/remove images
  - Employees (and owner) can open and close a business
  - Specified roles can be given access to all commands

# Commands
- `/addbusiness [name] [type] [owner]*` - Creates a new business in the DB with given name, type, and optional owner (defaults to `NULL`)
- `/deletebusiness [name]` - Deletes a specific business
- `/editbusiness`
  - `/editbusiness name [name] [newname]` - Renames an existing business
  - `/editbusiness owner [name] [newowner]` - Set a new owner of the business
- `/addemployee [business] [employee]` - Adds a user as an employee of a business
- `/removeemployee [business] [employee]` - Removes a user from a business
- `/addimage`
  - `/addimage open [name] [image]` - Adds an 'open' image to a business
  - `/addImage closed [name] [image]` - Adds a 'closed' image to a business
- `/removeimage`
  - `/removeimage open [name]` - Removes a business' 'open' image
  - `/removeimage closed [name]` - Removes a business' 'closed' image
  - `/removeimage both` - Removes both images from a business
- `/open` - Displays an 'Open for Business' message
- `/closed` - Displays a 'Closed for Business' message
- `/warn` - Issues an inactivity warning to a business (notifies business owner)
- `/unwarn` - Remove an inactivity warning from a business (useful if you want to give them multiple warning chances)
- `/seize` - Seize a business (remove owner and employees)

# Installation

1. Download (NodeJS and this code)
2. Install packages using `npm i`
3. Create a file named `.env`. Use the following, and fill in the file:
```
APP_ID=
DISCORD_TOKEN=
PUBLIC_KEY=
CLIENT_ID=
GUILD_ID=
```
4. Fill in roles and channels in `config.js`
5. Register commands by running `node --env-file=.env deploy-commands.js`
6. Start the bot by running `node --env-file=.env index.js`
