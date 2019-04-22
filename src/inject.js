/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
function injectScript(file_path, tag, text='') {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    if (text == '') {
        script.setAttribute('src', file_path);
    }
    else {
        script.innerHTML = text;
    }
    node.appendChild(script);
}
injectScript('', 'html', 'var extensionId = "'+chrome.runtime.id+'";');
injectScript(chrome.runtime.getURL('MLBTamperSettingsFramework.library.js'), 'html');
injectScript(chrome.runtime.getURL('MLBTSNCardData.library.js'), 'html');
injectScript(chrome.runtime.getURL('Hotkeys.userscript.js'), 'html');
