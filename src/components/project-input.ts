import Cmp from "./base-component.js";
import Autobind from "../decorators/autobind.js";
import * as Validate from "../util/validation.js";
import { projectState } from "../state/project-state.js";

export class ProjectInput extends Cmp<HTMLDivElement, HTMLFormElement> {
  titleEl: HTMLInputElement;
  descriptionEl: HTMLTextAreaElement;
  peopleEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleEl = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionEl = this.element.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleEl = this.element.querySelector("#people") as HTMLInputElement;

    // this.hostEl.append(this.element);
    this.configure();
  }

  renderContent() {}

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private clearInputs() {
    this.titleEl.value = "";
    this.descriptionEl.value = "";
    this.peopleEl.value = "";
  }

  private collectInputs(): [string, string, number] | void {
    const title = this.titleEl.value;
    const description = this.descriptionEl.value;
    const people = this.peopleEl.value;

    const titleValidator: Validate.InputValidators = {
      value: title,
      required: true,
      minLength: 1,
    };

    const descriptionValidator: Validate.InputValidators = {
      value: description,
      required: true,
      minLength: 1,
    };

    const peopleValidator: Validate.InputValidators = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !Validate.validate(titleValidator) ||
      !Validate.validate(descriptionValidator) ||
      !Validate.validate(peopleValidator)
    ) {
      alert("Invalid input, please try again");
      return;
    } else {
      return [title, description, +people];
    }
  }

  @Autobind
  private submitHandler(e: Event) {
    e.preventDefault();
    // console.log("The inputs also need !");
    // console.log(this.titleEl.value);
    // console.log(this.descriptionEl.value);
    // console.log(this.peopleEl.value);

    const inputValues = this.collectInputs();

    if (Array.isArray(inputValues)) {
      const [title, des, people] = inputValues;
      // TODO HERE GOES THE ADD PROJECT METHOD
      // console.log(title, des, people);
      projectState.addProject(title, des, people);
      this.clearInputs();
    }
  }
}
