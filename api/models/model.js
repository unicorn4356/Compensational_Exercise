/* A class representing your resource. At the moment, its name is Resource. But you
   can (and probalby should) rename it to whatever you are going to use as a Resource.
   At the moment the example resource has only a name. You can delete this property
   if you don't need it.

   Task 1 - Part 1: Replace the Resource class with a new class of your choosing, that
   has at least three properties: one string property, one number property, one boolean
   property, and - optionally - a date property.
   Then, adapt the initialization of the data at the end of this file (Task 2 - Part 2)
   so that you have some instances of your object available that can be served to the client.
 */
class Person {
    constructor(name, age, isActive, joinedDate = new Date()) {
        this.name = name;           // String-Eigenschaft
        this.age = age;             // Number-Eigenschaft
        this.isActive = isActive;   // Boolean-Eigenschaft
    }
}

/* A model managing a map of resources. The id of the object is used as key in the map. */
class Model {
    static ID = 1;

    constructor() {
        this.resources = new Map();
    }

    add(resource) {
        resource.id = Model.ID++;
        this.resources.set(resource.id, resource);
    }

    get(id) {
        this.checkId(id);
        return this.resources.get(id);
    }

    getAll() {
        return Array.from(this.resources.values());
    }

    checkId(id) {
        if (typeof id !== "number") {
            throw new Error(`Given id must be an number, but is a ${typeof id}`);
        }
    }

    create(resource) {
        this.add(resource);
        return resource;    
    }

    update(id, resource) {
        this.checkId(id);

        const target = this.resources.get(id);
        if (!target) {
            throw new Error(`Resource with ${id} does not exist and cannot be updated.`)
        }

        Object.assign(target, resource);

        return target;
    }

    delete = (id) => {
        this.checkId(id);
        return this.resources.delete(id);
    }
}

const model = new Model();

/* Task 1 - Part 2. Replace these three instances of the example Class Resource with instances
   of your own class */
model.add(new Person("Alice", 30, true, new Date('2020-01-01')));
model.add(new Person("Bob", 25, false, new Date('2021-06-15')));
model.add(new Person("Charlie", 40, true, new Date('2019-09-20')));   

module.exports = model;
