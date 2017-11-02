/*
 * Function for ask if it is empty
 */
function isEmpty(obj) {
    if (typeof obj === 'undefined' || obj === null || obj === '') return true;
    if (typeof obj === 'number' && isNaN(obj)) return true;
    return obj instanceof Date && isNaN(Number(obj));
}
