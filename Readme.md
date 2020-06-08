# Mokksy

## Fully functional mock JSON server with great extras

This project is work in progress. Feel free to play with it, use for testing or local development, but do not use it on production. Wait for at least 0.1.0 version.

Mokksy is heavily ispired by the [JSON-Server](https://github.com/typicode/json-server).
I started working on it during the late evenings during the global lockdown in 2020 as a "pet" project to tinker with the CLI and play with Typescript.

![Mokksy console screenshot](https://github.com/digitalmio/mokksy/raw/master/docs/ss.png 'Mokksy')

## Installation

The easiest way to enjoy Mokksy is to install it globally. Simply run: `npm install -g mokksy` or `yarn global add mokksy`

Sometimes, depending on your OS, you _might_ need to install package as root/Administrator. On Linux and MacOS you can do it by prefixing the command with `sudo`.

If you don't want to install Mokksy globally, you can install it locally as a Dev dependency: `npm install --save-dev mokksy` or `yarn add -D mokksy`. Then please add a `script` in your `package.json` section, ie: `mokksy: mokksy`. This way you will have access to Mokksy via: `npm run mokksy` or `yarn run mokksy`.

## Getting started, aka. prepaging the database file

After installing the server, you need to create a `db.json` database file (you can call it whatever you like), something like:

```
{
  "posts: [
    {"id": 1, "title": "This is my first post"}
  ],
  "comments": [
    {"id": 1, "postId": 1, "body": "This is the very cool first comment"}
  ],
  "profile": {
    "name": "My Name", "location": "Earth"
  }
}
```

...now you are ready to start the server.

## Starting simple server

At the moment Mokksy supports just one command: `run`.

```
mokksy run db.json
```

This command will run simple server. Mokksy will try to run on port 5000. If this port will be used by other app, Mokksy will find other free port.
You will see all available endpoints printed in the terminal, like in the screenshot at the top of this Readme.

## Customise the server

To check available options, to customise your server, run `mokksy run --help`.
This will print list of available options:

```
mokksy run [options] <sourceFile>

Positionals:
  sourceFile  JSON database file path                                            [string] [required]

Options:
  --help, -h                 Show this help page                                           [boolean]
  --version, -v              Show version number                                           [boolean]
  --port, -p                 Set port                                                [default: 5000]
  --host, -H                 Set host                                         [default: "localhost"]
  --apiUrlPrefix, --api      Prefix the URL path, ie. '/api' for '/api/posts'. Path must start with
                             '/'                                              [string] [default: ""]
  --routes, -r               List of custom routes as JSON key:value. On request of the key route
                             you will be redirected to value.                 [string] [default: ""]
  --idKey, -i                Set database 'ID' key (ie. '_id' for Mongo-like collections)
                                                                            [string] [default: "id"]
  --foreignKeySuffix, --fks  Set foreign key suffix.
                             Ie. '_id' for keys like 'user_id', 'post_id', etc.
                             Default is 'Id' for keys like 'userId', 'postId', etc.  [default: "Id"]
  --staticPath, -s           Set static files directory                 [string] [default: "public"]
  --noStatic, --ns           Disable static file server                   [boolean] [default: false]
  --noCors, --nc             Disable Cross-Origin Resource Sharing        [boolean] [default: false]
  --filtering, -f            Query params filtering type:
                             Inclusive (incl) - when element needs to match all filters.
                             Exclusive (excl) - when the element needs to match just one of the
                             filters.           [string] [choices: "incl", "excl"] [default: "incl"]
  --delay, -d                Add delay to responses (ms)                       [number] [default: 0]
  --noToken, --nt            Disable JWT token endpoint                   [boolean] [default: false]
  --tokenEndpoint, --te      URL for your app to process JWT token requests
                                                                  [string] [default: "/oauth/token"]
  --tokenSecret, --ts        Secret used to sign tokens on token endpoint. This password is VERY
                             weak and should be used for testing purpuses only!
                                                                        [string] [default: "MoKKsy"]
  --tokenExpiry, --tex       Time in seconds for JWT token to expire. 1 hour by default.
                                                                            [number] [default: 3600]
  --protectEndpoints, --pe   Comma separated list of endpoints that needs to be protected by JWT
                             token.
                             By default all endpoints are NOT protected.      [string] [default: ""]
  --template, -t             Template file path to format the response data. No template by default.
                                                                              [string] [default: ""]

Examples:
  mokksy run --nc -p 8080 db.json  Run 'db.json' database on port 8080 and disable CORS.
```

## Data filtering, sorting and pagination

You can use query params to filter, search or paginate the data. We are compatible with JSON-server.
Those query params can be joined togther to narrow down your search.

### Filtering

Simply add query parms coresponding to keys in the collection. You can use `.` operator to access deep keys, check second example.
`GET /posts?title=mokksy`
`GET /posts?author.name=mac`

#### Filtering operators

You can use special operators `_gte` (greater than or equal), `_lte` (lower than or equal), `_ne` (not equal) or `_like` by appending it to the end of the search key:
`GET /posts?id_gte=5`
`GET /posts?id_gte=5&id_lte=10`
`GET /posts?id_ne=5`
`GET /posts?name_like=jo`

### Sorting

Use special query params `_sort` and `_order`.
`GET /posts?_sort=views&_order=asc`

### Pagination

Use special query param `_page` and optional `_limit`. Links to the next pages will be available the the `Link` response header.
`GET /posts?_page=7&_limit=20`

### Slicing

Use special query param `_start`, `_end` or `_limit`. Total count will be available in the `X-Total-Count` response header.

## Display templates

If you don't want to display just a list of plural resources listing, but wrap the resonse, you can use template.
You will need to prepare the template file. Response must be valid JSON Object. Here is some example:

```
{
  "object": "list",
  "clarkKent": "superman",
  "nested": {
    "test": {
      "dateTime": "{{dateTime}}",
      "deeper": {
        "why": {
          "not": {
            "we": {
              "can": {
                "go": {
                  "crazy": {
                    "deep": "{{url}}"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "url": "{{url}}",
  "total": "{{total}}",
  "timestamp": "{{timestamp}}",
  "dateTime": "{{dateTime}}",
  "data": "{{data}}"
}
```

As per example above, you can use some variables, that will be replaced with actual values:

- `{{dateTime}}` will be replaced with current date and time
- `{{url}}` will be replaced with currently requested URL
- `{{total}}` will be replaced with the number reperesenting total number of items in the response
- `{{timestamp}}` will be replaced with Unix timestamp
- `{{data}}` will be replaced with actual key listing

Then, run Mokksy with `-t` switch, for example:

```
mokksy run db.json -t template.json
```

## Token protection and Token endpoint

You can protect the keys from unauthorised access. To do so, please provide the comma-separated list of keys, ie:

```
mokksy run db.json --pe posts,comments
```

will protect all requests to `posts` and `comments` endpoints (get, post, put, delete). You will see 401 error whrn you will try to access `http://localhost:5000/posts` without the token.

### How to get the token?

Token endpoint is available by default at `http://localhost:5000/oauth/token`, but you can customise it.
As Mokksy is a mock solution, our implementation of the server is very simple. JWT tokens are signed using string ('MoKKsy' by default, customisable using `--ts` switch).
To get new token, send data payload as POST request to token endpoint (as JSON), and whole request body will become payload of the JWT token.

```
curl -X "POST" "http://localhost:5000/oauth/token" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "email": "me@example.com",
  "userId": "1"
}'
```

Token is valid 3600 seconds === 1hour.

### How to access the protected resources?

Like in the normal API, add the `Authorization` header with the Bearer token.

```
curl "http://localhost:5000/posts" \
     -H 'Authorization: Bearer {{your-token-goes-here}}'
```

## Static file server

Mokksy can be also used as a static file server. How? Simply create `public` folder and run Mokksy from that directory.
Alternatively, use `-s` switch to set different folder for static files directory.

## CORS

Cross Origin Resource Sharing is enabled by default. It can be disabled using `--nc`.
