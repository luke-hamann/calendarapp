export default class User {
  id: number;
  name: string;
  password: string;

  constructor(id: number, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }

  getErrors(): string[] {
    const errors = [];

    if (this.name == "") {
      errors.push("Please enter a name.");
    }

    if (this.password == "") {
      errors.push("Please enter a password.");
    }

    return errors;
  }

  isValid(): boolean {
    return (this.getErrors().length == 0);
  }
}
