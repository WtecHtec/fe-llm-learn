import { makeAutoObservable } from "mobx";


class WorkflowStore {

  selectedNode = null;

  constructor() {
    makeAutoObservable(this);
  }


  setSelectedNode(node) {
    this.selectedNode = node;
  }

}

export const workflowStore = new WorkflowStore();