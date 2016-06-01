// ==UserScript==
// @name Mint.com Customize Default Categories
// @namespace com.schrauger.mint.js
// @author Stephen Schrauger
// @description Hide specified default built-in mint.com categories
// @homepage https://github.com/schrauger/mint.com-customize-default-categories
// @include https://*.mint.com/*
// @version 1.3.4
// @grant none
// @downloadURL https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/mint.com_customize_default_categories.user.js
// @updateURL   https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/mint.com_customize_default_categories.user.js
// ==/UserScript==
/*jslint browser: true*/
/*global jQuery*/
(function () {
function after_jquery() {
    var number_of_bit_arrays = 3; // use 3 arrays to store all preferences.
    var unique_id_length = 4; // the bit array is prefixed with '#!1 ' or '#!2 ' or '#!3 ', which is 4 characters long
    var categories_per_string = 8; // with 20 characters per string, and 2 characters per category, we can fit 8 (plus the 4-char unique id)
    var characters_per_category = 2; // with 6 flags, this allows for 11 sub categories and 1 major category
    var bit_flags_per_char = 6; // using 01XXXXXX ASCII codes, which allows for 6 flags per character
    var category_id = 20; // save the custom fields in the 'uncategorized' major category, which has the id of 20
    var class_hidden = 'sgs-hide-from-mint'; // just a unique class; if an element has it, it will be hidden.
    var class_edit_mode = 'mint_edit_mode';

    var hs_action_hide = 'hide';
    var hs_action_show = 'show';
    var hs_action_edit = 'edit';

// Need to define all categories and subcategories, along with their ID. Create this list dynamically.
    function get_default_category_list() {
        var categories = [];

        // loop through each category and create an array of arrays with their info
        jQuery('#popup-cc-L1').find('> li').each(function () {
            var category_major = [];
            category_major.id = jQuery(this).attr('id').replace(/\D/g, ''); // number-only portion (they all start with 'pop-categories-'{number}
            //console.log(caconsole.logtegory_major.id);
            category_major.name = jQuery(this).children('a').text();
            category_major.categories_minor = [];
            category_major.is_hidden = jQuery(this).hasClass(class_hidden);
            /* get the minor/sub categories. only the :first ul, because the second one is
             user-defined custom categories, which they can change with native mint.com controls
             */
            jQuery(this).find('div.popup-cc-L2 ul:first > li').each(function () {
                var category_minor = [];
                category_minor.id = jQuery(this).attr('id').replace(/\D/g, '');
                category_minor.name = jQuery(this).text();
                category_minor.is_hidden = jQuery(this).hasClass(class_hidden);
                category_major.categories_minor.push(category_minor);
            });
            categories.push(category_major);
        });

        return categories;
    }

// Save any categories the user wants hidden.
// This will be done by creating a custom subcategory in the 'uncategorized' category, where the name of this
// subcategory will define which other categories to hide.
// This way, if the UserScript is installed on multiple computers, the user sees their preferences synced.
// Alternatively, a cookie could be used, but preferences would be specific to that device.

    /**
     * @str_bit_array_array Array A printable-ascii encoded bit array (values that can be saved in a custom category)
     * @array_of_all_categories Array 8*3 categories with their subcategories and
     *                                  ID, name, subcategories and is_hidden members
     *                                  for both the category and subcategories
     */
    function decode_bit_array(str_bit_array_array, array_of_all_categories) {

        // second, translate any extra characters into their forbidden character
        // (double quote is forbidden; use a non-bit-array character to encode)

        // third, loop through each category and each of its subcategories

        // use bitwise operators to see if the subcategory minor id (always 1-9) is marked as hidden


        str_bit_array_array.sort();

        array_of_all_categories.sort(function (a, b) {
            return (a.id - b.id); // sort by id, lowest first
        });


        var field_count = 0; // 0, 1, or 2; for the 3 unique fields holding the 23 category hidden attributes
        var bit_string_category_count = 0; // only 8 categories per string. once this goes past 7, reset and use next string.
        var str_bit_array = str_bit_array_array[field_count]; // 3 custom fields with attributes
        // remove the first 4 characters (the unique ID plus a space)
        str_bit_array = str_bit_array.substring(unique_id_length); // 0-based, meaning start at the fifth character (inclusive)

        // loop through each major category and its minor categories and mark them as hidden or not
        for (var category_major_count = 0, category_major_length = array_of_all_categories.length; category_major_count < category_major_length; category_major_count++) {
            var category_major = array_of_all_categories[category_major_count];

            array_of_all_categories[category_major_count].categories_minor.sort(function (a, b) {
                return (a.id - b.id); // sort by id, lowest first
            });


            var bit_characters = str_bit_array.substr(bit_string_category_count * characters_per_category, characters_per_category); // grab the 2 characters for this category

            for (var category_minor_count = 0, category_minor_length = category_major.categories_minor.length; category_minor_count < category_minor_length; category_minor_count++) {

                var minor_id = category_major.categories_minor[category_minor_count].id.slice(-2); // the last two digits are the minor category; the first two are always the same as the parent major category
                // if flag is '1', it is hidden
                array_of_all_categories[category_major_count].categories_minor[category_minor_count].is_hidden = is_category_hidden(bit_characters, minor_id);
                //console.debug(array_of_all_categories[category_major_count].categories_minor[category_minor_count].name + ' is hidden: '
                //                + array_of_all_categories[category_major_count].categories_minor[category_minor_count].is_hidden);
            }
            var last_flag = characters_per_category * bit_flags_per_char; // last flag is used for major category, instead of subcategory #12 (2 * 6);
            array_of_all_categories[category_major_count].is_hidden = is_category_hidden(bit_characters, last_flag);
            //console.debug(array_of_all_categories[category_major_count].name + ' is hidden: '
            //                    + array_of_all_categories[category_major_count].is_hidden);
            bit_string_category_count += 1;
            if (bit_string_category_count > (categories_per_string - 1)) {
                // each of our custom bit arrays can only hold 8 categories' info. reset the counter and move on to the next bit array
                bit_string_category_count = 0;
                field_count += 1;

                str_bit_array = str_bit_array_array[field_count]; // 3 custom fields with attributes
                // remove the first 4 characters (the unique ID plus a space)
                str_bit_array = str_bit_array.substring(unique_id_length); // 0-based, meaning start at character 5 (inclusive)
            }
        }
        return array_of_all_categories;
    }

    /**
     * Returns true if the bit location is set to true.
     */
    function is_category_hidden(ascii_characters, minor_id) {
        var bit_shift_count = ((minor_id - 1) % bit_flags_per_char); // category 1 is stored in last bit flag; cat 2 in the second to last. cat 7 stored in last flag
        var bit_to_use = (Math.floor((minor_id - 1) / bit_flags_per_char)); // 1-6 (0-5) in first bit. 7-12 (6-11) stored in second. etc. 7/6 floored is 1.
        var bit_character = (ascii_characters.charCodeAt(bit_to_use)); // get binary representation
        var is_hidden = ((bit_character >>> bit_shift_count) & 000001); // shift the bits over and mask with '1'. if both are 1, it will return 1 (true) for hidden
        //console.log('is_hidden: ' + is_hidden);
        return is_hidden;
    }

    function encode_category_hidden(ascii_characters, minor_id, is_hidden) {
        var bit_shift_count = ((minor_id - 1) % bit_flags_per_char); // category 1 is stored in last bit flag; cat 2 in the second to last. cat 7 stored in last flag
        var bit_to_use = (Math.floor((minor_id - 1) / bit_flags_per_char)); // 1-6 (0-5) in first bit. 7-12 (6-11) stored in second. etc. 7/6 floored is 1.
        var mask = ((is_hidden << bit_shift_count)); // move the mask to the proper location

        var new_char = String.fromCharCode(ascii_characters[bit_to_use].charCodeAt(0) | mask);
        ascii_characters = ascii_characters.replaceAt(bit_to_use, new_char); // replace with new character
        //console.debug(ascii_characters);
        return ascii_characters;
    }

    /**
     * Replaces the substituted characters with the 'illegal' characters.
     * This way, the script can use bitwise operations in a logical manner.
     */
    function translate_to_script(string_with_substituted_characters) {
        var str_return = string_with_substituted_characters.replace('?', String.fromCharCode(127)); // the delete char (127) is substituted with a question mark when saved at mint
        return str_return;
    }

    /**
     * Replaces any illegal characters with substituted characters that mint.com allows in text fields.
     */
    function translate_to_mint(string_with_illegal_characters) {
        var str_return = string_with_illegal_characters.replace(String.fromCharCode(127), '?');
        return str_return;
    }

    /**
     * Extracts the bit arrays from the saved custom category input box and puts all 3 into a string array.
     * @returns {Array}
     */
    function extract_mint_array() {
        var str_bit_array_array = [];
        jQuery('#menu-category-' + category_id + ' ul li:contains("#!")').each(function () {
            str_bit_array_array.push(jQuery(this).text());
            //console.log('processing val is ' + jQuery(this).text());
        });
        return str_bit_array_array;
    }

    function encode_bit_array(array_of_all_categories) {
        // loop through each category, create an ASCII character, and replace illegal characters

        array_of_all_categories.sort(function (a, b) {
            return (a.id - b.id); // sort by id, lowest first
        });

        var field_count = 0; // 0, 1, or 2; for the 3 unique fields holding the 23 category hidden attributes
        var bit_string_category_count = 0; // only 8 categories per string. once this goes past 7, reset and use next string.
        var str_bit_array_array = [];

        // loop through each major category and its minor categories and mark them as hidden or not
        str_bit_array_array[field_count] = new Array(characters_per_category * categories_per_string + 1).join('@');
        for (var category_major_count = 0, category_major_length = array_of_all_categories.length; category_major_count < category_major_length; category_major_count++) {

            var category_major = array_of_all_categories[category_major_count];

            array_of_all_categories[category_major_count].categories_minor.sort(function (a, b) {
                return (a.id - b.id); // sort by id, lowest first
            });


            var bit_characters = new Array(characters_per_category + 1).join('@'); // the @ character is 01000000, so all flags (last 6) start 'off'.
            for (var category_minor_count = 0, category_minor_length = category_major.categories_minor.length; category_minor_count < category_minor_length; category_minor_count++) {

                var minor_id = category_major.categories_minor[category_minor_count].id.slice(-2); // the last two digits are the minor category; the first two are always the same as the parent major category
                // if flag is '1', it is hidden

                bit_characters = encode_category_hidden(bit_characters, minor_id, array_of_all_categories[category_major_count].categories_minor[category_minor_count].is_hidden);
                str_bit_array_array[field_count] = str_bit_array_array[field_count].replaceAt(bit_string_category_count * characters_per_category, bit_characters);
            }
            var last_flag = characters_per_category * bit_flags_per_char; // last flag is used for major category, instead of subcategory #12 (2 * 6);
            bit_characters = encode_category_hidden(bit_characters, last_flag, array_of_all_categories[category_major_count].is_hidden);

            str_bit_array_array[field_count] = str_bit_array_array[field_count].replaceAt(bit_string_category_count * characters_per_category, bit_characters);

            bit_string_category_count += 1;
            if (bit_string_category_count > (categories_per_string - 1)) {
                // each of our custom bit arrays can only hold 8 categories' info. reset the counter and move on to the next bit array
                bit_string_category_count = 0;
                field_count += 1;
                str_bit_array_array[field_count] = new Array(characters_per_category * categories_per_string + 1).join('@');
            }
        }
        // now that all 3 bit arrays are creates, tack on the unique id to the string
        for (var i = 0; i < number_of_bit_arrays; i++) {
            str_bit_array_array[i] = '#!' + (i + 1) + ' ' + str_bit_array_array[i];
            str_bit_array_array[i] = translate_to_mint(str_bit_array_array[i]);
            //console.log(str_bit_array_array[i]);
        }
        return str_bit_array_array;
    }


    /**
     * Will update or insert as needed.
     * @param bit_string
     */
    function upsert_field(bit_string) {
        var unique_id = bit_string.substr(0, unique_id_length);
        var input_id = jQuery('ul.popup-cc-L2-custom > li > input[value^="' + unique_id + '"]').prev().val();
        if (input_id) {
            update_field(bit_string);
        } else {
            insert_field(bit_string);
        }
    }

    function insert_field(bit_string) {
        var hidden_token = JSON.parse(jQuery('#javascript-user').val()).token;
        var data = {
            pcatId: category_id,
            catId: 0,
            category: bit_string,
            task: 'C',
            token: hidden_token
        };
        jQuery.ajax(
            {
                type: "POST",
                url: '/updateCategory.xevent',
                data: data
            }
        );
    }

    function update_field(bit_string) {

        var hidden_token = JSON.parse(jQuery('#javascript-user').val()).token;
        var unique_id = bit_string.substr(0, unique_id_length);

        var input = jQuery('ul.popup-cc-L2-custom > li > input[value^="' + unique_id + '"]');
        //console.log('setting input string from ' + input.val() + ' to ' + bit_string);
        input.val(bit_string); // set the value on the user's page manually (not needed for ajax, but needed for later processing)
        jQuery('#menu-category-' + category_id + ' ul li:contains("' + unique_id + '")').text(bit_string);
        /*    input.prop('value',bit_string);
         input.attr('value',bit_string);*/
        var input_id = input.prev().val();
        var data = {
            pcatId: category_id,
            catId: input_id,
            category: bit_string,
            task: 'U',
            token: hidden_token
        };
        jQuery.ajax(
            {
                type: "POST",
                url: '/updateCategory.xevent',
                data: data
            }
        );
    }

    function delete_field(bit_string) {
        var hidden_token = JSON.parse(jQuery('#javascript-user').val()).token;
        var unique_id = bit_string.substr(0, unique_id_length);
        var input_id = jQuery('ul.popup-cc-L2-custom > li > input[value^="' + unique_id + '"]').prev().val();
        var data = {
            catId: input_id,
            task: 'D',
            token: hidden_token
        };
        jQuery.ajax(
            {
                type: "POST",
                url: '/updateCategory.xevent',
                data: data
            }
        );
    }

    /**
     * Loop through all the category objects. If any are hidden,
     * add the proper CSS to hide the field.
     * Also, remove any line-throughs, in case a hidden category has been restored.
     * @param default_categories
     */
    function process_hidden_categories(default_categories) {
        for (var major_count = 0; major_count < default_categories.length; major_count++) {
            for (var minor_count = 0; minor_count < default_categories[major_count].categories_minor.length; minor_count++) {
                if (default_categories[major_count].categories_minor[minor_count].is_hidden) {
                    jQuery('#menu-category-' + default_categories[major_count].categories_minor[minor_count].id).addClass(class_hidden);
                    //console.log('hide minor ' + default_categories[major_count].categories_minor[minor_count].id);
                    jQuery('#pop-categories-' + default_categories[major_count].categories_minor[minor_count].id).addClass(class_hidden);
                }
                jQuery('#menu-category-' + default_categories[major_count].categories_minor[minor_count].id).css('text-decoration', '');
                jQuery('#pop-categories-' + default_categories[major_count].categories_minor[minor_count].id).css('text-decoration', '');
            }
            if (default_categories[major_count].is_hidden) {
                jQuery('#menu-category-' + default_categories[major_count].id).addClass(class_hidden);
                jQuery('#pop-categories-' + default_categories[major_count].id).addClass(class_hidden);

            }
            jQuery('#menu-category-' + default_categories[major_count].id).css('text-decoration', '');
            jQuery('#pop-categories-' + default_categories[major_count].id).css('text-decoration', '');
            
        }
        hide_show_category(hs_action_hide);
    }

    /**
     *
     * @param action
     */
    function hide_show_category(action) {
        var category = jQuery('.' + class_hidden);
        if (action == hs_action_hide) {
            // hide the categories completely
            category.hide();
            category.css('text-decoration', 'line-through');
        }
        if (action == hs_action_show) {
            // remove any visible attributes
            category.show();
            category.css('text-decoration', '');
        }
        if (action == hs_action_edit) {
            category.show();
            category.css('text-decoration', 'line-through');
        }
    }

    function add_toggle() {
        if (!(jQuery('#sgs-toggle').length)) {
            var toggle_style = "position: absolute; right: 30px; top: 35px; cursor: pointer";
            var toggle_text = "Edit Hidden Categories";
            jQuery('#pop-categories-main').prepend('<div id="sgs-toggle" class="" style="' + toggle_style + '">' + toggle_text + '</div>');
            jQuery('#sgs-toggle').click(function () {
                edit_categories();
            });
            jQuery('#pop-categories-submit').click(function(){
                jQuery('#sgs-toggle').addClass('editing'); // force the current mode to be editing so the edit_categories call saves
                edit_categories(); // if user clicks the "I'm done" button, we should also save the categories.
            })
        }
    }

    function edit_categories() {
        var toggle = jQuery('#sgs-toggle');
        toggle.toggleClass('editing');
        if (toggle.hasClass('editing')) {
            toggle.text('Save Hidden Categories');
            mint_edit(true); // make all categories clickable; when clicked, add class and strike out
        } else {
            mint_edit(false); // remove clickable event and strike css; go back to hiding
            mint_save();
            toggle.text('Edit Hidden Categories');

        }

    }

    function mint_edit(edit_mode) {
        if (edit_mode) {
            // get the major and minor categories in the popup editor
            var minor_categories = jQuery('div.popup-cc-L2 > ul:first-of-type > li'); // second ul is custom categories, so just get first
            var major_categories = jQuery('#popup-cc-L1').find('.isL1');


            // display all previously hidden fields (except our three custom fields holding bit arrays)


            // add checkboxes to the categories
            minor_categories.each(function () {
                add_checkbox(this);
            });
            major_categories.each(function () {
                add_checkbox(this);
            })
            jQuery('input.hide_show_checkbox').css({
                                                       'position': 'absolute',
                                                       'right': '-18px'
                                                   });

            // add label for minor checkboxes
            jQuery('div.popup-cc-L2 > h3:first-of-type').append('<span class="' + class_edit_mode + ' minor_hide_show_label">Hide</span>');
            jQuery('span.minor_hide_show_label').css({
                                                         'position': 'absolute',
                                                         'right': '64px',
                                                         'top': '3px',
                                                         'font-size': '13px',
                                                         'font-weight': 'bold'
                                                     });


            // add label for major categories
            jQuery('#pop-categories-form fieldset').prepend('<span class="' + class_edit_mode + ' major_hide_show_label">Hide</span>');
            jQuery('span.major_hide_show_label').css({
                                                         'position': 'absolute',
                                                         'left': '267px',
                                                         'font-size': '13px',
                                                         'font-weight': 'bold'
                                                     });
            // add checkbox event. when checked add the 'hidden' class (which is scanned on save)
            jQuery('input.hide_show_checkbox').click(function () {
                parent_id = jQuery(this).parent().attr('id').replace(/\D/g, '');
                if (jQuery(this).is(':checked')) {
                    jQuery('#menu-category-' + parent_id).addClass(class_hidden);
                    jQuery('#pop-categories-' + parent_id).addClass(class_hidden);
                    jQuery(this).parent().css('text-decoration', 'line-through');
                } else {
                    jQuery('#menu-category-' + parent_id).removeClass(class_hidden);
                    jQuery('#pop-categories-' + parent_id).removeClass(class_hidden);
                    ;
                    jQuery(this).parent().css('text-decoration', '');

                }
            });
            hide_show_category(hs_action_edit);
        } else {
            // no longer editing (saving), so remove our labels and checkboxes, and re-hide the desired categories
            jQuery('.' + class_edit_mode).remove();
            hide_show_category(hs_action_hide);
        }
    }

    function add_checkbox(element) {
        var checked = '';
        if (jQuery(element).hasClass(class_hidden)) {
            // hidden categories are checked
            checked = 'checked="checked"';
        }
        jQuery(element).append('<input type="checkbox" class="' + class_edit_mode + ' hide_show_checkbox"' + checked + ' />');
    }

    /**
     * hooks to the save or cancel button so that hidden categories will be re-hidden after ajax refresh
     */
    function add_save_hook() {
        if ((jQuery('#pop-categories-submit').length && (!(jQuery('#pop-categories-submit').hasClass('sgs-hook-added'))))) {

            jQuery('#pop-categories-submit').addClass('sgs-hook-added');
            jQuery('#pop-categories-submit, #pop-categories-close').click(function () {
                mint_refresh();
            });

        }
    }

    /**
     * Hides our bit array custom categories permanently so the user won't accidentally mess with them.
     */
    function hide_bit_array() {
        jQuery('input[value^="#!"]').parent().hide();
        jQuery('li[id^="menu-category-"] a:contains("#!")').parent().hide();

    }

    /**
     * Allows immutable strings to have character(s) replaced
     * @param index
     * @param character
     * @returns {string}
     */
    String.prototype.replaceAt = function (index, character) {
        return this.substr(0, index) + character + this.substr(index + character.length);
    };

    /**
     * Lets you bind an event and have it run first.
     * @param name
     * @param fn
     */
    jQuery.fn.bindFirst = function (name, fn) {
        // bind as you normally would
        // don't want to miss out on any jQuery magic
        this.on(name, fn);

        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        this.each(function () {
            var handlers = jQuery._data(this, 'events')[name.split('.')[0]];
            // take out the handler we just inserted from the end
            var handler = handlers.pop();
            // move it at the beginning
            handlers.splice(0, 0, handler);
        });
    };

    function mint_refresh() {
        add_toggle();
        add_save_hook();
        // when the popup is opened or closed, re-hide the categories
        var str_bit_array_array = extract_mint_array();
        var default_categories = get_default_category_list();
        default_categories = decode_bit_array(str_bit_array_array, default_categories);
        process_hidden_categories(default_categories); // hides the appropriate fields
        
        //Hides our three fields, since the user probably shouldn't mess with them directly (and they look weird).
        hide_bit_array(); // comment this out in order to see the bit string data
    }

    /**
     * Saves the preferences
     */
    function mint_save() {
        //console.debug('saving');
        var default_categories = get_default_category_list();
        var bit_array_array = encode_bit_array(default_categories);
        for (var i = 0; i < bit_array_array.length; i++) {
            upsert_field(bit_array_array[i]);
        }
    }
    
    function add_dropdown_hook() {
        //console.log('start dropdown');
        //if ((jQuery('#txnEdit-category_input').length) && (!(jQuery('#txtEdit-category_input').hasClass('sgs-hook-added')))) {
        jQuery('#txnEdit-category_input').addClass('sgs-hook-added');
        jQuery('#txnEdit-category_input, #txnEdit-category_picker').off('click', mint_refresh);
        jQuery('#txnEdit-category_input, #txnEdit-category_picker').on('click', mint_refresh);
        //}
    }
    
    /**
     * A bonus feature of this script: Fixes Mint's google search query.
     * (If a transaction description contains a space, quote or other URI character, 
     * mint.com doesn't encode it, which causes the google search link to be invalid.)
     */
    function google_search_fix(){
        jQuery('#txnEdit-toggle').on('click', function(){
            // get the text; don't try decoding the partial original search link
            plain_search = jQuery('a.desc_link strong var').text();

            // proper encoding
            new_search = encodeURIComponent(plain_search);

            // encoding changes spaces to %20, but that is deprecated now. urls take '+' instead.
            new_search = new_search.replace(/%20/gi, '+');

            // replace old url with new
            jQuery('a.desc_link').attr('href', 'https://www.google.com/#q=' + new_search);
        });
    }
    
    ////// Start jQuery Addon
    if (!(jQuery.fn.arrive)){
        /*
         * arrive.js
         * v2.1.0
         * https://github.com/uzairfarooq/arrive
         * MIT licensed
         *
         * Copyright (c) 2014-2015 Uzair Farooq
         */
        
        var _arrive_unique_id_=0;
        (function(n,u,p){function h(a){return a._shouldBeIgnored===p?-1!=(" "+a.className+" ").indexOf(" ignore-arrive ")?a._shouldBeIgnored=!0:null==a.parentNode?a._shouldBeIgnored=!1:a._shouldBeIgnored=h(a.parentNode):a._shouldBeIgnored}function q(a,c,e){for(var d=0,b;b=a[d];d++)h(b)||(f.matchesSelector(b,c.selector)&&(b._id===p&&(b._id=_arrive_unique_id_++),-1==c.firedElems.indexOf(b._id)&&(c.firedElems.push(b._id),e.push({callback:c.callback,elem:b}))),0<b.childNodes.length&&q(b.childNodes,c,e))}function v(a){for(var c=
            0,e;e=a[c];c++)e.callback.call(e.elem)}function x(a,c){a.forEach(function(a){if(!h(a.target)){var d=a.addedNodes,b=a.target,r=[];null!==d&&0<d.length?q(d,c,r):"attributes"===a.type&&f.matchesSelector(b,c.selector)&&(b._id===p&&(b._id=_arrive_unique_id_++),-1==c.firedElems.indexOf(b._id)&&(c.firedElems.push(b._id),r.push({callback:c.callback,elem:b})));v(r)}})}function y(a,c){a.forEach(function(a){if(!h(a.target)){a=a.removedNodes;var d=[];null!==a&&0<a.length&&q(a,c,d);v(d)}})}function z(a){var c=
        {attributes:!1,childList:!0,subtree:!0};a.fireOnAttributesModification&&(c.attributes=!0);return c}function A(a){return{childList:!0,subtree:!0}}function g(a){a.arrive=k.bindEvent;f.addMethod(a,"unbindArrive",k.unbindEvent);f.addMethod(a,"unbindArrive",k.unbindEventWithSelectorOrCallback);f.addMethod(a,"unbindArrive",k.unbindEventWithSelectorAndCallback);a.leave=l.bindEvent;f.addMethod(a,"unbindLeave",l.unbindEvent);f.addMethod(a,"unbindLeave",l.unbindEventWithSelectorOrCallback);f.addMethod(a,"unbindLeave",
            l.unbindEventWithSelectorAndCallback)}if(n.MutationObserver&&"undefined"!==typeof HTMLElement){var f=function(){var a=HTMLElement.prototype.matches||HTMLElement.prototype.webkitMatchesSelector||HTMLElement.prototype.mozMatchesSelector||HTMLElement.prototype.msMatchesSelector;return{matchesSelector:function(c,e){return c instanceof HTMLElement&&a.call(c,e)},addMethod:function(a,e,d){var b=a[e];a[e]=function(){if(d.length==arguments.length)return d.apply(this,arguments);if("function"==typeof b)return b.apply(this,
            arguments)}}}}(),B=function(){var a=function(){this._eventsBucket=[];this._beforeRemoving=this._beforeAdding=null};a.prototype.addEvent=function(a,e,d,b){a={target:a,selector:e,options:d,callback:b,firedElems:[]};this._beforeAdding&&this._beforeAdding(a);this._eventsBucket.push(a);return a};a.prototype.removeEvent=function(a){for(var e=this._eventsBucket.length-1,d;d=this._eventsBucket[e];e--)a(d)&&(this._beforeRemoving&&this._beforeRemoving(d),this._eventsBucket.splice(e,1))};a.prototype.beforeAdding=
            function(a){this._beforeAdding=a};a.prototype.beforeRemoving=function(a){this._beforeRemoving=a};return a}(),w=function(a,c,e){function d(a){"number"!==typeof a.length&&(a=[a]);return a}var b=new B;b.beforeAdding(function(b){var c=b.target,d;if(c===n.document||c===n)c=document.getElementsByTagName("html")[0];d=new MutationObserver(function(a){e.call(this,a,b)});var m=a(b.options);d.observe(c,m);b.observer=d});b.beforeRemoving(function(a){a.observer.disconnect()});this.bindEvent=function(a,e,t){"undefined"===
        typeof t&&(t=e,e=c);for(var m=d(this),f=0;f<m.length;f++)b.addEvent(m[f],a,e,t)};this.unbindEvent=function(){var a=d(this);b.removeEvent(function(b){for(var c=0;c<a.length;c++)if(b.target===a[c])return!0;return!1})};this.unbindEventWithSelectorOrCallback=function(a){var c=d(this);b.removeEvent("function"===typeof a?function(b){for(var d=0;d<c.length;d++)if(b.target===c[d]&&b.callback===a)return!0;return!1}:function(b){for(var d=0;d<c.length;d++)if(b.target===c[d]&&b.selector===a)return!0;return!1})};
            this.unbindEventWithSelectorAndCallback=function(a,c){var e=d(this);b.removeEvent(function(b){for(var d=0;d<e.length;d++)if(b.target===e[d]&&b.selector===a&&b.callback===c)return!0;return!1})};return this},k=new w(z,{fireOnAttributesModification:!1},x),l=new w(A,{},y);u&&g(u.fn);g(HTMLElement.prototype);g(NodeList.prototype);g(HTMLCollection.prototype);g(HTMLDocument.prototype);g(Window.prototype)}})(this,"undefined"===typeof jQuery?null:jQuery);

    }
    ////// End jQuery Addon
    jQuery(document).arrive("#txnEdit-category_input", add_dropdown_hook);
    jQuery(document).arrive("#txnEdit-toggle", google_search_fix);

}


/**
 * Mint.com loads jquery after page is loaded, and it conflicts with other verions. We can't
 * use a sandbox for our script, either, since we must use their version of jquery in order
 * to hook into their ajax completion events.
 * Therefore, we must manually check for jquery every so often (50 ms) until it finally exists.
 * Then, we can call our jquery-requiring function and modify the page.
 * @param method
 */
function defer(method) {
    if (window.jQuery) {
        method();
    } else {
        setTimeout(function () {
            defer(method);
        }, 50);
    }
}
window.addEventListener('load', function () {
    defer(after_jquery);
});
}());

