# tic-tac-toe-challenge

Play Tic Tac Toe: [https://toe-tac-tic.surge.sh](https://toe-tac-tic.surge.sh/)

**A few comments:**

- I made slight changes to the repo structure, e.g. `assets` and `test` are now within the `src/` folder. This is because it's necessary for any code/assets to be within the `src/` folder in a standard React app.
- This app is not optimized for mobile.
- I used custom TypeScript `Result` and `Option` types which are inspired by the Rust types of the same name. In some situations, this led to more verbose code, however I wanted to do this a) to get some more practice using these and b) because they do a great job of guaranteeing type safety.
- The minimax algorithm is (I think) the most common/primary implementation, adapted here to work with the specific implementation of this Tic Tac Toe game.

## Project Structure

This is a React app bootstrapped with [Create React App](https://github.com/facebook/create-react-app) written in TypeScript. It displays a web interface which allows you to play Tic Tac Toe against a computer player. The code is organized as a pretty standard React application:

    .
    ├── ...                   # Other project config files/folders
    ├── src                   # Main source folder
    │   ├── test              # Unit tests folder
    │   ├── tools             # Utils and helpers folder
    │   └── App.tsx           # Main App file
    ├── package.json
    └── README

## Getting Started

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
$ yarn test:unit

# Run all checks
$ yarn test:all
```
