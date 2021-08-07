const database = require('./database_controller');

class MySQL {
    static insert(table, res, parameter) {
        const values = [];
        var names = '(';
        const doc = Object.entries(parameter);
        var count = 0;
        var max = doc.length - 1;
        for (const [key, value] of doc) {
            if (count != max)
                names += key + ", ";
            else
                names += key + ")";
            values.push(value);
            count++;
        }
        const query = "INSERT INTO " + table + " " + names + " VALUES (?)";
        this.mQuery(query, (mError, result) => { console.log(mError); this.findById(table, result.insertId, res) }, [values]);
    }

    static updateById(table, id, res, parameter) {
        var names = '';
        const doc = Object.entries(parameter);
        if (doc.length > 0) {
            var count = 0;
            var max = doc.length - 1;
            for (const [key, value] of doc) {
                if (count != max)
                    names += key + "='" + value + "', ";
                else
                    names += key + "='" + value + "'";
                count++;
            }
            const query = "UPDATE " + table + " SET " + names + " WHERE id=" + id;
            this.mQuery(query, (mError, result) => {
                if (mError) res(mError);
                this.findById(table, id, res)
            });
        } else {
            res('No fields to update');
        }
    }

    static updateOne(table, where, res, parameter) {
        var names = '';
        const doc = Object.entries(parameter);
        if (doc.length > 0) {
            var count = 0;
            var max = doc.length - 1;
            for (const [key, value] of doc) {
                if (count != max)
                    names += key + "='" + value + "', ";
                else
                    names += key + "='" + value + "'";
                count++;
            }
            const query = "UPDATE " + table + " SET " + names + " WHERE " + where;
            this.mQuery(query, (mError, result) => {
                if (mError) res(mError);
                this.findOne(table, where, res)
            });
        } else {
            res('No fields to update');
        }

    }

    static findById(table, id, res, parameter) {
        var query = '';
        if (parameter != null)
            query = "SELECT " + parameter + " FROM " + table + " WHERE id =" + id;
        else
            query = "SELECT * FROM " + table + " WHERE id =" + id;
        this.mQuery(query, (err, data) => {
            res(err, data.length != 0 ? data[0] : null);
        });
    }


    static deleteById(table, id, res, parameter) {
        var query = "DELETE FROM " + table + " WHERE id =" + id;
        this.mQuery(query, (err, data) => {
            if (data == null) res(err, null);
            else res(err, data);
        });
    }


    static deleteOne(table, where, res, parameter) {
        var query = "DELETE FROM " + table + " WHERE " + where;
        this.mQuery(query, (err, data) => {
            if (data == null) res(err, null);
            else res(err, data);
        });
    }

    static findOne(table, where, res, parameter) {
        var query = '';
        if (parameter != null)
            query = "SELECT " + parameter + " FROM " + table + " WHERE " + where;
        else
            query = "SELECT * FROM " + table + " WHERE " + where;
        this.mQuery(query, (err, data) => {
            if (data[0] == null) res(err, null);
            else res(err, data[0]);
        });
    }

    static findALl(table, res, parameter, where) {
        var query = '';
        if (parameter != null)
            query = "SELECT " + parameter + " FROM " + table;
        else
            query = "SELECT * FROM " + table;

        if (where != null) query += " WHERE " + where;

        this.mQuery(query, res);
    }

    static findMany(table, where, res, parameter) {
        var query = '';
        if (parameter != null)
            query = "SELECT " + parameter + " FROM " + table + " WHERE " + where;
        else
            query = "SELECT * FROM " + table + " WHERE " + where;
        this.mQuery(query, res);
    }

    static findPaging(table, page, res, parameter, where) {
        const limit = 5;
        var skip = (parseInt(page) - 1) * limit;
        if (skip < 0) skip = 0;
        var query = '';
        if (parameter != null)
            query = "SELECT " + parameter + " FROM " + table + " LIMIT " + limit + " OFFSET " + skip;
        else
            query = "SELECT * FROM " + table + " LIMIT " + limit + " OFFSET " + skip;

        if (where != null) {
            const queries = query.split(table);
            query = queries[0] + table + " WHERE " + where + queries[1];
        }

        this.mQuery(query, res);
    }

    static mQuery(sql, callBack, parameter = []) {
        database.query(sql, parameter, callBack);
    }

}

module.exports = MySQL;


