/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.textContent = content;
        return this;
    }    

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

class Resource {

    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    creator
        .append(new ElementCreator("h2").text(resource.name))
    creator
        .append(new ElementCreator("p").text("Age: " + resource.age))

    resource.isActive ? creator.append(new ElementCreator("p").text("Active: Yes")) 
        : creator.append(new ElementCreator("p").text("Active: No"))

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', () => {
            remove(resource);  // Diese Zeile bleibt gleich
        }));
    

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.name));

    // Eingabefeld für den Namen
    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
        .append(new ElementCreator("input").id("resource-name").with("type", "text").with("value", resource.name));

    // Eingabefeld für das Alter
    formCreator
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number").with("value", resource.age));

    // Checkbox für den isActive-Status
    formCreator
        .append(new ElementCreator("label").text("Active").with("for", "resource-active"))
        .append(new ElementCreator("input").id("resource-active").with("type", "checkbox").with("checked", resource.isActive));

    // "Speichern"-Button mit Listener
    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            event.preventDefault();
            
            // Task 4 - Part 2: Werte in die Ressource übertragen
            resource.name = document.getElementById("resource-name").value;
            resource.age = parseInt(document.getElementById("resource-age").value, 10);
            resource.isActive = document.getElementById("resource-active").checked;

            // Task 4 - Part 3: PUT-Anfrage, um die Ressource zu aktualisieren
            updateResourceOnServer(resource)
                .then(() => {
                    // Wenn der PUT-Aufruf erfolgreich ist, die Ressource wieder in die Liste einfügen
                    add(resource, document.getElementById(resource.idforDOM));
                })
                .catch(error => {
                    console.error("Fehler beim Aktualisieren der Ressource:", error);
                });
        }))
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
}


function updateResourceOnServer(resource) {
    return fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resource)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren der Ressource');
        }
        return response.json();  // Korrektur: Rückgabe von response.json() ohne Neudeklaration
    })
    .then(updatedResource => {
        remove(resource);  // Alte Ressource wird entfernt
        return updatedResource;  // Aktualisierte Ressource wird zurückgegeben
    })
    .catch(error => {
        console.error("Fehler beim Aktualisieren der Ressource:", error);
    });
}




function remove(resource) {
    // Asynchrone Anfrage zur Löschung der Ressource
    fetch(`/api/resources/${resource.id}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                // Wenn die Anfrage erfolgreich war, entferne die Ressource aus dem DOM
                document.getElementById(resource.idforDOM).remove();
            } else {
                console.error("Fehler beim Löschen der Ressource");
            }
        })
        .catch(error => {
            console.error("Netzwerkfehler:", error);
        });
}

function create() {
    const formCreator = new ElementCreator("form")
        .id("create-resource-form")
        .append(new ElementCreator("h3").text("Create New Resource"));

    // Eingabefeld für den Namen
    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "new-resource-name"))
        .append(new ElementCreator("input").id("new-resource-name").with("type", "text"));

    // Eingabefeld für das Alter
    formCreator
        .append(new ElementCreator("label").text("Age").with("for", "new-resource-age"))
        .append(new ElementCreator("input").id("new-resource-age").with("type", "number"));

    // Checkbox für den isActive-Status
    formCreator
        .append(new ElementCreator("label").text("Active").with("for", "new-resource-active"))
        .append(new ElementCreator("input").id("new-resource-active").with("type", "checkbox"));

    // "Erstellen"-Button mit Listener für POST-Anfrage
    formCreator
        .append(new ElementCreator("button").text("Create").listener('click', (event) => {
            event.preventDefault();

            // Neue Ressource-Daten aus den Eingabefeldern
            const newResource = {
                name: document.getElementById("new-resource-name").value,
                age: parseInt(document.getElementById("new-resource-age").value, 10),
                isActive: document.getElementById("new-resource-active").checked
            };

            // POST-Anfrage, um die neue Ressource zu erstellen
            createResourceOnServer(newResource)
                .then(createdResource => {
                    // Wenn der POST-Aufruf erfolgreich ist, die neue Ressource zur Liste hinzufügen
                    add(Object.assign(new Resource(), createdResource));

                    // Formular aus dem DOM entfernen, nachdem die Ressource erfolgreich erstellt wurde
                    document.getElementById("create-resource-form").remove();
                })
                .catch(error => {
                    console.error("Fehler beim Erstellen der Ressource:", error);
                });
        }))
        .prependTo(document.querySelector('main'));  // Formular an den Anfang des Main-Tags hinzufügen
}


// POST-Anfrage an den Server senden, um eine neue Ressource zu erstellen
function createResourceOnServer(resource) {
    return fetch(`/api/resources`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resource)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Erstellen der Ressource');
        }
        return response.json();  // Die vom Server zurückgegebene Ressource (mit ID) wird zurückgegeben
    });
}

    

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

