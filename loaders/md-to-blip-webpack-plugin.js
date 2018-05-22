const fs = require('fs');
const path = require('path');
const marked = require('marked');

function MDToBlipWebpackPlugin() { };

function MDToBlipWebpackPlugin(options) {
    this.folder = options.folder;
}

MDToBlipWebpackPlugin.prototype.apply = function (compiler) {
    //now you have access to all the compiler instance methods
    compiler.plugin('emit', function (compilation, callback) {
        const testFolder = path.join(compiler.context,this.folder);

        var blips = [];

        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                var fileLocation = path.join(testFolder, file);
                compilation.fileDependencies.push(fileLocation);
                var delim = "---";
                var delimLength = delim.length;
                var text = fs.readFileSync(fileLocation, 'utf8');
                var startOfBlock = text.indexOf(delim);
                var endOfBlock = text.indexOf(delim, startOfBlock + delimLength + 1);
                var block = text.substring(startOfBlock+delimLength, endOfBlock).trim();
                var someBlip = {};

                var attrs = block.split("\n");
                attrs.forEach(attr => {
                    var trimmedAttr = attr.trim();
                    var key = trimmedAttr.substring(0, trimmedAttr.indexOf(":"));
                    var value = trimmedAttr.substr( trimmedAttr.indexOf(":") + 1).trim();
                    someBlip[key] = value;
                });

                var descBlock = text.substr(endOfBlock + delimLength).trim();
                someBlip["description"] = marked(descBlock);
                blips.push(someBlip);
            });
            
            var stringifiedBlips = JSON.stringify(blips);

            // Insert this list into the Webpack build as a new file asset:
            compilation.assets['data.json'] = {
                source: function () {
                    return stringifiedBlips;
                },
                size: function () {
                    return stringifiedBlips.length;
                }
            };
            callback();
        })
    }.bind(this));
}
module.exports = MDToBlipWebpackPlugin;
