RateIt
======
####Rating plugin for jQuery.

Fast, Progressive enhancement, touch support, customizable (just swap out the images, or change some CSS), Unobtrusive JavaScript (using HTML5 data-* attributes), RTL support, supports as many stars as you'd like, and also any step size.

Minified size: 4.35KB (1.55KB when gzipped).

Tested on: IE6-10, Chrome 7-22, Firefox 3.6-16, Opera 10.63-12  - using jQuery 1.6.2 - 1.8.2. Touch support test on iPad iOS 4.2.1-5

Examples are included in the download, or go to the [online examples] [samples]. 

Your feedback is more than welcome!

[samples]: http://www.radioactivethinking.com/rateit/example/example.htm

Why is RateIt different
-------

Although it does the same job as the rest of the jQuery star rating plugins, the main difference is its simplicity. 
Most plugins create an element for each (partial) star, be it a div with a star background, or an img tag. 
Each of these tags gets a hover event, and a click event. And on these hover/click events it has to go and talk to the other stars, telling them to change their state.

So each star plugin does a lot of DOM alterations (adding the number of stars as elements), and adds lots of events (again the number of stars times 2). 

RateIt uses basically three divs. 
One background (the inactive state), and two divs on top (the hover, and selected state). In addition it only attaches three event handlers (not counting the use of the reset button aside).
Each of these divs has a x-repeating background, enabling as many stars as you want (or a big image with for example 5 different smilies one next to the other)  without adding more elements or event handlers. 
Based on the position of the mouse, or the selected value, a certain width is applied to the selection div or the hover div.

Credits
-------
* Thanks to http://www.fyneworks.com/jquery/star-rating/ for the idea and layout. 
* Thanks to http://famfamfam.com for the icon set.
