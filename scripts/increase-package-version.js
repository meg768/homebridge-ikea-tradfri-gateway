var path = require('path');
var fs = require('fs');

function IncreasePackageVersion() {

    function increaseVersion(version) {
        var version = version.split('.');
        version.push(parseInt(version.pop(version)) + 1);
        return version.join('.');
    }

    var versionA, versionB;

    var fileName = path.join(__dirname, '../package.json');
    var package = JSON.parse(fs.readFileSync(fileName));

    versionA = package.version;
    package.version = increaseVersion(package.version);
    versionB = package.version;

    fs.writeFileSync(fileName, JSON.stringify(package, null, '\t'));
    console.log('Increased package version from', versionA, 'to', versionB);

}

IncreasePackageVersion();
