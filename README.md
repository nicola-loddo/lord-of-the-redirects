# Lord Of The Redirects

**A Chrome Extension to handle redirects with the manifest v3 api.**

If you, too, feel lost without Redirector, don’t worry!
Lord of the Requests (LOTR) is here to help you create simple redirects.

Currently, the extension is still in beta and supports only redirects for JS files, but new features will be added soon.


### Supported URL Formats
You can use the following formats for URLs:

✅ **Direct URLs**
Use an exact URL to match and redirect a specific request.

Example:
rule: https://example.com/script.js
match only this file: https://example.com/script.js


✅ Wildcard Matching (*)
Use wildcards to match multiple URLs with a common pattern.

Example:

rule: https://\*example.com/scritp.js*
match files like: 
- https://www.example.com/scritp.js
- https://example.com/scritp.js?v=123
