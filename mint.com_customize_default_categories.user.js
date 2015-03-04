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
function decode_bit_array(str_bit_array, array_of_eight_categories){
  // first, remove the first 4 characters (the unique ID plus a space)
  
  // second, translate any extra characters into their forbidden character 
  // (double quote is forbidden; use a non-bit-array character to encode)
  
  // third, loop through each category and each of its subcategories
  
  // use bitwise operators to see if the subcategory minor id (always 0-8)
  ('a'.charCodeAt(0) & 00001).toString(2)
}
