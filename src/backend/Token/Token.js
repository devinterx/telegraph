
export default class Token {

    token = '';
    length = 15;
    symbolSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    constructor() {
        for (let i = 1; i < this.length; i++) {
            let random = Math.ceil(Math.random() * this.symbolSet.length) - 1;
            this.token = this.token + this.symbolSet[random];
        }
    }

    toString = () => this.token;
}