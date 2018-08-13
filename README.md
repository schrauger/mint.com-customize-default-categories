
# Mint.com - Hide Default Categories
This userscript lets you hide default built-in categories in [mint.com](https://www.mint.com).

[//]: # "*generated with [DocToc](http://doctoc.herokuapp.com/)*"
**Table of Contents** 
- [Purpose](#purpose)
- [Screenshots](#screenshots)
	- [Script enabled - custom categories](#script-enabled---custom-categories)
	- [Script disabled - all categories](#script-disabled---all-categories)
	- [Editing Hidden Categories](#editing-hidden-categories)
	- [Visible Categories After Saving](#visible-categories-after-saving)
- [How to Use](#how-to-use)
- [Features](#features)
	- [Hide Sub-Categories and Categories](#hide-sub-categories-and-categories)
	- [Preferences Saved on Mint's Server](#preferences-saved-on-mints-server)
- [Installation Instructions](#installation-instructions)
- [Known Issues](#known-issues)

## Purpose
Mint does not natively let you remove any default categories or sub-categories, although you are free to add and remove any custom sub-categories you want. Since many built-in categories may not be applicable to your financial setup, this creates unnecessary clutter when organizing your transactions. If you don't own a business or do not have kids, for example, there is no logical need to have those options always show up in a list.

This script gives you control over these built-in categories. You can hide any sub-categories and even top-level categories that you do not wish to see.

## Screenshots
[custom]:  https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/images/dropdown-custom.png?raw=true "Customized visible categories"
[all]:     https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/images/dropdown-all.png?raw=true "All categories shown"
[editing]: https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/images/category-edit.png?raw=true "Editing hidden categories"
[visible]: https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/images/category-view.png?raw=true "Customized visible categories"

### Script enabled - custom categories
![Custom categories dropdown][custom]

### Script disabled - all categories
![All categories dropdown][all]

### Editing Hidden Categories
![Editing categories][editing]

### Visible Categories After Saving
![Visible categories][visible]

## How to Use
After the script is installed and enabled, you are able to set your preferences. On the [Transactions page](https://wwws.mint.com/transaction.event), click on the Category dropdown field of the current transaction, hover over any of the top level categories, and click on the sub-category link `Add/Edit Categories`. This is where you would go if you wanted to add a custom category (which Mint lets you do natively).

Click on the top-right link that says `Edit Hidden Categories`. You will then see checkboxes next to each category and sub-category. Place a checkmark in the checkbox of the categories you want to hide. Their text will be crossed out. 

When you have finished going through all the top level categories and choosing your selections, click on the top-right link that says `Save Hidden Categories`. Alternatively, click on the <kbd>I'm done</kbd> submit button.

The categories should now be hidden from the categories dropdown list.

If you want to restore any hidden categories, follow these steps again, removing the checkmark from the previously hidden categories. 

## Features
### Hide Sub-Categories and Categories
Built-in categories can be hidden completely. When hidden, the categories will not show up in the dropdown list of categories, nor in the popup dialog for editing custom categories.

Hidden categories will never modify existing transactions. If a transaction is set to a category that is hidden, the transaction will not change or hide itself. Also, the search box will still autocomplete all categories, and any other page on Mint will still show all categories. This script is merely a client-side change; if you disable the script, all categories will return to their default state.

### Preferences Saved on Mint's Server
Your preferences are saved on Mint's servers, so you only have to set up your choices once. When you install the script on another computer, your preferences will be automatically loaded. If you choose to change your settings later on, the changes will also be updated on your other devices. Your hidden categories will persist across all sessions and computers, and they will remain hidden as long as you are using a computer with this script installed.

Technical Explanation: This script uses 3 custom category fields to save an ASCII bit array. They are saved in the `Uncategorized` category, and they begin with `#!1 `, `#!2 `, and `#!3 `. When the script is installed, they should not be visible. If you do see the fields (on a computer without the script enabled), please do not delete or modify the fields. Doing so will completely mess up your preferences on which categories you want hidden.

## Installation Instructions

The easiest way to install the script is from the [Firefox App Store][firefox_app_url] or the [Chrome App Store][chrome_app_url].

Another way to install the script is to first have [GreaseMonkey][greasemonkey] ([Firefox][gm_firefox]) or [TamperMonkey][tampermonkey] ([Chrome][tm_chrome], [Safari][tm_safari], [Opera][tm_opera]). If you have those addons installed already, simply [open the script][script] and follow the prompts to install it.

There are no differences between the userscript and the native browser extensions. The extension is merely a wrapper of the script.

For more detailed steps, [follow these instructions][instructions] for your particular browser.

[greasemonkey]: http://www.greasespot.net/
[gm_firefox]: https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/
[tampermonkey]: https://tampermonkey.net/index.php
[tm_chrome]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
[tm_safari]: https://tampermonkey.net/index.php?ext=dhdg&browser=safari
[tm_opera]: https://addons.opera.com/en/extensions/details/tampermonkey-beta/
[script]: https://github.com/schrauger/mint.com-customize-default-categories/raw/master/mint.com_customize_default_categories.user.js
[instructions]: http://stackapps.com/tags/script/info
[greasemonkey_issue]: https://github.com/greasemonkey/greasemonkey/issues/2631
[chrome_app_url]: https://chrome.google.com/webstore/detail/mintcom-customize-default/dejgfdkemnimadjmkgicolejmhnkabig
[firefox_app_url]: https://addons.mozilla.org/en-US/firefox/addon/mint-com-customize-categories/

## Known Issues
* Firefox 56 and higher doesn't prompt to install the script when using GreaseMonkey
  * Solution: For now, manually copy and paste the script source into a new script. In GreaseMonkey, click `New user script...`. Delete the default contents of the new file. Then open up the [mint script][script], select the entire text, and copy and paste it into the new script file. It should automatically save, so you can close the tab after pasting.
  * Solution 2: Install [TamperMonkey][tampermonkey] for Firefox. There's [an issue with GreaseMonkey][greasemonkey_issue] that currently prevents GitHub userscripts from showing an installation window, but TamperMonkey doesn't appear affected.
  * Solution 3: Install the [chrome extension][chrome_app_url] instead of the userscript.
* New versions of Chrome prevent the script from installing.
  * Solution: Open a new window and go to the url "chrome:extensions". Then drag-and-drop the [script url][script] onto the extensions page, where Chrome will then let you install the script.
  * Solution 2: If you don't have [TamperMonkey][tm_chrome] installed, follow these slightly more involved steps. Open a new window and go to the url "chrome:extensions". Enable `Developer mode` and refresh the page. Right-click the [script url][script] and save it to your computer, then drag-and-drop the file from your computer onto the extensions page, where Chrome will then (finally!) let you install the script.
* Mint mobile app shows all categories.
  * Solution: None. This script only works in desktop browsers. On mobile devices, the Mint app and web page will show all of the categories. 
