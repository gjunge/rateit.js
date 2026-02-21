(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rateit = /** @class */ (function () {
        function rateit() {
            this.index = 0;
            this.defaultOptions = {
                min: 0,
                max: 5,
                step: 0.5,
                mode: 'bg',
                icon: '★',
                starwidth: 16,
                starheight: 16,
                readonly: false,
                resetable: true,
                ispreset: false
            };
        }
        Object.defineProperty(rateit.prototype, "resetLabel", {
            get: function () { return 'reset rating'; },
            enumerable: false,
            configurable: true
        });
        ;
        Object.defineProperty(rateit.prototype, "ratingLabel", {
            get: function () { return 'rating'; },
            enumerable: false,
            configurable: true
        });
        ;
        rateit.prototype.enable = function (selector, options) {
            var _this = this;
            options = options || this.defaultOptions;
            selector = selector || '.rateit';
            var items = document.querySelectorAll(selector);
            var _loop_1 = function () {
                var item = items[i];
                //let dataSet = new DataSetWrapper(item);
                var dataset = rateit.getDataSetWrapper(item);
                if (dataset.getString('init')) {
                    this_1.redraw(item);
                    return "continue";
                }
                item.classList.add('rateit');
                var ltr = window.getComputedStyle(item).direction === 'ltr';
                dataset.set('mode', dataset.getString('mode') || options.mode);
                dataset.set('icon', dataset.getString('icon') || options.icon);
                dataset.set('min', isNaN(dataset.getNumber('min')) ? options.min : dataset.getNumber('min')); //since 0 is a valid entry, we check for isNaN
                dataset.set('max', isNaN(dataset.getNumber('max')) ? options.max : dataset.getNumber('max')); //since 0 is a valid entry, we check for isNaN
                dataset.set('step', dataset.getNumber('step') || options.step);
                dataset.set('resetable', dataset.getString('resetable') !== undefined ? dataset.getBoolean('resetable') : options.resetable);
                dataset.set('readonly', dataset.getString('readonly') !== undefined ? dataset.getBoolean('readonly') : options.readonly);
                dataset.set('ispreset', dataset.getString('ispreset') !== undefined ? dataset.getBoolean('ispreset') : options.ispreset);
                dataset.set('backingfld', dataset.getString('backingfld') || options.backingfld);
                dataset.set('starwidth', dataset.getNumber('starwidth') || options.starwidth);
                dataset.set('starheight', dataset.getNumber('starheight') || options.starheight);
                dataset.set('value', Math.max(dataset.getNumber('min'), Math.min(dataset.getNumber('max'), (!isNaN(dataset.getNumber('value')) ? dataset.getNumber('value') : options.value == null ? options.min : options.value))));
                if (dataset.getString('backingfld')) {
                    //if we have a backing field, hide it, override defaults if range or select.
                    var el = document.querySelector(dataset.getString('backingfld'));
                    var fld = el;
                    fld.style.display = 'none';
                    if (fld.disabled || fld.readOnly) {
                        dataset.set('readonly', true);
                    }
                    if (el.nodeName === 'INPUT') {
                        if (fld.type === 'range' || fld.type === 'text') { //in browsers not support the range type, it defaults to text
                            dataset.set('min', parseInt(fld.getAttribute('min')) || dataset.getNumber('min')); //if we would have done fld.min it wouldn't have worked in browsers not supporting the range type.
                            dataset.set('max', parseInt(fld.getAttribute('max')) || dataset.getNumber('max'));
                            dataset.set('step', parseInt(fld.getAttribute('step')) || dataset.getNumber('step'));
                        }
                    }
                    if (el.nodeName == 'SELECT' && el.options.length > 1) {
                        var select = el;
                        // If backing field is a select box with valuesrc option set to "index", use the indexes of its options; otherwise, use the values.
                        if (select.getAttribute('data-rateit-valuesrc') === 'index') {
                            dataset.set('min', (!isNaN(dataset.getNumber('min')) ? dataset.getNumber('min') : 0));
                            dataset.set('max', select.length - 1);
                            dataset.set('step', 1);
                        }
                        else {
                            dataset.set('min', (!isNaN(dataset.getNumber('min')) ? dataset.getNumber('min') : 0));
                            dataset.set('max', Number(select.options.item(select.length - 1).value));
                            dataset.set('step', Number(select.options.item(1).value) - Number(select.options.item(0).value));
                        }
                        //see if we have a option that as explicity been selected
                        selectedOption = select.querySelector('option[selected]');
                        if (selectedOption != null) {
                            // If backing field is a select box with valuesrc option set to "index", use the index of selected option; otherwise, use the value.
                            if (select.getAttribute('data-rateit-valuesrc') === 'index') {
                                dataset.set('value', selectedOption.index);
                            }
                            else {
                                dataset.set('value', selectedOption.value);
                            }
                        }
                    }
                    else {
                        //if it is not a select box, we can get's it's value using the val function. 
                        //If it is a selectbox, we always get a value (the first one of the list), even if it was not explicity set.
                        dataset.set('value', fld.value);
                    }
                }
                //Create the necessary tags. For ARIA purposes we need to give the items an ID. So we use an internal index to create unique ids
                var element = item.nodeName === 'DIV' ? 'div' : 'span';
                this_1.index++;
                html = "<button id=\"rateit-reset-".concat(this_1.index, "\" type=\"button\" data-role=\"none\" class=\"rateit-reset\" aria-label=\"").concat(this_1.resetLabel, "\" aria-controls=\"rateit-range-").concat(this_1.index, "\"><span></span></button><").concat(element, " id=\"rateit-range-").concat(this_1.index, "\" class=\"rateit-range\" tabindex=\"0\" role=\"slider\" aria-label=\"").concat(this_1.ratingLabel, "\" aria-owns=\"rateit-reset-").concat(this_1.index, "\" aria-valuemin=\"").concat(dataset.getNumber('min'), "\" aria-valuemax=\"").concat(dataset.getNumber('max'), "\" aria-valuenow=\"").concat(dataset.getNumber('value'), "\"><").concat(element, " class=\"rateit-empty\"></").concat(element, "><").concat(element, " class=\"rateit-selected\"></").concat(element, "><").concat(element, " class=\"rateit-hover\"></").concat(element, "></").concat(element, ">");
                item.insertAdjacentHTML('beforeend', html);
                if (!ltr) {
                    item.querySelector('.rateit-reset').style.cssFloat = 'right';
                    item.querySelector('.rateit-selected').classList.add('rateit-selected-rtl');
                    item.querySelector('.rateit-hover').classList.add('rateit-hover-rtl');
                }
                //setup the reset button
                var resetbtn = item.querySelector('.rateit-reset');
                resetbtn.addEventListener('click', function (ev) {
                    resetbtn.blur();
                    var beforeResetEvent = new Event('beforereset');
                    //if the beforereset event was cancelled then do not continue resetting
                    if (!item.dispatchEvent(beforeResetEvent)) {
                        return false;
                    }
                    var initialOptions = JSON.parse(dataset.getString('init'));
                    if (initialOptions.ispreset) {
                        _this.options(item, { ispreset: true, value: initialOptions.value });
                    }
                    else {
                        _this.value(item, null);
                    }
                    item.dispatchEvent(new Event('reset'));
                    return false;
                }, false);
                //setup other events
                var range = item.querySelector('.rateit-range');
                if (!dataset.getBoolean('readonly')) {
                    range.addEventListener('touchmove', rateit.touchHandler, false);
                    range.addEventListener('touchend', rateit.touchHandler, false);
                    range.addEventListener('mousemove', function (e) {
                        var score = _this.calcRawScore(item, e);
                        _this.setHover(item, score);
                    });
                    //when the mouse leaves the range, we have to hide the hover stars, and show the current value.
                    range.addEventListener('mouseleave', function (e) {
                        var rateitHover = (range.querySelector('.rateit-hover'));
                        rateitHover.style.display = 'none';
                        rateitHover.style.width = '0';
                        rateitHover.dataset['width'] = '';
                        item.dispatchEvent(new CustomEvent('hover'));
                        item.dispatchEvent(new CustomEvent('over'));
                        (range.querySelector('.rateit-selected')).style.display = 'block';
                    });
                    //when we click on the range, we have to set the value, hide the hover.
                    range.addEventListener('mouseup', function (e) {
                        var score = _this.calcRawScore(item, e);
                        var value = (score * dataset.getNumber('step')) + dataset.getNumber('min');
                        _this.value(item, value, true);
                        range.blur();
                    });
                    //support key nav
                    range.addEventListener('keyup', function (e) {
                        if (e.which == 38 || e.which == (ltr ? 39 : 37)) {
                            var value = Math.min(dataset.getNumber('value') + dataset.getNumber('step'), dataset.getNumber('max'));
                            _this.value(item, value, true);
                        }
                        if (e.which == 40 || e.which == (ltr ? 37 : 39)) {
                            var value = Math.max(dataset.getNumber('value') - dataset.getNumber('step'), dataset.getNumber('min'));
                            _this.value(item, value, true);
                        }
                    });
                }
                dataset.set('init', JSON.stringify(this_1.options(item))); //cheap way to create a clone
                this_1.redraw(item);
            };
            var this_1 = this, selectedOption, html;
            for (var i = 0; i < items.length; i++) {
                _loop_1();
            }
        };
        rateit.prototype.options = function (selectorOrElement, options) {
            var element = rateit.getElementFromSelectorOrElement(selectorOrElement);
            var dataset = rateit.getDataSetWrapper(element);
            if (typeof (options) === 'undefined') {
                var numberProps = ['value', 'min', 'max', 'step', 'starwidth', 'starheight'];
                var booleanProps = ['readonly', 'ispreset', 'resetable'];
                var opts = {};
                for (var property in element.dataset) {
                    if (element.dataset.hasOwnProperty(property) && property !== 'rateitInit') {
                        var key = property.substring('rateit'.length).toLowerCase();
                        var raw = element.dataset[property];
                        if (numberProps.indexOf(key) !== -1) {
                            opts[key] = Number(raw);
                        }
                        else if (booleanProps.indexOf(key) !== -1) {
                            opts[key] = raw === 'true';
                        }
                        else {
                            opts[key] = raw;
                        }
                    }
                }
                return opts;
            }
            if (options.hasOwnProperty('value')) {
                //if we also got the value passed in, call the value method, since that takes also care of setting the correct value in the backingfield.
                this.value(element, options.value, false);
            }
            for (var property in options) {
                if (options.hasOwnProperty(property) && property !== 'init') {
                    dataset.set(property, options[property]);
                }
            }
            this.redraw(element);
        };
        rateit.prototype.value = function (selectorOrElement, value, raiseEvents) {
            var element = rateit.getElementFromSelectorOrElement(selectorOrElement);
            var dataset = rateit.getDataSetWrapper(element);
            if (typeof (value) === 'undefined')
                return dataset.getNumber('value');
            if (value === null) {
                value = dataset.getNumber('min');
            }
            var range = element.querySelector('.rateit-range');
            var rangeComputedStyle = window.getComputedStyle(range);
            var presetclass = "rateit-preset".concat((rangeComputedStyle.direction === 'ltr') ? '' : '-rtl');
            if (raiseEvents === true) {
                var event_1 = new CustomEvent('beforerated', { detail: { value: value } }); // has to be CustomEvent 
                if (!element.dispatchEvent(event_1)) {
                    return false;
                }
            }
            dataset.set('value', value);
            if (dataset.getString('backingfld') != null) {
                // If backing field is a select box with valuesrc option set to "index", update its selectedIndex property; otherwise, update its value.
                var backingFld = document.querySelector(dataset.getString('backingfld'));
                if (backingFld.nodeName == 'SELECT' && backingFld.getAttribute('data-rateit-valuesrc') === 'index') {
                    backingFld.selectedIndex = value;
                }
                else {
                    backingFld.value = value.toString();
                }
                if (raiseEvents === true) {
                    var evt = new Event('change', { bubbles: true, cancelable: false });
                    backingFld.dispatchEvent(evt);
                }
            }
            if (dataset.getBoolean('ispreset')) { //if it was a preset value, unset that.
                (range.querySelector('.rateit-selected')).classList.remove(presetclass);
                dataset.set('ispreset', false);
            }
            (range.querySelector('.rateit-hover')).style.display = 'none';
            var rateItSelected = (range.querySelector('.rateit-selected'));
            rateItSelected.style.width = "".concat(value * dataset.getNumber('starwidth') - (dataset.getNumber('min') * dataset.getNumber('starwidth')), "px");
            rateItSelected.style.display = 'block';
            if (raiseEvents === true) {
                element.dispatchEvent(new CustomEvent('hover'));
                element.dispatchEvent(new CustomEvent('over'));
                element.dispatchEvent(new CustomEvent('rated', { detail: { value: value } }));
            }
            return true;
        };
        rateit.prototype.revert = function (selectorOrElement) {
            var element = rateit.getElementFromSelectorOrElement(selectorOrElement);
            var dataset = rateit.getDataSetWrapper(element);
            this.options(selectorOrElement, JSON.parse(dataset.getString('init')));
        };
        rateit.prototype.setHover = function (element, score) {
            var dataset = rateit.getDataSetWrapper(element);
            var range = element.querySelector('.rateit-range');
            var w = score * dataset.getNumber('starwidth') * dataset.getNumber('step');
            var h = range.querySelector('.rateit-hover');
            if (h.dataset['width'] != w.toString()) {
                (range.querySelector('.rateit-selected')).style.display = 'none';
                h.style.width = "".concat(w, "px");
                h.style.display = 'block';
                h.dataset['width'] = w.toString();
                var value = [(score * dataset.getNumber('step')) + dataset.getNumber('min')];
                var ev = new CustomEvent('hover', {
                    detail: {
                        value: (score * dataset.getNumber('step')) + dataset.getNumber('min')
                    }
                });
                element.dispatchEvent(new CustomEvent('hover', { detail: { value: value } }));
                element.dispatchEvent(new CustomEvent('over', { detail: { value: value } }));
            }
        };
        rateit.prototype.calcRawScore = function (el, ev) {
            var pageX = (ev.type.substring(0, 5) === 'touch')
                ? ev.changedTouches[0].pageX
                : ev.pageX;
            var dataset = rateit.getDataSetWrapper(el);
            var range = el.querySelector('.rateit-range');
            var rangeComputedStyle = window.getComputedStyle(range);
            var offsetLeft = range.getBoundingClientRect().left + document.body.scrollLeft;
            var rangeWidth = parseInt(rangeComputedStyle.width);
            var offsetx = pageX - offsetLeft;
            if (rangeComputedStyle.direction === 'rtl') {
                offsetx = parseInt(rangeComputedStyle.width) - offsetx;
            }
            ;
            if (offsetx > rangeWidth) {
                offsetx = rangeWidth;
            }
            if (offsetx < 0) {
                offsetx = 0;
            }
            return Math.ceil(offsetx / dataset.getNumber('starwidth') * (1 / dataset.getNumber('step')));
        };
        rateit.prototype.redraw = function (element) {
            var dataset = rateit.getDataSetWrapper(element);
            var isfont = dataset.getString('mode') === 'font';
            var range = element.querySelector('.rateit-range');
            var rangeComputedStyle = window.getComputedStyle(range);
            var ltr = rangeComputedStyle.direction === 'ltr';
            if (isfont) {
                element.classList.add('rateit-font');
                element.classList.remove('rateit-bg');
                //fill the ranges with the icons
                var icon = dataset.getString('icon');
                var stars = dataset.getNumber('max') - dataset.getNumber('min');
                var txt_1 = '';
                for (var i = 0; i < stars; i++) {
                    txt_1 += icon;
                }
                Array.prototype.forEach.call(range.children, function (item) {
                    item.innerText = txt_1;
                });
                dataset.set('starwidth', parseInt(rangeComputedStyle.width) / (dataset.getNumber('max') - dataset.getNumber('min')));
                range.style.width = '';
                range.style.height = '';
                Array.prototype.forEach.call(element.querySelectorAll('.rateit-selected, .rateit-hover'), function (item) {
                    item.style.height = '';
                });
            }
            else {
                element.classList.add('rateit-bg');
                element.classList.remove('rateit-font');
                Array.prototype.forEach.call(range.children, function (item) {
                    item.innerText = '';
                });
                //set the range element to fit all the stars.
                range.style.width = "".concat(dataset.getNumber('starwidth') * (dataset.getNumber('max') - dataset.getNumber('min')), "px");
                range.style.height = "".concat(dataset.getNumber('starheight'), "px");
                Array.prototype.forEach.call(element.querySelectorAll('.rateit-selected, .rateit-hover'), function (item) {
                    item.style.height = "".concat(dataset.getNumber('starheight'), "px");
                });
            }
            //add/remove the preset class
            var presetclass = "rateit-preset".concat((ltr) ? '' : '-rtl');
            if (dataset.getBoolean('ispreset')) {
                element.querySelector('.rateit-selected').classList.add(presetclass);
            }
            else {
                element.querySelector('.rateit-selected').classList.remove(presetclass);
            }
            //set the value if we have it.
            if (dataset.getNumber('value') != null) {
                var score = (dataset.getNumber('value') - dataset.getNumber('min')) * dataset.getNumber('starwidth');
                (element.querySelector('.rateit-selected')).style.width = "".concat(score, "px");
            }
            //sets the hover element based on the score.
            var resetbtn = element.querySelector('.rateit-reset');
            if (!dataset.getBoolean('readonly')) {
                //if we are not read only, add all the events
                //if we have a reset button, set the event handler.
                if (!dataset.getBoolean('resetable')) {
                    resetbtn.style.display = 'none';
                }
                if (dataset.getBoolean('resetable')) {
                    resetbtn.style.display = 'block';
                }
            }
            else {
                resetbtn.style.display = 'none';
            }
            range.setAttribute('aria-readonly', dataset.getString('readonly'));
        };
        rateit.getElementFromSelectorOrElement = function (selectorOrElement) {
            if (typeof (selectorOrElement) === 'string') {
                return document.querySelector(selectorOrElement);
            }
            else {
                return selectorOrElement;
            }
        };
        //touch converter http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/
        rateit.touchHandler = function (event) {
            var touches = event.changedTouches, first = touches[0], type = "";
            switch (event.type) {
                case "touchmove":
                    type = "mousemove";
                    break;
                case "touchend":
                    type = "mouseup";
                    break;
                default: return;
            }
            var simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
            first.target.dispatchEvent(simulatedEvent);
            event.preventDefault();
        };
        rateit.getDataSetWrapper = function (item) {
            var createKey = function (key) {
                return 'rateit' + key.charAt(0).toUpperCase() + key.substr(1);
            };
            return {
                getNumber: function (key) { return Number(item.dataset[createKey(key)]); },
                getBoolean: function (key) { return item.dataset[createKey(key)] === 'true'; },
                getString: function (key) { return item.dataset[createKey(key)]; },
                set: function (key, value) {
                    if (value == null) {
                        delete item.dataset[createKey(key)]; //might not work in safari http://stackoverflow.com/questions/9200712/how-to-remove-data-attributes-using-html5-dataset
                    }
                    else {
                        item.dataset[createKey(key)] = value.toString();
                    }
                }
            };
        };
        return rateit;
    }());
    exports.default = rateit;
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function () {
            var _rateit = new rateit();
            _rateit.enable();
        });
    }
});
