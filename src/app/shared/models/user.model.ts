import { Project } from './project.model';

export interface User {
  id: string;
  activeProjects: Project[];
}
