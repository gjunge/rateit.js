/*
    RateIt
    version 0.94
    11/21/2010
    http://rateit.codeplex.com
    Twitter: @gjunge

*/
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
            var starw = item.data('rateit-starwidth') || options.starwidth;
            var starh = item.data('rateit-starheight') || options.starheight;

            //are we LTR or RTL?
            var ltr = item.css('direction') != 'rtl';
            if (backingfld) {
                //if we have a backing field, hide it, and get its value, and override defaults if range.
                var fld = $(backingfld);
                item.data('rateit-value', fld.hide().val());

                if (fld[0].nodeName == 'INPUT') {
                    if (fld[0].type == 'range' || fld[0].type == 'text') { //in browsers not support the range type, it defaults to text

                        lb = fld.attr('min') || lb; //if we would have done fld[0].min it wouldn't have worked in browsers not supporting the range type.
                        ub = fld.attr('max') || ub;
                        step = fld.attr('step') || step;
                    }
                }
                if (fld[0].nodeName == 'SELECT' && fld[0].options.length > 1) {
                    lb = fld[0].options[0].value;
                    ub = fld[0].options[fld[0].length - 1].value;
                    step = fld[0].options[1].value - fld[0].options[0].value;
                }
            }

            //Create the needed tags.
            item.append('<div class="rateit-reset"></div><div class="rateit-range"><div class="rateit-selected" style="height:' + starh + 'px"></div><div class="rateit-hover" style="height:' + starh + 'px"></div></div>');

            //if we are in RTL mode, we have to change the float of the "reset button"
            if (!ltr) {
                $('div.rateit-reset', item).css('float', 'right');
                $('div.rateit-selected', item).addClass('rateit-selected-rtl');
                $('div.rateit-hover', item).addClass('rateit-hover-rtl');
            }

            //set the range element to fit all the stars.
            var range = $('div.rateit-range', item);
            range.width(starw * (ub - lb)).height(starh);

            //set the value if we have it.
            if (item.data('rateit-value')) {
                var score = (item.data('rateit-value') - lb) * starw;
                item.find('div.rateit-selected').width(score);
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

                    var w = Math.ceil(offsetx / starw * (1 / step)) * starw * step;
                    var h = $("div.rateit-hover", item);
                    if (h.data("width") != w) {
                        $("div.rateit-selected", item).hide();
                        h.width(w).show();
                        h.data("width", w);
                    }
                });
                //when the mouse leaves the range, we have to hide the hover stars, and show the current value.
                range.mouseleave(function (e) {
                    $("div.rateit-hover", item).hide().width(0).data('width', '');
                    $("div.rateit-selected", item).show();
                });
                //when we click on the range, we have to set the value, hide the hover.
                range.click(function (e) {
                    var offsetx = e.pageX - $(this).offset().left;
                    if (!ltr) offsetx = range.width() - offsetx;

                    var score = Math.ceil(offsetx / starw * (1 / step));
                    item.data('rateit-value', (score * step) + lb);
                    if (backingfld) $(backingfld).val((score * step) + lb);
                    $("div.rateit-selected", item).width(score * starw * step);
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

    //invoke it on all div.rateit elements. This could be removed if not wanted.
    $('div.rateit').rateit();
})(jQuery);