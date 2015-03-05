// ==UserScript==
// @name Mint.com Customize Default Categories
// @namespace com.schrauger.mint.js
// @author Stephen Schrauger
// @description Hide or rename default built-in mint.com categories
// @homepage https://github.com/schrauger/mint.com-customize-default-categories
// @include https://*.mint.com/*
// @version 0.0.1
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js
// @grant none
// @downloadURL https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/mint.com_customize_default_categories.user.js
// @updateURL   https://raw.githubusercontent.com/schrauger/mint.com-customize-default-categories/master/mint.com_customize_default_categories.user.js
// ==/UserScript==
/*jslint browser: true*/
/*global jQuery*/


// Need to define all categories and subcategories, along with their ID. Create this list dynamically.
function get_default_category_list(){
  categories = [];
  category_major = [];
  categories_minor = [];
  category_minor = [];
  
  // loop through each category and create an array of arrays with their info
  jQuery('#popup-cc-L1 > li').each(function(){
    category_major.id = jQuery(this).attr('id').replace(/\D/g, ''); // number-only portion (they all start with 'pop-categories-'{number}
    category_major.name = jQuery(this).children('a').text();
    category_major.categories_minor = [];
    
    /* get the minor/sub categories. only the :first ul, because the second one is
       user-defined custom categories, which they can change with native mint.com controls
       */
    jQuery(this).find('div.popup-cc-L2 ul:first > li').each(function(){
      category_minor.id = jQuery(this).attr('id').replace(/\D/g, ''); ;
      category_minor.name = jQuery(this).text();
      category_major.categories_minor.push(category_minor);
    });
    
    categories.push(category_major);
  });
}
// Somehow save any categories the user wants hidden.
// This will be done by creating a custom subcategory in the 'uncategorized' category, where the name of this
// subcategory will define which other categories to hide.
// This way, if the userscript is installed on multiple computers, the user sees their preferences synced.
// Alternatively, a cookie could be used, but preferences would be specific to that device.

/**
 * @str_bit_array String A printable-ascii encoded bit array (values that can be saved in a custom category)
 * @array_of_eight_categories Array 8 categories with their subcategories and 
 *                                  ID, name, subcategories and is_hidden members 
 *                                  for both the category and subcategories
 */
function decode_bit_array(str_bit_array_array, array_of_all_categories){
    
  // second, translate any extra characters into their forbidden character 
  // (double quote is forbidden; use a non-bit-array character to encode)
  
  // third, loop through each category and each of its subcategories
  
  // use bitwise operators to see if the subcategory minor id (always 1-9) is marked as hidden
  
  var bit_flags_per_char = 6; // using 01XXXXXX ASCII codes, which allows for 6 flags per character
  var unique_id_length = 4; // the bit array starts with '#!1 ' or '#!2 ' or '#!3 '
  var categories_per_string = 8; // with 20 characters per string, and 2 characters per category, we can fit 8 (plus the 4-char unique id)
  var characters_per_category = 2; // with 6 flags, this allows for 11 sub categories and 1 major category
  
  str_bit_array_array.sort();
  
  array_of_all_categories.sort(function(a, b){
    return (a.id - b.id); // sort by id, lowest first
  });

  
  field_count = 0; // 0, 1, or 2; for the 3 unique fields holding the 23 category hidden attributes
  major_count = 0;
  str_bit_array = str_bit_array_array(field_count); // 3 custom fields with attributes
  // remove the first 4 characters (the unique ID plus a space)
  str_bit_array = str_bit_array.substring(unique_id_length); // 0-based, meaning start at character 5 (inclusive)
 
  // loop through each major category and its minor categories and mark them as hidden or not
  for (major_category in array_of_all_categories){
    if (array_of_all_categories.hasOwnProperty(major_category)){
      array_of_all_categories.major_category.minor_categories.sort(function(a, b){
        return (a.id - b.id); // sort by id, lowest first
      });
      
      //hasOwnProperty makes sure we aren't looking at inhereted members
      id = major_category.id;
      bit_character = major_category.charAt(major_count * characters_per_category);
      
      shift_count = 0; // even if minor category 3 doesn't exist, it might in the future, so make a flag based on minor id 1-9 instead of merely positional (which major categories do due to 100 possibilities and not enough space)
      for (minor_category in major_category.minor_categories){
        if (major_category.minor_categories.hasOwnProperty(minor_category)){
          
          // if flag is '1', it is hidden
          array_of_all_categories.major_category.minor_category.hidden = is_category_hidden(bit_character, shift_count);
          
          // next flag
          shift_count += 1;
          if (shift_count > (bit_flags_per_char - 1)) {
            // move to the second character and reset the bit shift counter
            // note: this assumes only two characters used (no more than 11 subcategories, in groups of 6 (so 6 and 5 plus the major category)); 
            //       this if statement should only ever be run once within each major category loop.
            bit_character = major_category.charAt((major_count * characters_per_category) + 1);
            shift_count = 0;
          }
        }
      }
    }
    major_count +=1;
    if (major_count > (categories_per_string - 1)) {
      // each of our custom bit arrays can only hold 8 categories' info. reset the counter and move on to the next bit array
      major_count = 0;
      field_count += 1;
      
      str_bit_array = str_bit_array_array(field_count); // 3 custom fields with attributes
      // remove the first 4 characters (the unique ID plus a space)
      str_bit_array = str_bit_array.substring(unique_id_length); // 0-based, meaning start at character 5 (inclusive)
    }
  }
  return array_of_all_categories;
}

/**
 * Returns true if the bit location is set to true.
 */
function is_category_hidden(ascii_character, shift_count){
  category_id = category_id; // bit flags are 0-based, and ids start at 1
  is_hidden = 0;
  bit_character = (bit_character.charCodeAt(0)); // get binary representation
  return ((bit_character >>> category_id) & 000001); // shift the bits over and mask with '1'. if both are 1, it will return 1 (true) for hidden
}

/**
 * Replaces the substituted characters with the 'illegal' characters.
 * This way, the script can use bitwise operations in a logical manner.
 */
function translate_to_script(string_with_substituted_characters){
  str_return = string_with_substituted_characters.replace('?', Characters.toChars(127)); // the delete char (127) is substitude with a question mark when saved at mint
  return str_return;
}

/**
 * Replaces any illegal characters with substituted characters that mint.com allows in text fields.
 */
function translate_to_mint(string_with_illegal_characters){
  str_return = string_with_illegal_characters.replace(Characters.toChars(127), '?');
  return str_return;
}
