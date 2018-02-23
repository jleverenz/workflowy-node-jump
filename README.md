A [WorkFlowy][wf] user script implementing a "jump to node" pop-up menu with autocompletion.

&#x2318;-J / CTRL-J to activate.

This should be considered _alpha_ state software. Developed for Chrome with [Violentmonkey][vm] on macos & Windows.

[vm]: https://violentmonkey.github.io/get-it/
[wf]: https://workflowy.com/

## Development

The entire script is maintened as a node package and then webpacked for
deployment as a single minified script.

To get started:

    npm install
    npm test
    npx webpack --watch

This will generate a `wf-node-jump.user.js` file. Enable Violentmonkey's [local file installation option][2], and install this file. `webpack --watch` will recompile changes during dev, and Violentmonkey will use the latest.

The [lunr](https://lunrjs.com/) package is used for node indexing and searching.

[2]: https://violentmonkey.github.io/2017/03/14/How-to-edit-scripts-with-your-favorite-editor/