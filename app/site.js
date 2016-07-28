// Simple wrapper exposing environment variables to rest of the code.

import jetpack from 'fs-jetpack';

// The variables have been written to `env.json` by the build process.
var site = jetpack.cwd(__dirname).read('site.json', 'json');

export default site;
