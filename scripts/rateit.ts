export type RateItMode = "bg" | "font";

export interface RateItOptions {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    backingfld?: string;
    readonly?: boolean;
    ispreset?: boolean;
    resetable?: boolean;
    starwidth?: number;
    starheight?: number;
    mode?: RateItMode;
    icon?: string;
    [key: string]: any;
}

interface DataSetWrapper {

    getNumber(key: RateItItemDataTypes): number;
    getBoolean(key: RateItItemDataTypes): boolean;
    getString(key: RateItItemDataTypes): string;
    set(key: RateItItemDataTypes, value: any): void;
}

function getDataSetWrapper(item: HTMLElement): DataSetWrapper {
    const createKey = function (key: string) {
        return 'rateit' + key.charAt(0).toUpperCase() + key.substr(1);
    };
    return {
        getNumber: (key: RateItItemDataTypes): number => Number(item.dataset[createKey(key)]),
        getBoolean: (key: RateItItemDataTypes): boolean => item.dataset[createKey(key)] === 'true',
        getString: (key: RateItItemDataTypes): string => item.dataset[createKey(key)],
        set: (key: RateItItemDataTypes, value: any) => {
            if (value == null) {
                delete item.dataset[createKey(key)]; //might not work in safari http://stackoverflow.com/questions/9200712/how-to-remove-data-attributes-using-html5-dataset
            }
            else {
                item.dataset[createKey(key)] = value.toString();
            }
        }
    };
}

type RateItItemDataTypes = "init" | "value" | "min" | "max" | "step" | "backingfld" | "readonly" | "ispreset" | "resetable" | "starwidth" | "starheight" | "mode" | "icon";

export default class rateit {

    private index: number = 0;

