class Users {

    constructor() {
        this.users = []
    }

    addUser({name, customer_id, subscription_id, subscription_status, product_id, price_id, recurring}) {
        this.users.push({name, customer_id, subscription_id, subscription_status, product_id, price_id, recurring});
        console.log(this.users);
    }

    updateUser(customer_id, key, value) {
        const index = this.users.findIndex(user => user.customer_id === customer_id);
        this.users[index][key] = value
    }

    getUserProperty(customer_id, property) {
        this.users.forEach(user => { if(user.costumer_id === customer_id) return user[`${key}`] });
    }

    getUser(customer_id) {
        console.log(this.users);
        return this.users.find(user => user.customer_id === customer_id);
    }

    getAllUsers() {
        return this.users;
    }
}

const users = new Users();

module.exports = users;