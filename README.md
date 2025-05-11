> [!CAUTION]
> No longer maintained, untested in modern Chrome versions.
>
> I don't think this is a good idea anymore. Like just make a native app.

# Chrome TCP Extension

## Features
- TCP client socket
- TCP Server (planned to be implemented, not implemented yet)
- Promise based, simple to use api (kind of implemented in `example/tcpApi.ts`, but an npm package for this isn't published yet)

## Installing
### Windows
- Make sure you have [Node.js](https://nodejs.org) installed and the `node` command is in your `PATH`
- Download the `chrome-tcp-extension.zip` file from [GitHub Releases](https://github.com/ChocolateLoverRaj/chrome-tcp-extension/releases)
- Unzip
- Go to [chrome extensions (chrome://extensions)](chrome://extensions)
- Make sure you have 'Developer mode' turned on
- Click 'Load unpacked'
- Select the `extension` folder from the folder you unpacked
- Run `native/setupNative.bat`
- It will ask for the chrome extension id. Enter the id that you can see for 'TCP API' in the chrome extensions page.
- You can check if it's working by going to the [demo](#demo) page

### Other
Currently there is no support for non-windows computers, but a pull request for this is welcome.

## Demo
There is a [demo page](https://chocolateloverraj.github.io/chrome-tcp-extension). Note that for it to do anything, you must have the extension installed.

## Developing
### Folders
There are two folders related to the actual extension. `extension` and `native`. The extension folder is a chrome extension. The `native` folder is a program that the chrome extension messages. This is because there is no chrome api for TCP messages, so the native program does the TCP messaging.

### Setup
- Make sure you have [Node.js](https://nodejs.org) installed
- Install dependencies in the `extension` and `native` folders

### Building
- Run `npm run build` in the `extension` folder
- Run `npm run build` in the `native` folder
- To zip the `dist` dir, you can use another tool or run `npm run build` in the `build` dir.

### Installing
Now you'll have a `dist` folder at the top level. This folder is the same one that is released and the next steps are the same as the [normal installation](#installing).

### Testing
- Install dependencies in `example` folder.
- Run `npm start` in the `example` folder.
- Make sure you [build](#building) the files that you change in `native` and `extension` folders. You also need to reload your extension in the chrome extensions page. If you don't want to run `npm run build` repeatedly, you can run `npm run build:code -- -w`. This runs it in watch mode, so that it's built every time you modify files. 
