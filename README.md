# Node.JS Website Builder

This tool allows you to build a website by performing a certain number of tasks called modules.


## Usage

```javascript
const builder = require('@deskeen/web-builder')

await builder.build({
  source: [
    // Either a file or a directory
  ],
  modules: [
    // Either:
    // A module name
    'module-name',
    // OR
    // An array containing the module name and the module options
    ['module-name-with-options', {  }],
    // OR
    // A custom function (See "Create your own modules" chapter)
    moduleFunction,
  ],
  log: false,
})
```

The `build` function accepts the following properties:
- `source`: a list of files or directories that will be passed to the modules.
- `modules`: a list of modules. A module can be a module name, an array containing a module name and the module options, or a function. If you add a module name, make sure to add it to to the `package.json` file and install it beforehand. If you want a function, please read the *Create your own modules* chapter.
- `log`: Whether logs are shown.

A `writeFile(filepath, data)` function is also available.


## Available Modules

- [rename-files](https://github.com/deskeen/web-builder-rename-files): Change the path or the names of the files. *Useful if you would like to move the output files to a deploy directory for example.*

- [replace-constants](https://github.com/deskeen/web-builder-replace-constants): Replace tags with fixed values. *Useful if you would like to replace certain values like the Hostname for example.*

- [inline-sass](https://github.com/deskeen/web-builder-inline-sass): Replace tags with the content of a SASS file.

- [inline-svg](https://github.com/deskeen/web-builder-inline-svg): Replace tags with the content of a SVG file.

- [inline-json](https://github.com/deskeen/web-builder-inline-json): Replace tags with the content of a JSON file.

- [inline-markdown](https://github.com/deskeen/web-builder-inline-markdown): Replace tags with the content of a Markdown file.

- [create-sitemap-xml](https://github.com/deskeen/web-builder-create-sitemap-xml): Create a sitemap.xml file.

- [create-sitemapindex-xml](https://github.com/deskeen/web-builder-create-sitemapindex-xml): Create a sitemapindex file.

- [create-robots-txt](https://github.com/deskeen/web-builder-create-robots-txt): Create a robots.txt file.

- [minify-html](https://github.com/deskeen/web-builder-minify-html): Minify HTML files.

- [add-hash-filename](https://github.com/deskeen/web-builder-add-hash-filename): Add file hash to file name. *Useful if you would like to cache assets.*


## Create your own modules

You can create your own modules and perform custom tasks by passing functions instead of package names.

`function (sourceMap, opt, lib)`

Three parameters will be passed to your module/function:
- `sourceMap`: A [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object contaning the file path (i.e. `/path/filename.xyz`) as key and the content of the file as value provided by the user.
- `opt`: An object containing the options also provided by the user.
- `lib`: An object containing useful functions provided by the engine.

Three functions are included in the `lib` object:

- `getTag(tagName, tagValue)`: Returns a tag name, i.e. `{{tagName:tagValue}}`.
- `getTagList(tagName, text)`: Returns the list of tags included in a text (typically the file content).
- `findAsset(filename, directoryList)`: Find a specific filename in a list of directories.
- `log(text)`: Log text (if the user turned it on). 


## Example of module

Imagine your project contains JSON files that you would like to minify. You can create a module to do that:

```javascript
const minifyJson = (fileMap, opt, { log }) => {
  // Loop through all the files provided by the user
  for (const [path, content] of fileMap.entries()) {

    // If file is a JSON file...
    if (path.endsWith('.json')) {
      // ...Replace the content of the file with a minified version
      fileMap.set(path, JSON.stringify(JSON.parse(content)))

      // Use the log function provided by the engine to log useful informations
      log(`Minify JSON file: ${filepath}`)
    }
  }
}
```

You JSON-minifier module can then be added to the list of modules:

```javascript
const builder = require('@deskeen/web-builder')

await builder.build({
  source: [
    '/www/html/index.html',
    '/www/data/data.json',
  ],
  modules: [
    minifyJson
  ]
})
```

For more concrete examples, you can have a look at the source files of the existing modules.


## Contact

You can reach me at {my_firstname}@{my_name}.fr


## Licence

MIT Licence - Copyright (c) Morgan Schmiedt