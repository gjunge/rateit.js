# Change Log

## 1.1.5 (03/10/2021)
- Fix deprecated jQuery calls with jQuery 3.5 (Thanks to  @MPolleke)
## 1.1.4 (12/01/2020)
- Bug Fix: PR 34 fix rtl bug, displaying preset start incorrectly  (Thanks to @mossaab0)

## 1.1.3 (11/26/2019)
- Bug Fix: #29 fix bug when using <span> with mode:font (Thanks to @macronom)

## 1.1.2 (03/28/2019)
- Bug Fix: #22 tabindex on readonly is not good for accessibility (Thanks to @MPolleke)
- Project: updated Gulp script, added this Change Log.

## 1.1.1
- Fix looks of icon font reset button.

## 1.1.0
- Feature: finally arrived - support for icon fonts! Now your RateIt controls can be any size you want!

## 1.0.25
- Feature: ability to set value source of SELECT backing field. Either by value (option[value], how it currently works), or by index (selectedIndex, ew). Thanks to @maurojs10.
- Project: Added gulp task for minifying and sourcemapping.

## 1.0.23
- Move to GitHub.

## 1.0.22
- Bug fix: #1859 RateIt Stars disappear when clicking into another form field and pressing return

## 1.0.21
- Bug fix: #1828 Progressive enhancement (using select) displays incorrect amount of stars
- Bug fix: #1829 Use UNIX-style (LF-only) line endings

## 1.0.20
- Bug fix: #1817 Trigger change event on backingfield.

## 1.0.19
- Feature: #1801 Added cancellable beforereset and beforerated events.
- Misc: added example showcasing use of SVG instead of GIF image.

## 1.0.18
- Bug fix: #1747 Continuation...

## 1.0.17
- Bug fix: #1747 Initialization fail with data-rateit-value=0

## 1.0.16
- Bug fix: #1741 Using arrow keys after a rating changes rating.

## 1.0.15
- Bug fix: #1728 Compatibility with jQuery mobile

## 1.0.14
- Feature: #1712 Added a programmatic reset method which reverts to initial settings.
- Bug fix: #1711 On changing starheight/width some artifacts show up. (Thanks to JoeyBradshaw)

## 1.0.13
- Bug fix: #1648 Removed console.log

## 1.0.12
- Feature: ARIA support. Added basic ARIA support including keyboard navigation.
- Feature: Suggestion: use span instead of div.
- Bug fix: #1639 Firefox showing too many stars
