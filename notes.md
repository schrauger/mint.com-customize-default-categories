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

Also, spaces on either end are trimmed off. Maybe that will also need to be translated to another unused character.

So I'll make 3 custom categories, with 8 categories and sub categories available to be defined. This also lets me add a unique string to the beginning of these 3 custom categories so my script will know how to extract the information (something like #!1, #!2, #!3). That will be 3 characters for the unique string (kind of human readable so the user knows its a programmatically added string), plus a space for good measure, plus 8*2=16 characters for the bit array. Which is exatly 20 characters. That keeps us within the html-specified string length, and keeps us future proof in case the server-side length is reduced.
