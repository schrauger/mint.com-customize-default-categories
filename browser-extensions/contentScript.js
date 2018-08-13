// This function is needed for the actual script to access window.anyvariable (in particular, mint.com's verion of jQuery)
function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
injectScript( chrome.extension.getURL('/mint.com_customize_default_categories.user.js'), 'body');

