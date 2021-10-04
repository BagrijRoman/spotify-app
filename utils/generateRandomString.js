const generateRandomString = (length = 8) => {
    let result = '';
    const values = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < length; i++) {
        const position = Math.floor(Math.random() * values.length);
        result += values.charAt(position);
    }

    return result;
};

module.exports = {
    generateRandomString,
};
