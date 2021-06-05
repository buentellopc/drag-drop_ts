"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function validate(validators) {
    let isValid = true;
    if (validators.required) {
        isValid = isValid && validators.value.toString().length !== 0;
    }
    if (validators.minLength != null && typeof validators.value === "string") {
        isValid = isValid && validators.value.length >= validators.minLength;
    }
    if (validators.maxLength != null && typeof validators.value === "string") {
        isValid = isValid && validators.value.length <= validators.maxLength;
    }
    if (validators.min != null && typeof validators.value === "number") {
        isValid = isValid && validators.value >= validators.min;
    }
    if (validators.max != null && typeof validators.value === "number") {
        isValid = isValid && validators.value <= validators.max;
    }
    console.log(isValid);
    return isValid;
}
function autobind(_target, _methodName, descriptor) {
    const originalMethod = descriptor.value;
    console.log(originalMethod);
    const adjustedDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}
var Status;
(function (Status) {
    Status[Status["Active"] = 0] = "Active";
    Status[Status["Finished"] = 1] = "Finished";
})(Status || (Status = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, people) {
        let project = new Project(Math.random().toString(), title, description, people, Status.Active);
        this.projects.push(project);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
class Component {
    constructor(templateElId, hostElId, insertAtStart, newElId) {
        this.templateEl = document.getElementById(templateElId);
        this.hostEl = document.getElementById(hostElId);
        const importedNode = document.importNode(this.templateEl.content, true);
        this.element = importedNode.firstElementChild;
        if (newElId) {
            this.element.id = newElId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostEl.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get persons() {
        if (this.project.people === 1) {
            return `${this.project.people} person assigned`;
        }
        else {
            return `${this.project.people} persons assigned`;
        }
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(_) {
        console.log("hello");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons;
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    autobind
], ProjectItem.prototype, "dragEndHandler", null);
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.allProjects = [];
        projectState.addListener((projects) => {
            const filteredProjects = projects.filter((project) => {
                if (this.type === "active") {
                    return project.status === Status.Active;
                }
                return project.status === Status.Finished;
            });
            this.allProjects = filteredProjects;
            this.renderProjects();
        });
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            this.element.querySelector("ul").classList.add("droppable");
        }
    }
    dropHandler(event) {
        console.log("Drop is working now!!!!", event.dataTransfer.getData("text/plain"));
        const projectId = event.dataTransfer.getData("text/plain");
        projectState.moveProject(projectId, this.type === "active" ? Status.Active : Status.Finished);
    }
    dragLeaveHandler() {
        this.element.querySelector("ul").classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("drop", this.dropHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    renderProjects() {
        const ul = document.getElementById(`${this.type}-projects-list`);
        ul.innerHTML = "";
        for (const project of this.allProjects) {
            new ProjectItem(`${this.type}-projects-list`, project);
        }
    }
}
__decorate([
    autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dragLeaveHandler", null);
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleEl = this.element.querySelector("#title");
        this.descriptionEl = this.element.querySelector("#description");
        this.peopleEl = this.element.querySelector("#people");
        this.configure();
    }
    renderContent() { }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    clearInputs() {
        this.titleEl.value = "";
        this.descriptionEl.value = "";
        this.peopleEl.value = "";
    }
    collectInputs() {
        const title = this.titleEl.value;
        const description = this.descriptionEl.value;
        const people = this.peopleEl.value;
        const titleValidator = {
            value: title,
            required: true,
            minLength: 1,
        };
        const descriptionValidator = {
            value: description,
            required: true,
            minLength: 1,
        };
        const peopleValidator = {
            value: +people,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidator) ||
            !validate(descriptionValidator) ||
            !validate(peopleValidator)) {
            alert("Invalid input, please try again");
            return;
        }
        else {
            return [title, description, +people];
        }
    }
    submitHandler(e) {
        e.preventDefault();
        const inputValues = this.collectInputs();
        if (Array.isArray(inputValues)) {
            const [title, des, people] = inputValues;
            projectState.addProject(title, des, people);
            this.clearInputs();
        }
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
const Input = new ProjectInput();
const ActiveList = new ProjectList("active");
const FinishedeList = new ProjectList("finished");
//# sourceMappingURL=app.js.map