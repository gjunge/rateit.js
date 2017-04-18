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
}

interface DataSetWrapper {

    getNumber(key: RateItItemDataTypes): number;
    getBoolean(key: RateItItemDataTypes): boolean;
    getString(key: RateItItemDataTypes): string;
    set(key: RateItItemDataTypes, value: any): void;
}

function getDataSetWrapper(item: HTMLElement): DataSetWrapper {
    return {
        getNumber: (key: RateItItemDataTypes): number => Number(this._item.dataset[key]),
        getBoolean: (key: RateItItemDataTypes): boolean => Boolean(this._item.dataset[key]),
        getString: (key: RateItItemDataTypes): string => this._item.dataset[key],
        set: (key: RateItItemDataTypes, value: any) => this._item.dataset[key] = value.toString()
    };
}

type RateItItemDataTypes = "init" | "value" | "min" | "max" | "step" | "backingfld" | "readonly" | "ispreset" | "resetable" | "starwidth" | "starheight" | "mode" | "icon";

export class rateit {

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
        resetable: false,
        ispreset: false
    };


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

            let ltr = item.style.direction === 'ltr';

            dataset.set('mode', dataset.getNumber('mode') || options.mode)
            dataset.set('icon', dataset.getNumber('icon') || options.icon)
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

            var html = `<button id="rateit-reset-${this.index}" type="button" data-role="none" class="rateit-reset" aria-label="' + $.rateit.aria.resetLabel + '" aria-controls="rateit-range-${this.index}"><span></span></button><${element} id="rateit-range-${this.index}" class="rateit-range" tabindex="0" role="slider" aria-label="' + $.rateit.aria.ratingLabel + '" aria-owns="rateit-reset-${this.index}" aria-valuemin="' + itemdata('min') + '" aria-valuemax="' + itemdata('max') + '" aria-valuenow="' + itemdata('value') + '"><${element} class="rateit-empty"></${element}><${element} class="rateit-selected"></${element}><${element} class="rateit-hover"></${element}></${element}>`;
            item.insertAdjacentHTML('beforeend', html);

            if (!ltr) {
                (<HTMLElement>item.querySelector('.rateit-reset')).style.cssFloat = 'right';
                (<HTMLElement>item.querySelector('.rateit-selected')).classList.add('rateit-selected-rtl');
                (<HTMLElement>item.querySelector('.rateit-hover')).classList.add('rateit-hover-rtl');
            }

            if (dataset.getString('mode') == 'font') {
                item.classList.add('rateit-font');
                item.classList.remove('rateit-bg');
            }
            else {
                item.classList.add('rateit-bg');
                item.classList.remove('rateit-font');
            }

            dataset.set('init', JSON.stringify(item.dataset));//cheap way to create a clone

            this.redraw(item);
        }



    }

    private redraw(element: HTMLElement) {
        var dataset = getDataSetWrapper(element);

        var isfont = dataset.getString('mode') === 'font';


        //resize the height of all elements, 
        if (!isfont) {
            Array.prototype.forEach.call(element.querySelectorAll('.rateit-selected, .rateit-hover'), function (item : HTMLElement) {
                item.style.height = `${dataset.getNumber('starheight')}px`;
            });

        }




    }

    public reset(element: HTMLElement): void
    public reset(selector: string): void
    public reset(selectorOrElement: any): void {
        let element: HTMLElement;
        if (typeof (selectorOrElement) === 'string') {
            element = <HTMLElement>document.querySelector(selectorOrElement);
        } else {
            element = selectorOrElement;
        }

        let dataset: DataSetWrapper = getDataSetWrapper(element);





    }



}



