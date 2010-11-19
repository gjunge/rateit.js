(function ($) {
    $.fn.rateit = function (options) {
        //quick way out.
        if (this.length == 0) return this;

        options = $.extend({}, $.fn.rateit.defaults, options);

        return this.each(function () {
            var item = $(this);

            //add the rate it class.
            if (!item.hasClass('rateit')) item.addClass('rateit');

            //get our values, either from the data-* html5 attribute or from the options.
            var lb = item.data('rateit-min') || options.min;
            var ub = item.data('rateit-max') || options.max;
            var step = item.data('rateit-step') || options.step;
            var readonly = item.data('rateit-readonly') !== undefined ? item.data('rateit-readonly') : options.readonly;
            var resetable = item.data('rateit-resetable') !== undefined ? item.data('rateit-resetable') : options.resetable;
            var backingfld = item.data('rateit-backingfld') || options.backingfld;

            //are we LTR or RTL?
            var ltr = item.css('direction') != 'rtl';
            if (backingfld) {
                //if we have a backing field, hide it, and get its value, and override defaults if range.
                var fld = $(backingfld);
                item.data('rateit-value', fld.hide().val());

                if (fld[0].nodeName == 'INPUT') {
                    if (fld[0].type == 'range') {
                        lb = fld[0].min || lb;
                        ub = fld[0].max || ub;
                        step = fld[0].step || step;
                    }
                }
                if (fld[0].nodeName == 'SELECT' && fld[0].options.length > 1) {
                    lb = fld[0].options[0].value;
                    ub = fld[0].options[fld[0].length - 1].value;
                    step = fld[0].options[1].value - fld[0].options[0].value;
                }
            }

            //IE (and also chrome by now), support background-position-x, instead of background-position. Here we check what we mode we are in.
            bgx = item[0].style.backgroundPositionX !== undefined;

            //Create the needed tags.
            item.append('<div class="rateit-reset"></div><div class="rateit-range"><div class="rateit-selected" style="height:' + options.starheight + 'px"></div><div class="rateit-hover" style="height:' + options.starheight + 'px"></div></div>');

            //if we are in RTL mode, we have to change the float of the "reset button"
            if (!ltr) $('div.rateit-reset', item).css('float', 'right');

            //set the range element to fit all the stars.
            var range = $('div.rateit-range', item);
            range.width(options.starwidth * (ub - lb)).height(options.starheight);

            //set the value if we have it.
            if (item.data('rateit-value')) {
                var score = (item.data('rateit-value') - lb) * options.starwidth;
                item.find('div.rateit-selected').width(score);

                if (!ltr) {
                    //in RTL we have to change the X position of the background picture in order for it to be displayed correctly.
                    var buffer = score % options.starwidth;
                    $.fn.rateit.setBackgroundX($("div.rateit-selected", item), buffer);
                }
            }

            var resetbtn = $("div.rateit-reset", item);
            if (!readonly) {
                //if we are not read only, add all the events

                //if we have a reset button, set the event handler.
                if (resetable) {
                    buffer = resetbtn.width();
                    resetbtn.click(function () {
                        item.data('rateit-value', lb);
                        $("div.rateit-hover", item).hide().width(0);
                        $("div.rateit-selected", item).width(0).show();
                        if (backingfld) $(backingfld).val(lb);
                        item.trigger('reset');
                    });

                }
                else {
                    resetbtn.hide();
                }

                //when the mouse goes over the range div, we set the "hover" stars.
                range.mousemove(function (e) {
                    var offsetx = e.pageX - $(this).offset().left;

                    if (!ltr) offsetx = range.width() - offsetx;

                    var w = Math.ceil(offsetx / options.starwidth * (1 / step)) * options.starwidth * step;
                    var h = $("div.rateit-hover", item);
                    if (h.data("width") != w) {
                        $("div.rateit-selected", item).hide();
                        h.width(w).show();
                        if (!ltr) {
                            var buffer = w % options.starwidth;
                            $.fn.rateit.setBackgroundX(h, buffer);
                        }
                        h.data("width", w);
                    }
                });
                //when the mouse leaves the range, we have to hide the hover stars, and show the current value.
                range.mouseleave(function (e) {
                    $("div.rateit-hover", item).hide().width(0).data('width','');
                    $("div.rateit-selected", item).show();
                });
                //when we click on the range, we have to set the value, hide the hover.
                range.click(function (e) {
                    var offsetx = e.pageX - $(this).offset().left;
                    if (!ltr) offsetx = range.width() - offsetx;

                    var score = Math.ceil(offsetx / options.starwidth * (1 / step));
                    item.data('rateit-value', (score * step) + lb);
                    if (backingfld) $(backingfld).val((score * step) + lb);
                    $("div.rateit-selected", item).width(score * options.starwidth * step);
                    if (!ltr) {
                        var buffer = (score * options.starwidth * step) % options.starwidth;
                        $.fn.rateit.setBackgroundX($("div.rateit-selected", item), buffer);
                    }
                    $("div.rateit-hover", item).hide();
                    $("div.rateit-selected", item).show();
                    item.trigger('rated');

                });
            }
            else {
                resetbtn.hide();

            }

        });


    };

    //some default values.
    $.fn.rateit.defaults = { min: 0, max: 5, step: 0.5, starwidth: 16, starheight: 16, readonly: false, resetable: true };
    //a function to change the background position X axis.
    $.fn.rateit.setBackgroundX = function (element, x) {
        if (bgx) {
            element.css('background-position-x', x + 'px');
        }
        else {
            element.css('background-position', function (i, v) { return v.replace(/^\S+/, buffer + 'px'); });
        }
    };


    //invoke it on all div.rateit elements. This could be removed if not wanted.
    $('div.rateit').rateit();
})(jQuery);


