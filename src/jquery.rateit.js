/*
    RateIt
    version 0.97
    01/03/2011
    http://rateit.codeplex.com
    Twitter: @gjunge

*/
(function ($) {
    $.fn.rateit = function (p1, p2) {
        //quick way out.
        var options = {}; var mode = 'init';
        if (this.length == 0) return this;


        var tp1 = $.type(p1);
        if (tp1 == 'object' || p1 === undefined || p1 == null) {
            options = $.extend({}, $.fn.rateit.defaults, p1); //wants to init new rateit plugin(s).
        }
        else if (tp1 == 'string' && p2 === undefined) {
            return this.data('rateit-' + p1); //wants to get a value.
        }
        else if (tp1 == 'string') {
            mode = 'setvalue'
        }

        return this.each(function () {
            var item = $(this);

            //shorten all the item('rateit-XXX'), will save space in closure compiler, will be like item.data('XXX') will become x('XXX')
            var itemdata = function (key, value) { return item.data('rateit-' + key, value); };

            //add the rate it class.
            if (!item.hasClass('rateit')) item.addClass('rateit');

            var ltr = item.css('direction') != 'rtl';

            // set value mode
            if (mode == 'setvalue') {
                if (!itemdata('init')) throw 'Can\'t set a value when plugin is not intialized';


                //if readonly now and it wasn't readonly, remove the eventhandlers.
                if (p1 == 'readonly' && !itemdata('readonly')) {
                    $('div.rateit-range', item).unbind('mouseleave').unbind('mousemove').unbind('click');

                }

                if (itemdata('backingfld')) {
                    //if we have a backing field, check which fields we should update. 
                    //In case of input[type=range], although we did read its attributes even in browsers that don't support it (using fld.attr())
                    //we only update it in browser that support it (&& fld[0].min only works in supporting browsers), not only does it save us from checking if it is range input type, it also is unnecessary.
                    var fld = $(itemdata('backingfld'));
                    if (p1 == 'value') fld.val(p2);
                    if (p1 == 'min' && fld[0].min) fld[0].min = p2;
                    if (p1 == 'max' && fld[0].max) fld[0].max = p2;
                    if (p1 == 'step' && fld[0].step) fld[0].step = p2;
                }

                itemdata(p1, p2);
            }

            //init rateit plugin
            if (!itemdata('init')) {

                //get our values, either from the data-* html5 attribute or from the options.
                itemdata('min', itemdata('min') || options.min);
                itemdata('max', itemdata('max') || options.max);
                itemdata('step', itemdata('step') || options.step);
                itemdata('readonly', itemdata('readonly') !== undefined ? itemdata('readonly') : options.readonly);
                itemdata('resetable', itemdata('resetable') !== undefined ? itemdata('resetable') : options.resetable);
                itemdata('backingfld', itemdata('backingfld') || options.backingfld);
                itemdata('starwidth', itemdata('starwidth') || options.starwidth);
                itemdata('starheight', itemdata('starheight') || options.starheight);
                itemdata('value', itemdata('value') || options.min);
                //are we LTR or RTL?

                if (itemdata('backingfld')) {
                    //if we have a backing field, hide it, and get its value, and override defaults if range.
                    var fld = $(itemdata('backingfld'));
                    itemdata('value', fld.hide().val());

                    if (fld[0].nodeName == 'INPUT') {
                        if (fld[0].type == 'range' || fld[0].type == 'text') { //in browsers not support the range type, it defaults to text

                            itemdata('min', parseInt(fld.attr('min')) || itemdata('min')); //if we would have done fld[0].min it wouldn't have worked in browsers not supporting the range type.
                            itemdata('max', parseInt(fld.attr('max')) || itemdata('max'));
                            itemdata('step', parseInt(fld.attr('step')) || itemdata('step'));
                        }
                    }
                    if (fld[0].nodeName == 'SELECT' && fld[0].options.length > 1) {
                        itemdata('min', parseInt(fld[0].options[0].value));
                        itemdata('max', parseInt(fld[0].options[fld[0].length - 1].value));
                        itemdata('step', parseInt(fld[0].options[1].value - fld[0].options[0].value));
                    }
                }

                //Create the needed tags.
                item.append('<div class="rateit-reset"></div><div class="rateit-range"><div class="rateit-selected" style="height:' + itemdata('starheight') + 'px"></div><div class="rateit-hover" style="height:' + itemdata('starheight') + 'px"></div></div>');

                //if we are in RTL mode, we have to change the float of the "reset button"
                if (!ltr) {
                    $('div.rateit-reset', item).css('float', 'right');
                    $('div.rateit-selected', item).addClass('rateit-selected-rtl');
                    $('div.rateit-hover', item).addClass('rateit-hover-rtl');
                }
                itemdata('init', true);
            }


            //set the range element to fit all the stars.
            var range = $('div.rateit-range', item);
            range.width(itemdata('starwidth') * (itemdata('max') - itemdata('min'))).height(itemdata('starheight'));

            //set the value if we have it.
            if (itemdata('value')) {
                var score = (itemdata('value') - itemdata('min')) * itemdata('starwidth');
                item.find('div.rateit-selected').width(score);
            }

            var resetbtn = $("div.rateit-reset", item);

            var calcRawScore = function (element, event) {
                var offsetx = event.pageX - $(element).offset().left;
                if (!ltr) offsetx = range.width() - offsetx;
                return score = Math.ceil(offsetx / itemdata('starwidth') * (1 / itemdata('step')));
            };

            if (!itemdata('readonly')) {
                //if we are not read only, add all the events

                //if we have a reset button, set the event handler.
                if (itemdata('resetable')) {
                    resetbtn.click(function () {
                        itemdata('value', itemdata('min'));
                        $("div.rateit-hover", item).hide().width(0);
                        $("div.rateit-selected", item).width(0).show();
                        if (itemdata('backingfld')) $(itemdata('backingfld')).val(itemdata('min'));
                        item.trigger('reset');
                    });

                }
                else {
                    resetbtn.hide();
                }



                //when the mouse goes over the range div, we set the "hover" stars.
                range.mousemove(function (e) {
                    var score = calcRawScore(this, e);
                    var w = score * itemdata('starwidth') * itemdata('step');
                    var h = $("div.rateit-hover", item);
                    if (h.data("width") != w) {
                        $("div.rateit-selected", item).hide();
                        h.width(w).show();
                        h.data("width", w);
                        item.trigger('hover', [(score * itemdata('step')) + itemdata('min')]);
                    }
                });
                //when the mouse leaves the range, we have to hide the hover stars, and show the current value.
                range.mouseleave(function (e) {
                    $("div.rateit-hover", item).hide().width(0).data('width', '');
                    item.trigger('hover', [null]);
                    $("div.rateit-selected", item).show();
                });
                //when we click on the range, we have to set the value, hide the hover.
                range.click(function (e) {
                    var score = calcRawScore(this, e);
                    var newvalue = (score * itemdata('step')) + itemdata('min');
                    itemdata('value', newvalue);
                    if (itemdata('backingfld')) {
                        $(itemdata('backingfld')).val(newvalue);
                    }
                    $("div.rateit-selected", item).width(score * itemdata('starwidth') * itemdata('step'));
                    $("div.rateit-hover", item).hide();
                    item.trigger('hover', [null]);
                    $("div.rateit-selected", item).show();
                    item.trigger('rated', [newvalue]);

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