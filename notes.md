Custom categories are html limited to 20 characters, but the server actually supports up to 40 characters.
* 40 characters isn't enough for me unless I somehow encrypt or compress the data.
* If I can't get all the data saved on a single custom category, I'll have to make multiple categories.
 * Alternatively, I can save preferences via cookies. This, however, prevents the script from staying syncronized across multiple browsers.

There are max of 7 sub categories built-in for each major category. If we use 001XXXXX and 010XXXXX as binary flags, we can use the printable ASCII set to encode the hidden categories, for a max of 11 (if mint decides to add more default categories in the future, which they probably won't).

So 001XXXXX for the first 5, and 010XXXXX for the last 5. And instead of 10 subcategories, I can use 9 subcategories, and use the final slot for the major category (if the user wants to hide the major category). I can't use 000XXXXX, as those are unprintable (and mint won't accept them), and 011111111 is the 'delete' character, which also can't be saved.

Then we just define a character for the major category, which definitely won't change.
Unfortunately, I can't just use two characters per category, as there are more than 20 categories (23, to be exact). 

But I could hardcode major categories that use 4 or less default subcategories and compress their spot in the array to one. This is less than ideal, but may be an option. Or I could simply make two custom categories, which may be better overall anyway.
Education: 3
Financial: 2
Gifts & Donations: 2
Misc Expenses: 0 (no sub categories defined)
Personal Care: 3
Pets: 3
Transfer: 2
Uncategorized: 2

Looks like double quotes are the only printable character that mint explicitely rejects (notice stating to remove double quotes, instead of a server error). But after encoding the bit-string, I can just manually replace the double quote with an unused character, like 'p' (01110000, the first character after my two 5-bit allocations). When retrieving, I'll do the inverse.

Also, spaces on either end are trimmed off. Maybe that will also need to be translated to another unused character. Unless space is used in the first group, and the second group uses the other bit-array (which makes numerical sense anyway). So the last character in the string will never be a space, and the first character in the string is the begionning of my unique id.

So I'll make 3 custom categories, with 8 categories and sub categories available to be defined. This also lets me add a unique string to the beginning of these 3 custom categories so my script will know how to extract the information (something like #!1, #!2, #!3). That will be 3 characters for the unique string (kind of human readable so the user knows its a programmatically added string), plus a space for good measure, plus 8*2=16 characters for the bit array. Which is exatly 20 characters. That keeps us within the html-specified string length, and keeps us future proof in case the server-side length is reduced.

Major categories will just have to be hardcoded. If Mint ever adds new major categories, it will probably mess up my script (or at least, the preferences on which sub categories are hidden). Maybe that can be somewhat reduced by sorting categories by ID before putting them in the array; presumably, a new major category would have a higher ID. But not necessarily. Especially since mint uses almost all 1-20, then goes 21, 30, 50, 60, 70. They could easily put a category between. But I can't see the future, and I'm working with limits here. I don't want to explicitely define the category ID, as there could be 100 of them, needing far more than 3 custom categories to define. Or I'd have to use a compression algorithm or have a variable number of custom fields.

I trust mint enough to keep the current number of major categories, so I won't do much to plan for any changes, other than sort by id when encoding.
