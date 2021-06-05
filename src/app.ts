interface InputValidators {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validators: InputValidators) {
  let isValid = true;
  // If required is true, we must assure that the input has a value
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

function autobind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  console.log(originalMethod);

  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}

// ** Drag & Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum Status {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: Status
  ) {}
}

type Listener<T> = (projects: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    let project = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      Status.Active
    );
    this.projects.push(project);

    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: Status) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// ** Component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(
    templateElId: string,
    hostElId: string,
    insertAtStart: boolean,
    newElId?: string
  ) {
    this.templateEl = document.getElementById(
      templateElId
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElId)! as T;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElId) {
      this.element.id = newElId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  public get persons(): string {
    if (this.project.people === 1) {
      return `${this.project.people} person assigned`;
    } else {
      return `${this.project.people} persons assigned`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    // console.log(event);
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @autobind
  dragEndHandler(_: DragEvent) {
    console.log("hello");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    // An Li element
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  allProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.allProjects = [];
    projectState.addListener((projects: any[]) => {
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

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      this.element.querySelector("ul")!.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    console.log(
      "Drop is working now!!!!",
      event.dataTransfer!.getData("text/plain")
    );
    const projectId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? Status.Active : Status.Finished
    );
  }

  @autobind
  dragLeaveHandler() {
    this.element.querySelector("ul")!.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
  private renderProjects() {
    // console.log(this.allProjects);
    const ul = document.getElementById(`${this.type}-projects-list`)!;
    ul.innerHTML = "";

    // ! HERE IS THE BUG OF DUPLICATED PROJECTS, THERE COULD BE ELEMENTS ALREADY THAT GETS ADDED ANYWAY
    for (const project of this.allProjects) {
      // let li = document.createElement("li");

      // // TODO ANOTHER GOOD REASON TO HAVE A PROJECT CLASS, TS INFERANCE
      // li.append(project.title);
      // ul.append(li);
      new ProjectItem(`${this.type}-projects-list`, project);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

    const titleValidator: InputValidators = {
      value: title,
      required: true,
      minLength: 1,
    };

    const descriptionValidator: InputValidators = {
      value: description,
      required: true,
      minLength: 1,
    };

    const peopleValidator: InputValidators = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidator) ||
      !validate(descriptionValidator) ||
      !validate(peopleValidator)
    ) {
      alert("Invalid input, please try again");
      return;
    } else {
      return [title, description, +people];
    }
  }

  @autobind
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

const Input = new ProjectInput();
const ActiveList = new ProjectList("active");
const FinishedeList = new ProjectList("finished");
