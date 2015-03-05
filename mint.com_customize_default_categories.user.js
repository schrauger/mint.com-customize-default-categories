// ==UserScript==
// @name Mint.com Customize Default Categories
// @namespace com.schrauger.mint.js
// @author Stephen Schrauger
// @description Hide or rename default built-in mint.com categories
// @homepage https://github.com/schrauger/mint.com-customize-default-categories
// @include https://*.mint.com/*
// @version 0.0.2
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js
// @grant none
// @downloadURL https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/mint.com_customize_default_categories.user.js
// @updateURL   https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/mint.com_customize_default_categories.user.js
// ==/UserScript==
/*jslint browser: true*/
/*global jQuery*/

var bit_flags_per_char = 6; // using 01XXXXXX ASCII codes, which allows for 6 flags per character
var unique_id_length = 4; // the bit array starts with '#!1 ' or '#!2 ' or '#!3 '
var categories_per_string = 8; // with 20 characters per string, and 2 characters per category, we can fit 8 (plus the 4-char unique id)
var characters_per_category = 2; // with 6 flags, this allows for 11 sub categories and 1 major category
var number_of_bit_arrays = 3; // use 3 arrays to store all preferences.

// Need to define all categories and subcategories, along with their ID. Create this list dynamically.
function get_default_category_list() {
    var categories = [];
    //var category_major = [];
    //var categories_minor = [];
    var category_minor = [];

    // loop through each category and create an array of arrays with their info
    jQuery('#popup-cc-L1 > li').each(function () {
        var category_major = [];
        category_major.id = jQuery(this).attr('id').replace(/\D/g, ''); // number-only portion (they all start with 'pop-categories-'{number}
        //console.log(category_major.id);
        category_major.name = jQuery(this).children('a').text();
        category_major.categories_minor = [];

        /* get the minor/sub categories. only the :first ul, because the second one is
         user-defined custom categories, which they can change with native mint.com controls
         */
        jQuery(this).find('div.popup-cc-L2 ul:first > li').each(function () {
            var category_minor = [];
            category_minor.id = jQuery(this).attr('id').replace(/\D/g, '');
            category_minor.name = jQuery(this).text();
            category_major.categories_minor.push(category_minor);
        });
        categories.push(category_major);
    });

    return categories;
}
// Somehow save any categories the user wants hidden.
// This will be done by creating a custom subcategory in the 'uncategorized' category, where the name of this
// subcategory will define which other categories to hide.
// This way, if the UserScript is installed on multiple computers, the user sees their preferences synced.
// Alternatively, a cookie could be used, but preferences would be specific to that device.

/**
 * @str_bit_array String A printable-ascii encoded bit array (values that can be saved in a custom category)
 * @array_of_eight_categories Array 8 categories with their subcategories and
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
    var str_bit_array = str_bit_array.substring(unique_id_length); // 0-based, meaning start at character 5 (inclusive)

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

function encode_category_hidden(ascii_characters, minor_id, is_hidden){
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
 * Also hides the three fields, since the user probably shouldn't mess with them directly (and they look weird).
 * @returns {Array}
 */
function extract_mint_array() {
    var str_bit_array_array = [];
    jQuery('ul.popup-cc-L2-custom > li > input[value^="#!"]').each(function () {
        str_bit_array_array.push(jQuery(this).val());
        jQuery(this).parent().hide(); // comment this out in order to see the bit string data
    });
    return str_bit_array_array;

}

function encode_bit_array(array_of_all_categories){
    // loop through each category, create an ASCII character, and replace illegal characters

    array_of_all_categories.sort(function (a, b) {
        return (a.id - b.id); // sort by id, lowest first
    });

    var field_count = 0; // 0, 1, or 2; for the 3 unique fields holding the 23 category hidden attributes
    var bit_string_category_count = 0; // only 8 categories per string. once this goes past 7, reset and use next string.
    var str_bit_array_array = [];

    // loop through each major category and its minor categories and mark them as hidden or not
    str_bit_array_array[field_count] = new Array(characters_per_category * categories_per_string + 1).join( '@' );
    for (var category_major_count = 0, category_major_length = array_of_all_categories.length; category_major_count < category_major_length; category_major_count++) {

        var category_major = array_of_all_categories[category_major_count];

        array_of_all_categories[category_major_count].categories_minor.sort(function (a, b) {
            return (a.id - b.id); // sort by id, lowest first
        });


        var bit_characters = new Array(characters_per_category + 1).join( '@' ); // the @ character is 01000000, so all flags (last 6) start 'off'.
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
            str_bit_array_array[field_count] = new Array(characters_per_category * categories_per_string + 1).join( '@' );
        }
    }
    // now that all 3 bit arrays are creates, tack on the unique id to the string
    for (var i=0; i < number_of_bit_arrays; i++){
        str_bit_array_array[i] = '#!' + (i + 1) + ' ' + str_bit_array_array[i];
        console.log(str_bit_array_array[i]);
    }
    return str_bit_array_array;
}

/**
 * Loads the categories and hides the user specified ones.
 */
function init() {
    var str_bit_array_array = extract_mint_array();
    var default_categories = get_default_category_list();
    decode_bit_array(str_bit_array_array, default_categories);
}

/**
 * Saves the preferences
 */
function save() {
    var default_categories = get_default_category_list();

    var bit_array_array = encode_bit_array(default_categories);
}

/**
 * Allows immutible strings to have character(s) replaced
 * @param index
 * @param character
 * @returns {string}
 */
String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

save();