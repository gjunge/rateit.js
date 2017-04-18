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

type RateItItemDataTypes = "init" | "value" | "min" | "max" | "step" | "backingfld" | "readonly" | "ispreset" | "resetable" | "starwidth" | "starheight"| "mode"|"icon";
export class rateit {

    private index : number = 0;
    
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
            let getItemNumber = (key: RateItItemDataTypes): number => Number(item.dataset[key]);
            let getItemBoolean = (key: RateItItemDataTypes): boolean => Boolean(item.dataset[key]);
            let getItemString = (key: RateItItemDataTypes): string => item.dataset[key];
            let setItem = (key: RateItItemDataTypes, value: any) => item.dataset[key] = value.toString();
            item.classList.add('rateit');

            let ltr = item.style.direction === 'ltr';

            setItem('mode',         getItemNumber('mode') || options.mode)
            setItem('icon',         getItemNumber('icon') || options.icon)
            setItem('min',          isNaN(getItemNumber('min')) ? options.min : getItemNumber('min'))
            setItem('max',          isNaN(getItemNumber('max')) ? options.max : getItemNumber('max'))
            setItem('step',         item.dataset['step'] || options.step)
            setItem('resetable',    item.dataset['resetable'] !== undefined ? item.dataset['resetable'] : options.resetable)
            setItem('readonly',     item.dataset['readonly'] !== undefined ? item.dataset['readonly'] : options.readonly)
            setItem('ispreset',     item.dataset['ispreset'] !== undefined ? item.dataset['ispreset'] : options.ispreset)
            setItem('backingfld',   item.dataset['backingfld'] || options.backingfld)
            setItem('starwidth',    getItemNumber('starwidth') || options.starwidth)
            setItem('starheight',   getItemNumber('starheight') || options.starheight)
            setItem('value',        Math.max(getItemNumber('min'), Math.min(getItemNumber('max'), (!isNaN(getItemNumber('value')) ? getItemNumber('value') : options.value == null ? options.min : options.value))))

            if (getItemString('backingfld')) {
                //if we have a backing field, hide it, override defaults if range or select.
                const el = document.querySelector(getItemString('backingfld'));
                const fld = <HTMLInputElement>el;
                fld.style.display = 'none';
                if (fld.disabled || fld.readOnly) {
                    setItem('readonly', true);
                }

                if (el.nodeName === 'INPUT') {
                    if (fld.type === 'range' || fld.type === 'text') { //in browsers not support the range type, it defaults to text

                        setItem('min', parseInt(fld.getAttribute('min')) || getItemNumber('min')); //if we would have done fld.min it wouldn't have worked in browsers not supporting the range type.
                        setItem('max', parseInt(fld.getAttribute('max')) || getItemNumber('max'));
                        setItem('step', parseInt(fld.getAttribute('step')) || getItemNumber('step'));
                    }
                }

                if (el.nodeName == 'SELECT' && (<HTMLSelectElement>el).options.length > 1) {
                    let select = <HTMLSelectElement>el;
                    // If backing field is a select box with valuesrc option set to "index", use the indexes of its options; otherwise, use the values.
                    if (select.getAttribute('data-rateit-valuesrc') === 'index') {
                        setItem('min', (!isNaN(getItemNumber('min')) ? getItemNumber('min') : 0));
                        setItem('max', select.options[select.length - 1].index);
                        setItem('step', 1);
                    }
                    else {
                        setItem('min', (!isNaN(getItemNumber('min')) ? getItemNumber('min') : 0));
                        setItem('max', Number(select.options[select.length - 1].value));
                        setItem('step', Number(select.options[1].value) - Number(select.options[0].value));
                    }
                    //see if we have a option that as explicity been selected
                    var selectedOption = <HTMLOptionElement> select.querySelector('option[selected]');
                    if (selectedOption != null) {
                        // If backing field is a select box with valuesrc option set to "index", use the index of selected option; otherwise, use the value.
                        if (select.getAttribute('data-rateit-valuesrc') === 'index') {
                            setItem('value', selectedOption.index);
                        }
                        else {
                            setItem('value', selectedOption.value);
                        }
                    }
                }
                else {
                    //if it is not a select box, we can get's it's value using the val function. 
                    //If it is a selectbox, we always get a value (the first one of the list), even if it was not explicity set.
                    setItem('value', fld.value);
                }
            }

            //Create the necessary tags. For ARIA purposes we need to give the items an ID. So we use an internal index to create unique ids
            let element = item.nodeName === 'DIV' ? 'div' : 'span';
            this.index++;

            var html = `<button id="rateit-reset-${this.index}" type="button" data-role="none" class="rateit-reset" aria-label="' + $.rateit.aria.resetLabel + '" aria-controls="rateit-range-${this.index}"><span></span></button><${element} id="rateit-range-${this.index}" class="rateit-range" tabindex="0" role="slider" aria-label="' + $.rateit.aria.ratingLabel + '" aria-owns="rateit-reset-${this.index}" aria-valuemin="' + itemdata('min') + '" aria-valuemax="' + itemdata('max') + '" aria-valuenow="' + itemdata('value') + '"><${element} class="rateit-empty"></${element}><${element} class="rateit-selected"></${element}><${element} class="rateit-hover"></${element}></${element}>`;
            item.insertAdjacentHTML('beforeend', html);

            if (!ltr) {
                (<HTMLElement>item.querySelector('.rateit-reset')).style.cssFloat  = 'right';
                (<HTMLElement>item.querySelector('.rateit-selected')).classList.add('rateit-selected-rtl');
                (<HTMLElement>item.querySelector('.rateit-hover')).classList.add('rateit-hover-rtl');
            }

            if (getItemString('mode') == 'font') {
                item.classList.add('rateit-font');
                item.classList.remove('rateit-bg');
            }
            else {
                item.classList.add('rateit-bg');
                item.classList.remove('rateit-font');
            }

            setItem('init', JSON.stringify(item.dataset));//cheap way to create a clone
        }


    }


    public reset(selector: string): void {


    }



}





