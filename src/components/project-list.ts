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
