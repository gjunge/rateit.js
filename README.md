# RateIt
#### Rating plugin for jQuery.

[![npm version](https://img.shields.io/npm/v/jquery.rateit.svg)](https://www.npmjs.com/package/jquery.rateit)
[![NuGet](https://img.shields.io/nuget/v/jQuery.RateIt.svg)](https://www.nuget.org/packages/jQuery.RateIt)

## Quick start

Several quick start options are available:

* [Download the latest release](https://github.com/gjunge/rateit.js/archive/master.zip).
* Clone the repo: `git clone https://github.com/gjunge/rateit.js.git`.
* Install with [npm](https://www.npmjs.com): `npm install jquery.rateit`.
* Install with [NuGet](https://www.nuget.org): `Install-Package jQuery.RateIt`.

Read the [Wiki documentation](https://github.com/gjunge/rateit.js/wiki) or look at the [examples page](http://gjunge.github.io/rateit.js/examples/).


## About
Fast, Progressive enhancement, touch support, customizable (just swap out the images, or change some CSS), Unobtrusive JavaScript (using HTML5 data-* attributes), RTL support, supports as many stars as you'd like, and also any step size.

Your feedback is more than welcome!

## Why is RateIt different

Although it does the same job as the rest of the jQuery star rating plugins, the main difference is its simplicity. 
Most plugins create an element for each (partial) star, be it a div with a star background, or an img tag. 
Each of these tags gets a hover event, and a click event. And on these hover/click events it has to go and talk to the other stars, telling them to change their state.

So each star plugin does a lot of DOM alterations (adding the number of stars as elements), and adds lots of events (again the number of stars times 2). 

RateIt uses basically three divs. 
One background (the inactive state), and two divs on top (the hover, and selected state). In addition it only attaches three event handlers (not counting the use of the reset button aside).
Each of these divs has a x-repeating background, enabling as many stars as you want (or a big image with for example 5 different smilies one next to the other)  without adding more elements or event handlers. 
Based on the position of the mouse, or the selected value, a certain width is applied to the selection div or the hover div.

## Credits
* Thanks to http://www.fyneworks.com/jquery/star-rating/ for the idea and layout. 
* Thanks to http://famfamfam.com for the icon set.
