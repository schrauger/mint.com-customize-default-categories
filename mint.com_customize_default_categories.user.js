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
    
    /* get the minor/sub categories. only the :first ul, because the second one is
       user-defined custom categories, which they can change with native mint.com controls
       */
    jQuery(this).find('div.popup-cc-L2 ul:first > li').each(function(){
      category_minor.id = jQuery(this).attr('id').replace(/\D/g, ''); ;
      category_minor.name = jQuery(this).text();
      category_major.categories_minor.push(category_minor);
    });
    
    categories.push(categories_major);
  });
}