    private defaultOptions: RateItOptions = {
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

    public get resetLabel(): string { return 'reset rating' };

    public get ratingLabel(): string { return 'rating' };

    public enable(): void
    public enable(selector: string): void
    public enable(selector: string, options: RateItOptions): void
    public enable(selector?: string, options?: RateItOptions): void {
        options = options || this.defaultOptions;
        selector = selector || '.rateit';

        let items = document.querySelectorAll(selector);

        for (var i = 0; i < items.length; i++) {
            let item = <HTMLElement>items[i];
            //let dataSet = new DataSetWrapper(item);
            let dataset: DataSetWrapper = getDataSetWrapper(item);

            item.classList.add('rateit');

            let ltr = window.getComputedStyle(item).direction === 'ltr';

            dataset.set('mode', dataset.getString('mode') || options.mode)
            dataset.set('icon', dataset.getString('icon') || options.icon)
            dataset.set('min', isNaN(dataset.getNumber('min')) ? options.min : dataset.getNumber('min'))
            dataset.set('max', isNaN(dataset.getNumber('max')) ? options.max : dataset.getNumber('max'))
            dataset.set('step', item.dataset['step'] || options.step)
            dataset.set('resetable', item.dataset['resetable'] !== undefined ? item.dataset['resetable'] : options.resetable)
            dataset.set('readonly', item.dataset['readonly'] !== undefined ? item.dataset['readonly'] : options.readonly)
            dataset.set('ispreset', item.dataset['ispreset'] !== undefined ? item.dataset['ispreset'] : options.ispreset)
            dataset.set('backingfld', item.dataset['backingfld'] || options.backingfld)
            dataset.set('starwidth', dataset.getNumber('starwidth') || options.starwidth)
            dataset.set('starheight', dataset.getNumber('starheight') || options.starheight)
            dataset.set('value', Math.max(dataset.getNumber('min'), Math.min(dataset.getNumber('max'), (!isNaN(dataset.getNumber('value')) ? dataset.getNumber('value') : options.value == null ? options.min : options.value))))

            if (dataset.getString('backingfld')) {
                //if we have a backing field, hide it, override defaults if range or select.
                const el = document.querySelector(dataset.getString('backingfld'));
                const fld = <HTMLInputElement>el;
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

                if (el.nodeName == 'SELECT' && (<HTMLSelectElement>el).options.length > 1) {
                    let select = <HTMLSelectElement>el;
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
                    var selectedOption = <HTMLOptionElement>select.querySelector('option[selected]');
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
            let element = item.nodeName === 'DIV' ? 'div' : 'span';
            this.index++;

            var html = `<button id="rateit-reset-${this.index}" type="button" data-role="none" class="rateit-reset" aria-label="${this.resetLabel}" aria-controls="rateit-range-${this.index}"><span></span></button><${element} id="rateit-range-${this.index}" class="rateit-range" tabindex="0" role="slider" aria-label="${this.ratingLabel}" aria-owns="rateit-reset-${this.index}" aria-valuemin="${dataset.getNumber('min')}" aria-valuemax="${dataset.getNumber('max')}" aria-valuenow="${dataset.getNumber('value')}"><${element} class="rateit-empty"></${element}><${element} class="rateit-selected"></${element}><${element} class="rateit-hover"></${element}></${element}>`;
            item.insertAdjacentHTML('beforeend', html);

            if (!ltr) {
                (<HTMLElement>item.querySelector('.rateit-reset')).style.cssFloat = 'right';
                (<HTMLElement>item.querySelector('.rateit-selected')).classList.add('rateit-selected-rtl');
                (<HTMLElement>item.querySelector('.rateit-hover')).classList.add('rateit-hover-rtl');
            }

            //setup the reset button
            const resetbtn = <HTMLElement>item.querySelector('.rateit-reset');
            resetbtn.addEventListener('click', (ev) => {

                resetbtn.blur();
                const beforeResetEvent = new Event('beforereset');

                //if the beforereset event was cancelled then do not continue resetting
                if (!item.dispatchEvent(beforeResetEvent)) {
                    return false;
                }

                this.value(item, null);
                item.dispatchEvent(new Event('reset'));



                return false;
            }, false);

            //setup other events
            const range = <HTMLElement>item.querySelector('.rateit-range');

            range.addEventListener('touchmove', rateit.touchHandler, false);
            range.addEventListener('touchend', rateit.touchHandler, false);
            range.addEventListener('mousemove', (e: MouseEvent) => {
                var score = this.calcRawScore(item, e);
                this.setHover(item, score);
            });

            //when the mouse leaves the range, we have to hide the hover stars, and show the current value.
            range.addEventListener('mouseleave', (e: MouseEvent) => {
                const rateitHover = (<HTMLElement>(range.querySelector('.rateit-hover')));
                rateitHover.style.display = 'none';
                rateitHover.style.width = '0';
                rateitHover.dataset['width'] = '';;
                item.dispatchEvent(new CustomEvent('hover'));
                item.dispatchEvent(new CustomEvent('over'));

                (<HTMLElement>(range.querySelector('.rateit-selected'))).style.display = 'block';
            });
            //when we click on the range, we have to set the value, hide the hover.
            range.addEventListener('mouseup', (e: MouseEvent) => {
                var score = this.calcRawScore(item, e);
                var value = (score * dataset.getNumber('step')) + dataset.getNumber('min');
                this.value(item, value, true);
                range.blur();
            });

            //support key nav
            range.addEventListener('keyup', (e: KeyboardEvent) => {
                if (e.which == 38 || e.which == (ltr ? 39 : 37)) {
                    const value = Math.min(dataset.getNumber('value') + dataset.getNumber('step'), dataset.getNumber('max'));
                    this.value(item, value, true);
                }
                if (e.which == 40 || e.which == (ltr ? 37 : 39)) {
                    const value = Math.max(dataset.getNumber('value') - dataset.getNumber('step'), dataset.getNumber('min'));
                    this.value(element, value, true);
                }
            });


            dataset.set('init', JSON.stringify(item.dataset));//cheap way to create a clone

            this.redraw(item);
        }
    }

    public options(selector: string, options: RateItOptions): void
    public options(element: HTMLElement, options: RateItOptions): void
    public options(selector: string): RateItOptions
    public options(element: HTMLElement): RateItOptions
    public options(selectorOrElement: any, options?: RateItOptions): any {
        const element: HTMLElement = rateit.getElementFromSelectorOrElement(selectorOrElement);
        const dataset = getDataSetWrapper(element);
        if (typeof (options) === 'undefined') {
            let opts: any = {};
            for (var property in element.dataset) {
                if (element.dataset.hasOwnProperty(property) && property !== 'rateitInit') {
                    opts[property.substring('rateit'.length).toLowerCase()] = element.dataset[property];
                }
            }
            return opts;
        }

        for (var property in options) {
            if (options.hasOwnProperty(property) && property !== 'init') {
                dataset.set(<RateItItemDataTypes>property, options[property]);
            }
        }

        this.redraw(element);

    }


    public value(element: HTMLElement): Number
    public value(selector: HTMLElement): Number
    public value(element: HTMLElement, value: number): boolean
    public value(selector: string, value: number): boolean
    public value(element: HTMLElement, value: number, raiseEvents: boolean): boolean
    public value(selector: string, value: number, raiseEvents: boolean): boolean
    public value(selectorOrElement: any, value?: number, raiseEvents?: boolean): any {
        const element: HTMLElement = rateit.getElementFromSelectorOrElement(selectorOrElement);
        const dataset: DataSetWrapper = getDataSetWrapper(element);

        if (typeof (value) === 'undefined')
            return dataset.getNumber('value');

        const range = <HTMLElement>element.querySelector('.rateit-range');
        const rangeComputedStyle = window.getComputedStyle(range);
        const presetclass = `rateit-preset${(rangeComputedStyle.direction === 'ltr') ? '' : '-rtl'}`;

        if (raiseEvents === true) {
            const event = new CustomEvent('beforerated', { detail: { value: value } }); // has to be CustomEvent 

            if (!element.dispatchEvent(event)) {
                return false;
            }
        }

        dataset.set('value', value);

        if (dataset.getString('backingfld') != null) {
            // If backing field is a select box with valuesrc option set to "index", update its selectedIndex property; otherwise, update its value.
            const backingFld = document.querySelector(dataset.getString('backingfld'));

            if (backingFld.nodeName == 'SELECT' && backingFld.getAttribute('data-rateit-valuesrc') === 'index') {
                (<HTMLSelectElement>backingFld).selectedIndex = value;
            }
            else {
                (<HTMLInputElement>backingFld).value = value.toString();

            }

            if (raiseEvents === true) {
                const evt = new Event('change', { bubbles: true, cancelable: false });
                backingFld.dispatchEvent(evt);
            }

        }
        if (dataset.getBoolean('ispreset')) { //if it was a preset value, unset that.
            (<HTMLElement>(range.querySelector('.rateit-selected'))).classList.remove(presetclass);
            dataset.set('ispreset', false);
        }


        (<HTMLElement>(range.querySelector('.rateit-hover'))).style.display = 'none';
        const rateItSelected = (<HTMLElement>(range.querySelector('.rateit-selected')));
        rateItSelected.style.width = `${value * dataset.getNumber('starwidth') - (dataset.getNumber('min') * dataset.getNumber('starwidth'))}px`;
        rateItSelected.style.display = 'block';

        if (raiseEvents === true) {
            element.dispatchEvent(new CustomEvent('hover'));
            element.dispatchEvent(new CustomEvent('over'));
            element.dispatchEvent(new CustomEvent('rated', { detail: { value: value } }));
        }

        return true;
    }


    public reset(element: HTMLElement): void
    public reset(selector: string): void
    public reset(selectorOrElement: any): void {
        const element: HTMLElement = rateit.getElementFromSelectorOrElement(selectorOrElement);
        const dataset: DataSetWrapper = getDataSetWrapper(element);


    }


    private setHover(element: HTMLElement, score: number): void {
        const dataset = getDataSetWrapper(element);
        const range = <HTMLElement>element.querySelector('.rateit-range');

        var w = score * dataset.getNumber('starwidth') * dataset.getNumber('step');
        var h = <HTMLElement>range.querySelector('.rateit-hover');
        if (h.dataset['width'] != w.toString()) {
            (<HTMLElement>(range.querySelector('.rateit-selected'))).style.display = 'none';
            h.style.width = `${w}px`;
            h.style.display = 'block';
            h.dataset['width'] = w.toString();
            const value = [(score * dataset.getNumber('step')) + dataset.getNumber('min')];
            var ev = new CustomEvent('hover', {
                detail: {
                    value: (score * dataset.getNumber('step')) + dataset.getNumber('min')
                }
            })
            element.dispatchEvent(new CustomEvent('hover', { detail: { value: value } }));
            element.dispatchEvent(new CustomEvent('over', { detail: { value: value } }));
        }
    }

    private calcRawScore(el: HTMLElement, ev: UIEvent): number {
        const pageX: number = (event.type.substring(0, 5) === 'touch')
            ? (<TouchEvent>ev).changedTouches[0].pageX
            : (<MouseEvent>ev).pageX;
        const dataset = getDataSetWrapper(el);
        const range = <HTMLElement>el.querySelector('.rateit-range');
        const rangeComputedStyle = window.getComputedStyle(range);

        const offsetLeft = range.getBoundingClientRect().left + document.body.scrollLeft;
        const rangeWidth = parseInt(rangeComputedStyle.width);
        let offsetx = pageX - offsetLeft;
        if (rangeComputedStyle.direction === 'rtl') { offsetx = parseInt(rangeComputedStyle.width) - offsetx };
        if (offsetx > rangeWidth) { offsetx = rangeWidth; }
        if (offsetx < 0) { offsetx = 0; }

        return Math.ceil(offsetx / dataset.getNumber('starwidth') * (1 / dataset.getNumber('step')));
    }


    private redraw(element: HTMLElement) {
        const dataset = getDataSetWrapper(element);

        const isfont = dataset.getString('mode') === 'font';
        const range = <HTMLElement>element.querySelector('.rateit-range');
        let rangeComputedStyle = window.getComputedStyle(range);
        const ltr = rangeComputedStyle.direction === 'ltr';

        //resize the height of all elements, 
        if (!isfont) {
            Array.prototype.forEach.call(element.querySelectorAll('.rateit-selected, .rateit-hover'), function (item: HTMLElement) {
                item.style.height = `${dataset.getNumber('starheight')}px`;
            });
        }

        if (isfont) {

            element.classList.add('rateit-font');
            element.classList.remove('rateit-bg');

            //fill the ranges with the icons
            const icon = dataset.getString('icon');
            const stars = dataset.getNumber('max') - dataset.getNumber('min');

            let txt = '';
            for (let i = 0; i < stars; i++) {
                txt += icon;
            }

            Array.prototype.forEach.call(range.children, function (item: HTMLElement) {
                item.innerText = txt;
            });

            dataset.set('starwidth', parseInt(rangeComputedStyle.width) / (dataset.getNumber('max') - dataset.getNumber('min')));

        }
        else {

            element.classList.add('rateit-bg');
            element.classList.remove('rateit-font');

            Array.prototype.forEach.call(range.children, function (item: HTMLElement) {
                item.innerText = '';
            });

            //set the range element to fit all the stars.
            range.style.width = `${dataset.getNumber('starwidth') * (dataset.getNumber('max') - dataset.getNumber('min'))}px`;
            range.style.height = `${dataset.getNumber('starheight')}px`;
        }




        //add/remove the preset class
        const presetclass = `rateit-preset${(ltr) ? '' : '-rtl'}`;
        if (dataset.getBoolean('ispreset')) {
            element.querySelector('.rateit-selected').classList.add(presetclass);
        }
        else {
            element.querySelector('.rateit-selected').classList.remove(presetclass);
        }

        //set the value if we have it.
        if (dataset.getNumber('value') != null) {
            var score = (dataset.getNumber('value') - dataset.getNumber('min')) * dataset.getNumber('starwidth');
            (<HTMLElement>(element.querySelector('.rateit-selected'))).style.width = `${score}px`;
        }






        //sets the hover element based on the score.


        const resetbtn = <HTMLElement>element.querySelector('.rateit-reset');
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

    }

    private static getElementFromSelectorOrElement(selectorOrElement: any): HTMLElement {
        if (typeof (selectorOrElement) === 'string') {
            return <HTMLElement>document.querySelector(selectorOrElement);
        } else {
            return <HTMLElement>selectorOrElement;
        }
    }

    //touch converter http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/
    private static touchHandler(event: TouchEvent): void {

        var touches = event.changedTouches,
            first = touches[0],
            type = "";
        switch (event.type) {
            case "touchmove": type = "mousemove"; break;
            case "touchend": type = "mouseup"; break;
            default: return;
        }

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);

        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }

}



