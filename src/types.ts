export interface ProjectAnswers {
  project: {
    name: string;
    description: string;
    type: 'backend' | 'frontend' | 'cli' | 'library' | 'fullstack';
  };
  tech: {
    language: string;
    runtime: string;
    pkgManager: string;
    database: string;
  };
  commands: {
    install: string;
    dev: string;
    test: string;
    lint: string;
    format: string | null;
    build: string | null;
  };
  vcs: {
    tool: 'git' | 'jj';
    isolation: 'strict' | 'smart' | 'none';
    branchNaming: string;
    commitFormat: string;
    mergeStrategy: string;
  };
  constraints: {
    docLanguage: string;
    forbiddenCommands: string[];
  };
  principles: string[];
  review: {
    strictness: string;
    preCommitChecks: string[];
  };
  tasks: {
    style: string;
    acFormat: string;
  };
}

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}
