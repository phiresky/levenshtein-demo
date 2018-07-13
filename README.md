# Levenshtein Demo

This repository contains the Levenshtein distance demonstration program for the lecture “Kognitive Systeme” at the [Interactive Systems Lab (ISL)](http://isl.anthropomatik.kit.edu/english/) at the [Karlsruhe Institute of Technology](https://kit.edu).

The demo runs completely client-side in the browser. The `index.html` file in the `gh-pages` branch is directly runnable. [A hosted version is available here](https://phiresky.github.io/levenshtein-demo/).


## Building

Written using [TypeScript](http://www.typescriptlang.org/) + [React](https://facebook.github.io/react/).

* Run `yarn` once to get the dependencies
* Run `git worktree add dist/ gh-pages` once to set up the github pages branch
* Run `yarn run dev`, then open <http://localhost:1234> for the dev server
* Run `yarn run build` to build the production version into the folder `dist`