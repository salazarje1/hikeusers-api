const { BadRequestError } = require("../expressError"); 

function partialUpdate(data, toSql) {
    const keys = Object.keys(data); 
    if (keys.length === 0) throw new BadRequestError("No Data"); 

    const cols = keys.map((colName, idx) => `"${toSql[colName] || colName}"=$${idx + 1}`,);

    return {
        setCols: cols.join(", "),
        values: Object.values(data),
    }
}

module.exports = { partialUpdate }; 