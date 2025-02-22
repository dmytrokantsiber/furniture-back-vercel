module.exports = class UserDto {
  email;
  id;
  name;
  surname;
  phone;
  orders;

  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.name = model.name;
    this.surname = model.surname;
    this.phone = model.phone;
    this.orders = model.orders;
  }
};
