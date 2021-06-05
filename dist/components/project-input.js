var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Cmp from "./base-component.js";
import Autobind from "../decorators/autobind.js";
import * as Validate from "../util/validation.js";
import { projectState } from "../state/project-state.js";
export class ProjectInput extends Cmp {
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
        if (!Validate.validate(titleValidator) ||
            !Validate.validate(descriptionValidator) ||
            !Validate.validate(peopleValidator)) {
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
    Autobind
], ProjectInput.prototype, "submitHandler", null);
//# sourceMappingURL=project-input.js.map