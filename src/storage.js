let _taiko = null;
let _descEmitter = null;

class Storage {
    constructor(type) {
        this.type = type;
    }
    async setItem(key, value) {
        await _taiko.evaluate((_, args) => {
            let storage = args.type === 'local' ? localStorage : sessionStorage;
            let value = typeof args.value === 'object' ? JSON.stringify(args.value) : args.value;
            return storage.setItem(args.key, value);
        }, { returnByValue: true, args: { type: this.type, key: key, value: value } });
        _descEmitter.emit('success', 'Added "' + key + '" to ' + this.type + ' storage.');
    }

    async setItems(items) {
        await _taiko.evaluate(
            (_, args) => {
                let storage = args.type === 'local' ? localStorage : sessionStorage;

                return Promise.all(args.items.map(({ key, value }) => {
                    let transformedValue = typeof value === 'object' ? JSON.stringify(value) : value;
                    return storage.setItem(key, transformedValue);
                }));
            }, { returnByValue: true, args: { type: this.type, items } 
        });
        _descEmitter.emit('success', `Added [${Object.keys(items).map(x => `"${x}"`).join(", ")}] to ${this.type} storage.`);
    }

    async clear() {
        await _taiko.evaluate((_, args) => {
            let storage = args.type === 'local' ? localStorage : sessionStorage;
            return storage.clear();
        }, { returnByValue: true, args: { type: this.type } });
        _descEmitter.emit('success', 'Cleared ' + this.type + ' storage.');
    }

    async getItem(key) {
        let value = await _taiko.evaluate((_, args) => {
            let storage = args.type === 'local' ? localStorage : sessionStorage;
            return storage.getItem(args.key);
        }, { returnByValue: true, args: { type: this.type, key: key } });
        _descEmitter.emit('success', 'Retrieve value for "' + key + '" from ' + this.type + ' storage.');
        try {
            return JSON.parse(value);
        } catch (e) {
             _descEmitter.emit('success', 'Unable to parse value as JSON for "' + key + '" from ' + this.type + ' storage.');
             return value;
        }
    }

    async hasItem(key) {
        let res = await _taiko.evaluate((_, args) => {
            let storage = args.type === 'local' ? localStorage : sessionStorage;
            return storage.hasOwnProperty(args.key);
        }, { returnByValue: true, args: { type: this.type, key: key } });
        _descEmitter.emit('success', 'The item "' + key + '" is available in ' + this.type + ' storage.');
        return res;
    }

    async length(key) {
        let res = await _taiko.evaluate((_, args) => {
            let storage = args.type === 'local' ? localStorage : sessionStorage;
            return storage.length;
        }, { returnByValue: true, args: { type: this.type, key: key } });
        _descEmitter.emit('success', 'The length of ' + this.type + ' storage is ${res}.');
        return res;
    }

    async removeItem(key) {
        await _taiko.evaluate((_, args) => {
            let storage = args.type === 'local' ? localStorage : sessionStorage;
            return storage.removeItem(args.key);
        }, { returnByValue: true, args: { type: this.type, key: key } });
        _descEmitter.emit('success', 'Removed value for "' + key + '" from ' + this.type + ' storage.');
    }

    _setTaiko(taiko, descEmitter) {
        _taiko = taiko;
        _descEmitter = descEmitter;
    }
}

module.exports = Storage;

