# tic-tac-toe-challenge

Play Tic Tac Toe.

NOTE: I made slight changes to the repo structure, e.g. `assets` and `test` are now within the `src/` folder. This is because it's necessary for any code/assets to be within the `src/` folder in a standard React app.

## Project Structure

This is a React app bootstrapped with [Create React App](https://github.com/facebook/create-react-app) written in TypeScript. It displays a web interface which allows you to play Tic Tac Toe against a computer player. The code is organized as a pretty standard React application:

    .
    ├── ...                   # Other project config files/folders
    ├── src                   # Main source folder
    │   ├── test              # Unit tests folder
    │   ├── tools             # Utils and helpers folder
    │   ├── ui                # Folder for UI components
    │   └── App.tsx           # Main App file
    ├── package.json
    └── README

## Local Development

Clone the repo and run `yarn start`. These additional commands are also available:

```sh
# Run an app build
$ yarn build

# Run TypeScript compiler
$ yarn tsc

# Run Prettier checks
$ yarn prettier

# Run ESLint checks
$ yarn eslint

# Run unit tests
$ yarn test

# Run all checks
$ yarn test:all
```
